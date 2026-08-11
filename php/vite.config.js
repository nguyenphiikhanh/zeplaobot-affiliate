import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vuePlugin from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from 'node:url';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        vuePlugin(),

        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: 'gzip',
            ext: '.gz',
            deleteOriginFile: false,
        }),
    ],

    optimizeDeps: {
        include: ['tinymce', '@tinymce/tinymce-vue'],
    },

    resolve: {
        alias: {
            '@': fileURLToPath(
                new URL('./resources/js/src', import.meta.url),
            ),
        },
    },

    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/echarts')) {
                        return 'vendor-echarts';
                    }
                    if (id.includes('node_modules/ant-design-vue') || id.includes('node_modules/@ant-design')) {
                        return 'vendor-antdesign';
                    }
                },
            },
        },
    },
});
