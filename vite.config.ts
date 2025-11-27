import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 注意：請將下面的 'repo-name' 改為您 GitHub repository 的實際名稱
  // 如果您的網址是 https://user.github.io/my-app/，這裡就填 '/my-app/'
  base: './', 
})