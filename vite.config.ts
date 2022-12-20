import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
    resolve: {
        alias: {
            '@': '/src',
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.d.ts', '.json'],
    },
    css: {
        preprocessorOptions: {
            scss: {
                javascriptEnabled: true,
            },
        },
    },
    server: {
        host: true,
        port: 8080,
    },
    plugins: [
        vuePlugin(),
        Components({
            resolvers: [VantResolver()],
        }),
    ],
})
