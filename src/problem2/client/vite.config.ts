import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
// Add loadEnv
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react(),
            tsconfigPaths(),
            nodePolyfills({
                include: ['crypto', 'buffer'],
            }),
        ],
        server: {
            port: Number(env.VITE_DEV_PORT) || 4040,
        },
        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
            },
        },
    };
});
