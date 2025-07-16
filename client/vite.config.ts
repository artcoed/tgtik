import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["pnlt71ovz4ox.share.zrok.io"] 
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/assets'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@features': path.resolve(__dirname, './src/features'),
      '@ui': path.resolve(__dirname, './src/shared/ui'),
      '@hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@api': path.resolve(__dirname, './src/shared/api'),
      '@layouts': path.resolve(__dirname, './src/app/layouts'),
      '@routes': path.resolve(__dirname, './src/app/routes'),
      '@redux/store': path.resolve(__dirname, './src/app/redux/stores'),
      '@contexts': path.resolve(__dirname, './src/app/contexts')
    },
  },
  plugins: [react()],
})
