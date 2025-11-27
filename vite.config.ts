/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// 在 ESM 模式下模擬 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './', // 確保資源路徑為相對路徑
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'), // 使用 __dirname 確保路徑準確指向根目錄
      },
    },
    define: {
      // 注入環境變數
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  }
})