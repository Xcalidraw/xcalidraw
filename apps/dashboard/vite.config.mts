import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { federation } from "@module-federation/vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  server: {
    origin: "http://localhost:3001",
    host: "localhost",
    port: 3001,
    cors: true,
  },
  base: "http://localhost:3001",
  plugins: [
    react(),
    ...tailwindcss(),
    federation({
      name: "dashboard",
      manifest: true,
      exposes: {
        "./App": "./src/App.tsx",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
  build: {
    modulePreload: false,
    target: "chrome89",
    minify: false,
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@packages": path.resolve(__dirname, "../../packages"),
    },
  },
})
