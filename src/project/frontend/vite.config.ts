import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dynamicImport from 'vite-plugin-dynamic-import'
import svgr from 'vite-plugin-svgr'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_CDN_URL, VITE_DEV_URL } = loadEnv(mode || 'dev', process.cwd())
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    base: isProduction ? VITE_CDN_URL : '/',
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    server: {
      port: 3001,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: VITE_DEV_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    },
    plugins: [react(), dynamicImport(), svgr({ svgrOptions: { icon: true } })],
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: `@use "@/assets/styles/variable.scss" as *;@use "@/assets/styles/mixins.scss" as *;`
        }
      }
    }
  }
})
