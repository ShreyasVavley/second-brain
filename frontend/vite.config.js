import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Add this if you are deploying to GitHub Pages or a subfolder
  base: './', 
  server: {
    port: 3000,
    // Add this to see detailed error overlays in the browser
    hmr: {
      overlay: true, 
    }
  }
})