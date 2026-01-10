import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  /**
   * IMPORTANT
   * Repo = oishi-nigiri.github.io (user repo)
   * 👉 base DOIT être '/'
   */
  base: '/',

  /**
   * Les fichiers dans /public seront copiés tels quels à la racine du build
   * Exemple :
   * public/config.js  -> dist/config.js
   * public/404.html   -> dist/404.html
   */
  publicDir: 'public',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },

  server: {
    port: 3000,
    open: true
  }
})
