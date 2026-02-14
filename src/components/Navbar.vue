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
        <li><a href="#/" @click.prevent="scrollTo('reservation')">Réservation</a></li>
        <li><a href="#/" @click.prevent="scrollTo('apropos')">À Propos</a></li>
        <li><a href="#/" @click.prevent="scrollTo('equipe')">Équipe</a></li>
        <!-- <li><a href="./recrutement.html" @click="closeMenu">Recrutement</a></li> -->
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
  background: rgba(15, 15, 15, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1000;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-text-container {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-kanji {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 0.7rem;
  color: #e85a4f;
  font-weight: 600;
  letter-spacing: 1px;
}

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem;
  color: #fff;
  letter-spacing: 1px;
  font-weight: 500;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-menu a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: color 0.2s ease;
  padding: 0.5rem 0;
}

.nav-menu a:hover {
  color: #e85a4f;
}

.hamburger {
  display: none;
  cursor: pointer;
  width: 24px;
  height: 18px;
  position: relative;
  z-index: 1002;
}

.hamburger span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: #fff;
  border-radius: 1px;
  transition: all 0.25s ease;
}

.hamburger span:nth-child(1) { top: 0; }
.hamburger span:nth-child(2) { top: 8px; }
.hamburger span:nth-child(3) { top: 16px; }

.hamburger.active span:nth-child(1) {
  top: 8px;
  transform: rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  top: 8px;
  transform: rotate(-45deg);
}

.menu-overlay {
  display: none;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .logo-img {
    height: 32px;
  }

  .logo-kanji {
    font-size: 0.6rem;
  }

  .logo-text {
    font-size: 0.85rem;
  }

  .nav-menu {
    position: fixed;
    left: -100%;
    top: 52px;
    flex-direction: column;
    background: rgba(15, 15, 15, 0.98);
    width: 100%;
    text-align: center;
    transition: left 0.3s ease;
    padding: 1.5rem 0;
    gap: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-menu li {
    padding: 0.75rem 0;
  }

  .nav-menu a {
    font-size: 0.85rem;
  }

  .hamburger {
    display: block;
  }

  .menu-overlay {
    display: block;
    position: fixed;
    top: 52px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }
}

@media (max-width: 480px) {
  .logo-text-container {
    display: none;
  }
}
</style>

