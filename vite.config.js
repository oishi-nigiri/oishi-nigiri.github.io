import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Détecter le base path pour GitHub Pages
function getBasePath() {
  // En développement, pas de base path
  if (process.env.NODE_ENV === 'development') {
    return '/'
  }
  
  // Pour GitHub Pages, utiliser le nom du repo si nécessaire
  // Le workflow GitHub Actions définit GITHUB_REPO automatiquement
  const repoName = process.env.GITHUB_REPO || ''
  
  // Si c'est un repo user/organization (username.github.io), pas de base path
  if (repoName.includes('.github.io') && !repoName.includes('/')) {
    return '/'
  }
  
  // Extraire le nom du repo depuis "username/repo-name"
  const repoNameOnly = repoName.split('/').pop() || ''
  
  // Si le repo se termine par .github.io, c'est un repo user/organization
  if (repoNameOnly.includes('.github.io')) {
    return '/'
  }
  
  // Sinon, utiliser le nom du repo comme base path
  return repoNameOnly ? `/${repoNameOnly}/` : '/'
}

export default defineConfig({
  plugins: [vue()],
  base: getBasePath(),
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})

