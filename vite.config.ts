import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // For GitHub Pages project sites, set base to '/<repo-name>/'
  base: '/',
  plugins: [react(), tailwindcss()],
});
