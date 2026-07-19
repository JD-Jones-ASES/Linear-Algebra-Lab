// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

/**
 * GitHub Pages project site (when public): /Linear-Algebra-Lab/
 * CI deploy would set ASTRO_BASE=/Linear-Algebra-Lab. Local + e2e keep base `/`.
 */
const base = process.env.ASTRO_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://jd-jones-ases.github.io',
  base,
  integrations: [react()],
  vite: {
    optimizeDeps: {
      include: ['three', 'three/addons/controls/OrbitControls.js'],
    },
  },
});
