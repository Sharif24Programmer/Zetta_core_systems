import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Only split the largest dependencies to avoid circular chunks
                    if (id.includes('node_modules')) {
                        // Firebase is the largest - split it out
                        if (id.includes('firebase')) {
                            return 'firebase';
                        }
                        // React core
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                            return 'react';
                        }
                        // Everything else stays in vendor
                        return 'vendor';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 700,
        minify: 'esbuild', // Use esbuild instead of terser (faster, built-in)
        target: 'es2015'
    },
    server: {
        port: 3004
    }
});
