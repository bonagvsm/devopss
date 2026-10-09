import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Hanya untuk dev: frontend selalu memanggil path relatif /api.
    // Di produksi, nginx yang meneruskan /api ke backend (Tahap 4).
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.ts' },
});
