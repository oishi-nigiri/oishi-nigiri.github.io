import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { initFirebase } from './composables/useFirebase'

// Initialiser Firebase
initFirebase()

createApp(App).use(router).mount('#app')

