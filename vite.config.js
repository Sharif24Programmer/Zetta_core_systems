import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    },
    resolve: {
        alias: {
            '@': '/src',
            '@core': '/src/core',
            '@modules': '/src/modules',
            '@shared': '/src/shared',
            '@admin': '/src/admin'
        }
    }
})
