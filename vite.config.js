import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React libraries
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],

                    // Firebase (largest dependency)
                    'firebase': [
                        'firebase/app',
                        'firebase/auth',
                        'firebase/firestore',
                        'firebase/storage'
                    ],

                    // UI Libraries
                    'ui-vendor': [
                        'react-hot-toast',
                        '@heroicons/react'
                    ],

                    // Admin Panel (separate chunk)
                    'admin': [
                        './src/admin/layout/AdminLayout.jsx',
                        './src/admin/pages/AdminDashboard.jsx'
                    ],

                    // POS Module (separate chunk)
                    'pos': [
                        './src/modules/pos/pages/ClinicDashboard.jsx',
                        './src/modules/pos/pages/Checkout.jsx'
                    ]
                }
            }
        },
        chunkSizeWarningLimit: 600, // Increase from default 500KB
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true
            }
        }
    },
    server: {
        port: 3004
    }
});
