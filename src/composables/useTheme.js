import { ref, watch } from 'vue'

const theme = ref('dark') // 'dark' or 'light'

const THEME_STORAGE_KEY = 'admin-theme'

// Charger le thème depuis le localStorage au démarrage
const loadTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme.value = savedTheme
    } else {
      theme.value = 'dark' // Par défaut dark
    }
    applyTheme(theme.value)
  }
}

// Appliquer le thème au document
const applyTheme = (newTheme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (newTheme === 'light') {
      root.classList.add('theme-light')
      root.classList.remove('theme-dark')
    } else {
      root.classList.add('theme-dark')
      root.classList.remove('theme-light')
    }
  }
}

// Initialiser le thème au chargement
if (typeof window !== 'undefined') {
  loadTheme()
}

export function useTheme() {
  // Basculer le thème
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme.value)
    }
    applyTheme(theme.value)
  }

  // Définir le thème explicitement
  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      theme.value = newTheme
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, theme.value)
      }
      applyTheme(theme.value)
    }
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light'
  }
}
