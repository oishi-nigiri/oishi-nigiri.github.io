import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Admin from './pages/Admin.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/index.html', component: Home },
  { path: '/admin.html', component: Admin }
]

// Utilisation de hash mode pour GitHub Pages (fonctionne toujours, même avec sous-dossiers)
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

