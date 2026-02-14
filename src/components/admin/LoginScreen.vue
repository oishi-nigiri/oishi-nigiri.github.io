<template>
  <div class="login-screen">
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">
          <img :src="logoPath" alt="Oishi Nigiri" class="logo-img-login" />
          <span class="logo-kanji">美味しい</span>
          <span class="logo-text">Oishi Nigiri</span>
        </h1>
        <h2>Panel Administrateur</h2>
        <p class="login-subtitle">Connectez-vous pour accéder au panel</p>

        <!-- Formulaire de connexion email -->
        <form @submit.prevent="handleEmailLogin" class="login-form">
          <div class="form-group">
            <label for="admin-email">Email</label>
            <input
              id="admin-email"
              v-model="email"
              type="email"
              placeholder="admin@exemple.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="admin-password">Mot de passe</label>
            <input
              id="admin-password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
          </div>

          <button type="submit" class="email-login-btn" :disabled="loading">
            <span v-if="loading">Connexion...</span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <div class="divider">
          <span>ou</span>
        </div>

        <button
          @click="handleGoogleLogin"
          class="google-login-btn"
          :disabled="loading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#ffffff"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#ffffff"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#ffffff"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#ffffff"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Se connecter avec Google
        </button>

        <div v-if="error" class="error-message show">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const email = ref("");
const password = ref("");
const loading = ref(false);

defineProps({
  error: String,
});

const emit = defineEmits(["login", "googleLogin"]);

const handleEmailLogin = async () => {
  loading.value = true;
  emit("login", { email: email.value, password: password.value });
  loading.value = false;
};

const handleGoogleLogin = () => {
  emit("googleLogin");
};

// Gérer le chemin du logo pour GitHub Pages
const logoPath = computed(() => {
  return "./logo.png";
});
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
  background: linear-gradient(
    135deg,
    rgba(26, 26, 26, 0.95) 0%,
    rgba(44, 24, 16, 0.95) 100%
  );
  border: 1px solid rgba(196, 30, 58, 0.3);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(196, 30, 58, 0.1);
  text-align: center;
  animation: slideUp 0.4s ease-out;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #f5deb3;
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
  color: #f5deb3;
  letter-spacing: 2px;
  margin-top: 0.5rem;
  font-weight: 600;
}

.login-card h2 {
  color: #c41e3a;
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  font-family: "Noto Sans JP", sans-serif;
}

.login-subtitle {
  color: rgba(245, 222, 179, 0.7);
  margin-bottom: 2rem;
  font-size: 0.95rem;
  font-family: "Noto Sans JP", sans-serif;
}

.discord-login-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: #5865f2;
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
  font-family: "Noto Sans JP", sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.discord-login-btn:hover {
  background: #4752c4;
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
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
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

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #f5deb3;
  font-weight: 500;
  font-family: "Noto Sans JP", sans-serif;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(245, 222, 179, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #f5deb3;
  font-size: 1rem;
  font-family: "Noto Sans JP", sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #c41e3a;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
}

.form-group input::placeholder {
  color: rgba(245, 222, 179, 0.5);
}

.email-login-btn,
.google-login-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: "Noto Sans JP", sans-serif;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
}

.email-login-btn {
  background: linear-gradient(135deg, #c41e3a 0%, #a01830 100%);
  color: #f5deb3;
  box-shadow: 0 4px 16px rgba(196, 30, 58, 0.3);
}

.email-login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #a01830 0%, #8a1426 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(196, 30, 58, 0.4);
}

.google-login-btn {
  background: linear-gradient(135deg, #4285f4 0%, #357ae8 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(66, 133, 244, 0.3);
}

.google-login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #357ae8 0%, #2c6bd6 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(66, 133, 244, 0.4);
}

.email-login-btn:disabled,
.google-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.divider {
  margin: 1.5rem 0;
  position: relative;
  text-align: center;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(245, 222, 179, 0.2);
}

.divider span {
  background: linear-gradient(
    135deg,
    rgba(26, 26, 26, 0.95) 0%,
    rgba(44, 24, 16, 0.95) 100%
  );
  padding: 0 1rem;
  color: rgba(245, 222, 179, 0.6);
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}
</style>
