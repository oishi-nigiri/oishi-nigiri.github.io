<template>
  <section id="accueil" class="hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="hero-kanji">美味しい</span>
        <span class="hero-name">Oishi Nigiri</span>
      </h1>
      <p class="hero-subtitle">Une expérience culinaire authentique du Japon</p>
      <div class="hero-btns">
        <a href="#/" @click.prevent="scrollToMenu" class="cta-button">Découvrir le Menu</a>
        <a href="#/" @click.prevent="scrollToReservation" class="cta-button highlighted">Réservation</a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

const scrollToMenu = () => {
  const element = document.getElementById('carte-semaine')
  if (element) {
    const offsetTop = element.offsetTop - 80
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}

const scrollToReservation = () => {
  const element = document.getElementById('reservation')
  if (element) {
    const offsetTop = element.offsetTop - 80
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset
    const heroContent = document.querySelector('.hero-content')
    if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.5}px)`
      heroContent.style.opacity = 1 - (scrolled / window.innerHeight)
    }
  })
})
</script>

<style scoped>
.hero {
  height: 100vh;
  min-height: 600px;
  background: #0f0f0f;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  color: #fff;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 50% 0%, rgba(232, 90, 79, 0.08) 0%, transparent 50%);
}

.hero-overlay {
  display: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  animation: fadeIn 1s ease;
  padding: 2rem;
  max-width: 800px;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-kanji {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 1.2rem;
  color: #e85a4f;
  font-weight: 400;
  letter-spacing: 8px;
  text-transform: uppercase;
}

.hero-name {
  font-size: 4rem;
  font-weight: 400;
  letter-spacing: 12px;
  text-transform: uppercase;
  color: #fff;
}

.hero-subtitle {
  font-size: 1rem;
  margin-bottom: 3rem;
  font-weight: 300;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.hero-btns {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: transparent;
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 400;
  font-size: 0.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.cta-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}

.cta-button.highlighted {
  background: #e85a4f;
  border-color: #e85a4f;
}

.cta-button.highlighted:hover {
  background: #f06c62;
  border-color: #f06c62;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(232, 90, 79, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 0 1.5rem;
    min-height: 500px;
  }

  .hero-content {
    padding: 1rem;
  }

  .hero-kanji {
    font-size: 0.9rem;
    letter-spacing: 4px;
  }

  .hero-name {
    font-size: 2.5rem;
    letter-spacing: 6px;
  }

  .hero-subtitle {
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  .cta-button {
    padding: 0.85rem 2rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .hero-kanji {
    font-size: 0.8rem;
    letter-spacing: 3px;
  }

  .hero-name {
    font-size: 1.8rem;
    letter-spacing: 4px;
  }

  .hero-subtitle {
    font-size: 0.8rem;
  }
}
</style>

