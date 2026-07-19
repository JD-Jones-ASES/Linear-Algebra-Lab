import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { maxAbsEntries } from '../../lib/linalg/view';

export interface DrawnVec3 {
  id: string;
  v: [number, number, number];
  color: string;
  label: string;
  dashed?: boolean;
}

interface Props {
  vectors: DrawnVec3[];
  /** Two spanning vectors for a plane through origin in C(A) */
  planeSpan?: [[number, number, number], [number, number, number]] | null;
  title?: string;
}

/** Stable content key so parent re-renders with new array identities do not remount Three. */
function geometryKey(
  vectors: DrawnVec3[],
  planeSpan: Props['planeSpan'],
): string {
  return JSON.stringify({
    vectors: vectors.map((d) => [d.id, d.v, d.color, d.label, !!d.dashed]),
    planeSpan: planeSpan ?? null,
  });
}

const AXIS_LEN = 2.2;

/** Canvas sprite label that always faces the camera (x₁, x₂, x₃). */
function makeAxisLabel(
  text: string,
  color: string,
): { sprite: THREE.Sprite; texture: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '600 36px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Soft halo for contrast on dark scene
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(12, 16, 23, 0.9)';
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.55, 0.28, 1);
  return { sprite, texture };
}

function addAxisLabels(scene: THREE.Scene): THREE.CanvasTexture[] {
  // AxesHelper: X red, Y green, Z blue — match label colors
  const specs: Array<{
    text: string;
    color: string;
    pos: [number, number, number];
  }> = [
    { text: 'x₁', color: '#f07178', pos: [AXIS_LEN + 0.25, 0, 0] },
    { text: 'x₂', color: '#7dcea0', pos: [0, AXIS_LEN + 0.25, 0] },
    { text: 'x₃', color: '#5dade2', pos: [0, 0, AXIS_LEN + 0.25] },
  ];
  const textures: THREE.CanvasTexture[] = [];
  for (const s of specs) {
    const { sprite, texture } = makeAxisLabel(s.text, s.color);
    sprite.position.set(...s.pos);
    scene.add(sprite);
    textures.push(texture);
  }
  return textures;
}

/**
 * Interactive 3D vector diagram (Three.js).
 * Float display only — domain math stays in ℚ.
 *
 * Three is statically imported so Vite does not race dynamic-import optimize-dep 504s.
 * Effect deps use a content key so unstable parent array identities do not tear down the canvas.
 */
export function VectorSpace3D({ vectors, planeSpan = null, title }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const key = geometryKey(vectors, planeSpan);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    setError(null);
    let frame = 0;
    let disposed = false;

    try {
      const width = el.clientWidth || 400;
      const height = el.clientHeight || 300;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c1017);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(4.5, 3.2, 5.5);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      scene.add(new THREE.AmbientLight(0xffffff, 0.65));
      const dir = new THREE.DirectionalLight(0xffffff, 0.55);
      dir.position.set(5, 8, 3);
      scene.add(dir);
      scene.add(new THREE.AxesHelper(AXIS_LEN));
      const axisTextures = addAxisLabels(scene);

      const all = [
        ...vectors.map((d) => d.v),
        ...(planeSpan ? planeSpan : []),
      ];
      const maxA = maxAbsEntries(...all) * 1.2;
      const scale = AXIS_LEN / maxA;

      if (planeSpan) {
        const [u, v] = planeSpan;
        const cross = [
          u[1] * v[2] - u[2] * v[1],
          u[2] * v[0] - u[0] * v[2],
          u[0] * v[1] - u[1] * v[0],
        ];
        const clen = Math.hypot(cross[0], cross[1], cross[2]);
        if (clen > 1e-9) {
          const ul = Math.hypot(...u) || 1;
          const uu = u.map((x) => x / ul) as [number, number, number];
          let vv = v.map(
            (x, i) =>
              x - uu[i]! * (v[0] * uu[0] + v[1] * uu[1] + v[2] * uu[2]),
          ) as [number, number, number];
          const vl = Math.hypot(...vv) || 1;
          vv = vv.map((x) => x / vl) as [number, number, number];
          const s = 1.8;
          const corners = [
            [-s, -s],
            [s, -s],
            [s, s],
            [-s, s],
          ].map(
            ([a, b]) =>
              new THREE.Vector3(
                uu[0] * a! + vv[0] * b!,
                uu[1] * a! + vv[1] * b!,
                uu[2] * a! + vv[2] * b!,
              ),
          );
          const meshGeo = new THREE.BufferGeometry().setFromPoints([
            corners[0]!,
            corners[1]!,
            corners[2]!,
            corners[0]!,
            corners[2]!,
            corners[3]!,
          ]);
          meshGeo.computeVertexNormals();
          scene.add(
            new THREE.Mesh(
              meshGeo,
              new THREE.MeshBasicMaterial({
                color: 0x4ecdc4,
                transparent: true,
                opacity: 0.18,
                side: THREE.DoubleSide,
              }),
            ),
          );
        }
      }

      for (const d of vectors) {
        const origin = new THREE.Vector3(0, 0, 0);
        const tip = new THREE.Vector3(
          d.v[0] * scale,
          d.v[1] * scale,
          d.v[2] * scale,
        );
        const dirV = tip.clone().sub(origin);
        const len = dirV.length();
        if (len < 1e-9) continue;

        const mat = new THREE.MeshStandardMaterial({ color: d.color });
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, len * 0.88, 8),
          mat,
        );
        shaft.position.copy(origin.clone().add(tip).multiplyScalar(0.44));
        shaft.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dirV.clone().normalize(),
        );
        scene.add(shaft);

        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.07, len * 0.14, 12),
          mat,
        );
        cone.position.copy(tip.clone().lerp(origin, 0.07));
        cone.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dirV.clone().normalize(),
        );
        scene.add(cone);
      }

      if (disposed) {
        for (const tex of axisTextures) tex.dispose();
        renderer.dispose();
        controls.dispose();
        return;
      }

      el.replaceChildren();
      el.appendChild(renderer.domElement);

      const animate = () => {
        if (disposed) return;
        frame = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (disposed || !mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', onResize);
        for (const tex of axisTextures) tex.dispose();
        controls.dispose();
        renderer.dispose();
        el.replaceChildren();
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return () => {
        disposed = true;
      };
    }
    // Content key only — new array identities with same numbers must not remount
  }, [key]);

  const summary = vectors.map((d) => d.label).join(', ');

  return (
    <div className="viz-panel">
      {title ? <p className="viz-panel__caption">{title}</p> : null}
      {error ? (
        <p className="viz-fallback" role="alert">
          3D view failed to load: {error}
        </p>
      ) : (
        <div
          className="viz-3d-wrap"
          ref={mountRef}
          data-viz3d="true"
          role="img"
          aria-label={`3D vector diagram with axes x1, x2, x3: ${summary}. Drag to orbit.`}
        />
      )}
      <ul className="viz-legend">
        <li>
          <i style={{ background: '#f07178' }} aria-hidden="true" />
          x₁
        </li>
        <li>
          <i style={{ background: '#7dcea0' }} aria-hidden="true" />
          x₂
        </li>
        <li>
          <i style={{ background: '#5dade2' }} aria-hidden="true" />
          x₃
        </li>
        {vectors.map((d) => (
          <li key={d.id}>
            <i style={{ background: d.color }} aria-hidden="true" />
            {d.label}
          </li>
        ))}
      </ul>
      <p className="viz-panel__caption">
        Axes x₁, x₂, x₃ · drag to orbit · scroll to zoom · display float · math
        stays exact ℚ
      </p>
    </div>
  );
}
