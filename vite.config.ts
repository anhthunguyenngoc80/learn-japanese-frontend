import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import legacy from "@vitejs/plugin-legacy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    legacy({
      targets: ["defaults", "not IE 11", "iOS >= 12"],
      modernPolyfills: true,
      renderLegacyChunks: true,
    }),
  ],
  build: {
    target: "es2015"
  }
})