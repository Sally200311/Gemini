import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數 (包含 .env 檔案與系統環境變數)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './', // 確保資源路徑為相對路徑，適應 GitHub Pages 子目錄結構
    define: {
      // 關鍵設定：將編譯時的環境變數值注入到前端程式碼的 process.env.API_KEY 中
      // 這樣 services/api.ts 裡的 process.env.API_KEY 才能在部署後拿到值
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  }
})