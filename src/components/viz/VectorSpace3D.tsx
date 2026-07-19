import { useEffect, useRef } from 'react';
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

/**
 * Interactive 3D vector diagram (Three.js).
 * Float display only — domain math stays in ℚ.
 */
export function VectorSpace3D({ vectors, planeSpan = null, title }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
      if (cancelled || !mountRef.current) return;

      const width = el.clientWidth || 400;
      const height = el.clientHeight || 300;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c1017);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(4.5, 3.2, 5.5);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      el.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      scene.add(new THREE.AmbientLight(0xffffff, 0.65));
      const dir = new THREE.DirectionalLight(0xffffff, 0.55);
      dir.position.set(5, 8, 3);
      scene.add(dir);

      // axes helper
      scene.add(new THREE.AxesHelper(2.2));

      const all = [
        ...vectors.map((d) => d.v),
        ...(planeSpan ? planeSpan : []),
      ];
      const maxA = maxAbsEntries(...all) * 1.2;
      const scale = 2.2 / maxA;

      if (planeSpan) {
        const [u, v] = planeSpan;
        const cross = [
          u[1] * v[2] - u[2] * v[1],
          u[2] * v[0] - u[0] * v[2],
          u[0] * v[1] - u[1] * v[0],
        ];
        const clen = Math.hypot(cross[0], cross[1], cross[2]);
        if (clen > 1e-9) {
          // Build a grid on the plane using u,v orthonormalized-ish for display
          const ul = Math.hypot(...u) || 1;
          const uu = u.map((x) => x / ul) as [number, number, number];
          let vv = v.map((x, i) => x - uu[i]! * (v[0] * uu[0] + v[1] * uu[1] + v[2] * uu[2])) as [
            number,
            number,
            number,
          ];
          const vl = Math.hypot(...vv) || 1;
          vv = vv.map((x) => x / vl) as [number, number, number];
          const geo = new THREE.BufferGeometry();
          const s = 1.8;
          const corners = [
            [-s, -s],
            [s, -s],
            [s, s],
            [-s, s],
          ].map(([a, b]) =>
            new THREE.Vector3(
              (uu[0] * a + vv[0] * b) ,
              (uu[1] * a + vv[1] * b) ,
              (uu[2] * a + vv[2] * b) ,
            ),
          );
          geo.setFromPoints([corners[0]!, corners[1]!, corners[2]!, corners[0]!, corners[2]!, corners[3]!]);
          const mat = new THREE.MeshBasicMaterial({
            color: 0x4ecdc4,
            transparent: true,
            opacity: 0.18,
            side: THREE.DoubleSide,
          });
          // Use triangle mesh
          const meshGeo = new THREE.BufferGeometry().setFromPoints([
            corners[0]!,
            corners[1]!,
            corners[2]!,
            corners[0]!,
            corners[2]!,
            corners[3]!,
          ]);
          meshGeo.computeVertexNormals();
          scene.add(new THREE.Mesh(meshGeo, mat));
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

        const shaft = new THREE.CylinderGeometry(0.025, 0.025, len * 0.88, 8);
        const mat = new THREE.MeshStandardMaterial({ color: d.color });
        const mesh = new THREE.Mesh(shaft, mat);
        mesh.position.copy(origin.clone().add(tip).multiplyScalar(0.44));
        mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dirV.clone().normalize(),
        );
        scene.add(mesh);

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

      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', onResize);
        controls.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === el) {
          el.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [vectors, planeSpan]);

  const summary = vectors.map((d) => d.label).join(', ');

  return (
    <div className="viz-panel">
      {title ? <p className="viz-panel__caption">{title}</p> : null}
      <div
        className="viz-3d-wrap"
        ref={mountRef}
        role="img"
        aria-label={`3D vector diagram: ${summary}. Drag to orbit.`}
      />
      <ul className="viz-legend">
        {vectors.map((d) => (
          <li key={d.id}>
            <i style={{ background: d.color }} aria-hidden="true" />
            {d.label}
          </li>
        ))}
      </ul>
      <p className="viz-panel__caption">
        Drag to orbit · scroll to zoom · display float · math stays exact ℚ
      </p>
    </div>
  );
}
