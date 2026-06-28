import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: false,        // Disable sourcemaps in production
    },
    css: {
        devSourcemap: false,     // Disable CSS sourcemaps in dev
    },
})