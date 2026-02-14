<template>
  <Transition name="fade">
    <div v-if="isVisible" class="disclaimer-overlay" @click.self="closeDisclaimer">
      <div class="disclaimer-modal">
        <div class="disclaimer-icon">
          <i class="fas fa-gamepad"></i>
        </div>
        <h2 class="disclaimer-title">Site Fictif</h2>
        <p class="disclaimer-text">
          Ce site est un site <strong>fictif</strong> créé dans le cadre du roleplay pour le serveur <strong>Grand Paris RP</strong>.
        </p>
        <p class="disclaimer-subtext">
          Toute ressemblance avec des personnes ou entreprises existantes est purement fortuite.
        </p>
        <button class="disclaimer-button" @click="closeDisclaimer">
          J'ai compris
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(false)

onMounted(() => {
  // Check if user has already seen the disclaimer in this session
  const hasSeenDisclaimer = sessionStorage.getItem('disclaimerSeen')
  if (!hasSeenDisclaimer) {
    isVisible.value = true
  }
})

const closeDisclaimer = () => {
  isVisible.value = false
  sessionStorage.setItem('disclaimerSeen', 'true')
}
</script>

<style scoped>
.disclaimer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
}

.disclaimer-modal {
  background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(255, 107, 107, 0.1);
  animation: modalSlideIn 0.4s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.disclaimer-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ff6b6b, #ff8a8a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 1.8rem;
  color: #1a1a1a;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.disclaimer-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 700;
}

.disclaimer-text {
  color: #e0e0e0;
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 0.8rem;
}

.disclaimer-text strong {
  color: #ff6b6b;
}

.disclaimer-subtext {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.8rem;
  font-style: italic;
}

.disclaimer-button {
  background: linear-gradient(135deg, #ff6b6b, #ff8a8a);
  color: #1a1a1a;
  border: none;
  padding: 0.9rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.disclaimer-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
}

.disclaimer-button:active {
  transform: translateY(0);
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .disclaimer-modal {
    padding: 2rem 1.5rem;
  }
  
  .disclaimer-title {
    font-size: 1.5rem;
  }
  
  .disclaimer-text {
    font-size: 0.95rem;
  }
}
</style>
