<template>
  <section id="accueil" class="hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="hero-kanji">美味しい</span>
        <span class="hero-name">Oishi Nigiri</span>
      </h1>
      <p class="hero-subtitle">Une expérience culinaire authentique du Japon</p>
      <a href="#/" @click.prevent="scrollToMenu" class="cta-button">Découvrir le Menu</a>
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
  background: linear-gradient(rgba(26, 26, 26, 0.6), rgba(26, 26, 26, 0.6)),
              url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="%232c1810" width="1200" height="800"/><path fill="%239a1629" d="M0 0 L1200 0 L1200 400 Q600 500 0 400 Z" opacity="0.3"/></svg>');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  color: #fff8f0;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, transparent 0%, rgba(26, 26, 26, 0.8) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  animation: fadeInUp 1s ease;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 4rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-kanji {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 3rem;
  color: #c41e3a;
}

.hero-name {
  font-size: 4rem;
  letter-spacing: 5px;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

.cta-button {
  display: inline-block;
  padding: 1rem 3rem;
  background: #c41e3a;
  color: #fff8f0;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  background: #9a1629;
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 0 1rem;
  }

  .hero-content {
    padding: 0 1rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-kanji {
    font-size: 2rem;
  }

  .hero-name {
    font-size: 2.5rem;
    letter-spacing: 3px;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    padding: 0 1rem;
  }

  .cta-button {
    padding: 0.9rem 2.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 100vh;
    min-height: 600px;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-kanji {
    font-size: 1.5rem;
  }

  .hero-name {
    font-size: 1.75rem;
    letter-spacing: 2px;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .cta-button {
    padding: 0.8rem 2rem;
    font-size: 0.9rem;
    width: auto;
    max-width: 90%;
  }
}
</style>

