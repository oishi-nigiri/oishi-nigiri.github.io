<template>
  <div class="login-screen">
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">
          <img :src="logoPath" alt="Oishi Nigiri" class="logo-img-login">
          <span class="logo-kanji">美味しい</span>
          <span class="logo-text">Oishi Nigiri</span>
        </h1>
        <h2>Panel Administrateur</h2>
        <p class="login-subtitle">Connectez-vous avec Discord pour accéder au panel</p>
        <button @click="$emit('login')" class="discord-login-btn">
          <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 49.9718 48.5383C51.038 50.6034 52.2584 52.5699 53.5959 54.435C53.6519 54.5139 53.7526 54.5477 53.845 54.5195C59.6464 52.7249 65.529 50.0174 71.6019 45.5576C71.6551 45.5182 71.6887 45.459 71.6943 45.3942C73.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
          </svg>
          Se connecter avec Discord
        </button>
        <div v-if="error" class="error-message show">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  error: String
})

defineEmits(['login'])

// Gérer le chemin du logo pour GitHub Pages
const logoPath = computed(() => {
  return './logo.png'
})
</script>

<style scoped>
.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c1810 0%, #1a1a1a 100%);
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 450px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  text-align: center;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logo-img-login {
  height: 80px;
  width: auto;
  object-fit: contain;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.logo-kanji {
  font-size: 3rem;
  color: #c41e3a;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(196, 30, 58, 0.2);
}

.logo-text {
  font-size: 1.5rem;
  color: #2c1810;
  letter-spacing: 2px;
  margin-top: 0.5rem;
  font-weight: 600;
}

.login-card h2 {
  color: #2c1810;
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
}

.login-subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.discord-login-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: #5865F2;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  font-family: 'Noto Sans JP', sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.discord-login-btn:hover {
  background: #4752C4;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.discord-login-btn:active {
  transform: translateY(0);
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #fee 0%, #fdd 100%);
  color: #ef4444;
  border-radius: 10px;
  display: none;
  border-left: 4px solid #ef4444;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-message.show {
  display: block;
}

@media (max-width: 768px) {
  .login-container {
    padding: 15px;
  }

  .login-card {
    padding: 2rem 1.5rem;
  }

  .logo-img-login {
    height: 60px;
  }

  .logo-kanji {
    font-size: 2.5rem;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .login-card h2 {
    font-size: 1.5rem;
  }

  .login-subtitle {
    font-size: 0.9rem;
  }

  .discord-login-btn {
    font-size: 1rem;
    padding: 0.875rem 1.25rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem 1.25rem;
    border-radius: 16px;
  }

  .logo-img-login {
    height: 50px;
  }

  .logo-kanji {
    font-size: 2rem;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .login-card h2 {
    font-size: 1.25rem;
  }

  .discord-login-btn {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }
}
</style>

