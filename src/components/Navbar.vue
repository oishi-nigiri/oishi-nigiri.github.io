<template>
  <nav class="navbar">
    <div class="container">
      <div class="logo-section">
        <div 
          class="hamburger" 
          :class="{ active: menuOpen }" 
          @click="toggleMenu"
          aria-label="Menu"
          role="button"
          tabindex="0"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <a href="#/" class="logo">
          <img :src="logoPath" alt="Oishi Nigiri" class="logo-img">
          <div class="logo-text-container">
            <span class="logo-kanji">美味しい</span>
            <span class="logo-text">Oishi Nigiri</span>
          </div>
        </a>
      </div>
      <ul class="nav-menu" :class="{ active: menuOpen }">
        <li><a href="#/" @click.prevent="scrollTo('accueil')">Accueil</a></li>
        <li><a href="#/" @click.prevent="scrollTo('carte-semaine')">Menu</a></li>
        <li><a href="#/" @click.prevent="scrollTo('apropos')">À Propos</a></li>
        <li><a href="#/" @click.prevent="scrollTo('equipe')">Équipe</a></li>
        <li><a href="./recrutement.html" @click="closeMenu">Recrutement</a></li>
      </ul>
      <AuthContainer />
    </div>
    <!-- Overlay pour fermer le menu -->
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AuthContainer from './AuthContainer.vue'

const menuOpen = ref(false)

// Gérer le chemin du logo pour GitHub Pages
const logoPath = computed(() => {
  // Utiliser un chemin relatif qui fonctionne toujours
  return './logo.png'
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const scrollTo = (sectionId) => {
  closeMenu()
  // Attendre que le menu se ferme si on est sur mobile
  setTimeout(() => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 80 // Compenser la navbar fixe
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }, 100)
}

onMounted(() => {
  const navbar = document.querySelector('.navbar')
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        navbar.style.background = 'rgba(26, 26, 26, 0.98)'
      } else {
        navbar.style.background = 'rgba(26, 26, 26, 0.95)'
      }
    })
  }
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  flex-wrap: nowrap;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  line-height: 1.2;
}

.logo-img {
  height: 55px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-text-container {
  display: flex;
  flex-direction: column;
}

.logo-kanji {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 1.5rem;
  color: #c41e3a;
  font-weight: 700;
}

.logo-text {
  font-size: 1.2rem;
  color: #f5deb3;
  letter-spacing: 2px;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  flex: 1;
  justify-content: center;
  margin: 0 2rem;
}

.nav-menu a {
  color: #fff8f0;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-menu a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #c41e3a;
  transition: width 0.3s ease;
}

.nav-menu a:hover {
  color: #c41e3a;
}

.nav-menu a:hover::after {
  width: 100%;
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
  position: relative;
  z-index: 1002;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s ease;
  -webkit-transition: background 0.2s ease;
  width: 30px;
  height: 30px;
  min-width: 30px;
  min-height: 30px;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  background: rgba(26, 26, 26, 0.95);
}

.hamburger:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hamburger.active {
  background: rgba(255, 255, 255, 0.15);
}

.hamburger span {
  width: 25px;
  height: 3px;
  min-width: 25px;
  min-height: 3px;
  background: #fff8f0;
  transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
  border-radius: 2px;
  display: block;
  position: absolute;
  left: 50%;
  margin-left: -12.5px;
  transform-origin: center center;
  -webkit-transform-origin: center center;
  will-change: transform;
  opacity: 1;
}

.hamburger span:nth-child(1) {
  top: 8px;
}

.hamburger span:nth-child(2) {
  top: 13.5px;
}

.hamburger span:nth-child(3) {
  top: 19px;
}

.hamburger.active span:nth-child(1) {
  top: 13.5px !important;
  left: 50% !important;
  margin-left: -12.5px !important;
  transform: translateX(-50%) rotate(45deg) !important;
  -webkit-transform: translateX(-50%) rotate(45deg) !important;
  -ms-transform: translateX(-50%) rotate(45deg) !important;
}

.hamburger.active span:nth-child(2) {
  opacity: 0 !important;
  transform: translateX(-50%) scale(0) !important;
  -webkit-transform: translateX(-50%) scale(0) !important;
  -ms-transform: translateX(-50%) scale(0) !important;
  width: 0 !important;
  height: 0 !important;
}

.hamburger.active span:nth-child(3) {
  top: 13.5px !important;
  left: 50% !important;
  margin-left: -12.5px !important;
  transform: translateX(-50%) rotate(-45deg) !important;
  -webkit-transform: translateX(-50%) rotate(-45deg) !important;
  -ms-transform: translateX(-50%) rotate(-45deg) !important;
}

@media (max-width: 1024px) {
  .nav-menu {
    gap: 1.5rem;
    margin: 0 1rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .logo-img {
    height: 45px;
  }

  .logo-kanji {
    font-size: 1.2rem;
  }

  .logo-text {
    font-size: 1rem;
  }

  .nav-menu {
    position: fixed;
    left: -100%;
    top: 70px;
    flex-direction: column;
    background: #1a1a1a;
    width: 100%;
    text-align: center;
    transition: left 0.3s ease;
    padding: 2rem 0;
    margin: 0;
    gap: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-height: calc(100vh - 70px);
    overflow-y: auto;
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-menu li {
    width: 100%;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-menu a {
    display: block;
    padding: 0.5rem 0;
    font-size: 1.1rem;
  }

  .logo-section {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
  }

  .hamburger {
    display: flex !important;
    z-index: 1002 !important;
    position: relative !important;
    background: rgba(196, 30, 58, 0.9) !important;
    border: 2px solid #fff8f0 !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 35px !important;
    height: 35px !important;
    min-width: 35px !important;
    min-height: 35px !important;
    margin-right: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  }
  
  .hamburger span {
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
    background: #fff8f0 !important;
    width: 22px !important;
    height: 3px !important;
    min-width: 22px !important;
    min-height: 3px !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
  }

  .menu-overlay {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease;
    -webkit-animation: fadeIn 0.3s ease;
  }

  .hamburger.active {
    background: rgba(196, 30, 58, 0.9) !important;
    border: 2px solid #fff8f0 !important;
    box-shadow: 0 4px 12px rgba(196, 30, 58, 0.4) !important;
  }

  /* Règles spécifiques pour Edge et compatibilité zoom */
  @supports (-ms-ime-align: auto) {
    .hamburger.active span:nth-child(1) {
      top: 13.5px !important;
      left: 50% !important;
      margin-left: -12.5px !important;
      transform: translateX(-50%) rotate(45deg) !important;
      -ms-transform: translateX(-50%) rotate(45deg) !important;
    }

    .hamburger.active span:nth-child(2) {
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
    }

    .hamburger.active span:nth-child(3) {
      top: 13.5px !important;
      left: 50% !important;
      margin-left: -12.5px !important;
      transform: translateX(-50%) rotate(-45deg) !important;
      -ms-transform: translateX(-50%) rotate(-45deg) !important;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}

@media (max-width: 480px) {
  .logo-text-container {
    display: none;
  }

  .logo {
    gap: 0.5rem;
  }
}
</style>

