<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Connexion</h2>
        <button @click="closeModal" class="close-btn">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Email/Password Form -->
        <form
          v-if="!showRegister"
          @submit.prevent="handleEmailLogin"
          class="login-form"
        >
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="form-input"
              placeholder="votre@email.com"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="form-input"
              placeholder="••••••••"
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="login-submit-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <!-- Register Form -->
        <form v-else @submit.prevent="handleRegister" class="login-form">
          <div class="form-group">
            <label for="register-email" class="form-label">Email</label>
            <input
              id="register-email"
              v-model="email"
              type="email"
              required
              class="form-input"
              placeholder="votre@email.com"
            />
          </div>

          <div class="form-group">
            <label for="register-password" class="form-label"
              >Mot de passe</label
            >
            <input
              id="register-password"
              v-model="password"
              type="password"
              required
              minlength="6"
              class="form-input"
              placeholder="••••••••"
            />
          </div>

          <div class="form-group">
            <label for="confirm-password" class="form-label"
              >Confirmer le mot de passe</label
            >
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="form-input"
              placeholder="••••••••"
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="login-submit-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>S'inscrire</span>
          </button>
        </form>

        <div class="divider">
          <span class="divider-text">ou</span>
        </div>

        <!-- Google Login -->
        <button
          @click="handleGoogleLogin"
          class="google-btn"
          :disabled="loading"
        >
          <svg class="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>

        <!-- Toggle between login/register -->
        <div class="toggle-form">
          <button type="button" @click="toggleForm" class="toggle-btn">
            {{
              showRegister
                ? "Déjà un compte ? Se connecter"
                : "Pas de compte ? S'inscrire"
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showRegister = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
  errorMessage.value = "";
  loading.value = false;
};

const handleEmailLogin = async () => {
  if (!email.value || !password.value) return;

  loading.value = true;
  errorMessage.value = "";

  const result = await loginWithEmail(email.value, password.value);

  if (result.success) {
    closeModal();
  } else {
    errorMessage.value = getErrorMessage(result.error);
  }

  loading.value = false;
};

const handleRegister = async () => {
  if (!email.value || !password.value || !confirmPassword.value) return;

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  const result = await registerWithEmail(email.value, password.value);

  if (result.success) {
    closeModal();
  } else {
    errorMessage.value = getErrorMessage(result.error);
  }

  loading.value = false;
};

const handleGoogleLogin = async () => {
  loading.value = true;
  errorMessage.value = "";

  const result = await loginWithGoogle();

  if (result.success) {
    closeModal();
  } else {
    errorMessage.value = getErrorMessage(result.error);
  }

  loading.value = false;
};

const toggleForm = () => {
  showRegister.value = !showRegister.value;
  resetForm();
};

const getErrorMessage = (error) => {
  const errorMessages = {
    "auth/user-not-found": "Aucun utilisateur trouvé avec cet email",
    "auth/wrong-password": "Mot de passe incorrect",
    "auth/invalid-email": "Email invalide",
    "auth/user-disabled": "Ce compte a été désactivé",
    "auth/email-already-in-use": "Cet email est déjà utilisé",
    "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères",
    "auth/operation-not-allowed":
      "Cette méthode de connexion n'est pas activée",
    "auth/account-exists-with-different-credential":
      "Un compte existe déjà avec cet email",
    "auth/invalid-credential": "Informations de connexion invalides",
    "auth/popup-closed-by-user": "Fenêtre de connexion fermée",
    "auth/cancelled-popup-request": "Demande annulée",
  };

  return errorMessages[error] || "Une erreur est survenue. Veuillez réessayer.";
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(
    135deg,
    rgba(26, 26, 26, 0.95) 0%,
    rgba(44, 24, 16, 0.95) 100%
  );
  border: 1px solid rgba(196, 30, 58, 0.3);
  border-radius: 16px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(245, 222, 179, 0.1);
}

.modal-title {
  color: #f5deb3;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: "Noto Sans JP", sans-serif;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #f5deb3;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(245, 222, 179, 0.1);
  color: #c41e3a;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: #f5deb3;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: "Noto Sans JP", sans-serif;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid rgba(245, 222, 179, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #f5deb3;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #c41e3a;
  box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
}

.form-input::placeholder {
  color: rgba(245, 222, 179, 0.5);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.85rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.login-submit-btn {
  background: linear-gradient(135deg, #c41e3a 0%, #a01830 100%);
  color: #f5deb3;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  font-family: "Noto Sans JP", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #a01830 0%, #8a1426 100%);
  transform: translateY(-1px);
}

.login-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(245, 222, 179, 0.3);
  border-top: 2px solid #f5deb3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
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

.divider-text {
  background: linear-gradient(
    135deg,
    rgba(26, 26, 26, 0.95) 0%,
    rgba(44, 24, 16, 0.95) 100%
  );
  color: rgba(245, 222, 179, 0.7);
  padding: 0 1rem;
  font-size: 0.85rem;
  position: relative;
  z-index: 1;
}

.google-btn {
  width: 100%;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.google-btn:hover:not(:disabled) {
  background: #f8f8f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.google-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.toggle-form {
  text-align: center;
}

.toggle-btn {
  background: none;
  border: none;
  color: #c41e3a;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.toggle-btn:hover {
  color: #a01830;
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-header {
    padding: 1rem 1rem 0.5rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.3rem;
  }
}
</style>
