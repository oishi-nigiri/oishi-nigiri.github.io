<template>
  <div class="auth-container">
    <div v-if="isLoggedIn" class="user-profile">
      <div class="user-card">
        <div class="user-header">
          <img :src="avatarUrl" :alt="username" class="user-avatar" />
          <div class="user-info">
            <span class="user-name">{{ username }}</span>
            <span class="user-role" v-if="isAuthorized">Administrateur</span>
          </div>
        </div>
        <div class="user-actions">
          <router-link v-if="isAuthorized" to="/admin.html" class="admin-btn">
            <span class="btn-text">Panel Admin</span>
            <svg
              class="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
                fill="currentColor"
              />
              <path
                d="M19 15L20.09 21.26L26 22L20.09 22.74L19 29L17.91 22.74L12 22L17.91 21.26L19 15Z"
                fill="currentColor"
                opacity="0.6"
              />
            </svg>
          </router-link>
          <button @click="handleLogout" class="logout-btn">
            <span class="btn-text">Déconnexion</span>
            <svg
              class="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 7L7 17M17 17L7 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <button v-else @click="handleLogin" class="login-btn">
      <div class="login-content">
        <span class="login-text">Connexion</span>
        <div class="login-decoration">
          <span class="decoration-line"></span>
          <span class="decoration-dot"></span>
        </div>
      </div>
      <svg
        class="login-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"
          fill="currentColor"
        />
      </svg>
    </button>

    <!-- Login Modal -->
    <LoginModal :show="showLoginModal" @close="showLoginModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { getFirebaseAuth } from "../composables/useFirebase";
import LoginModal from "./LoginModal.vue";

const router = useRouter();
const { user, isAdmin, logout, getAvatarUrl, getUsername, checkAuth } =
  useAuth();

const showLoginModal = ref(false);

const isLoggedIn = computed(() => !!user.value);
const isAuthorized = computed(() => isAdmin.value);
const username = computed(() => (user.value ? getUsername(user.value) : ""));
const avatarUrl = computed(() => (user.value ? getAvatarUrl(user.value) : ""));

const handleLogin = () => {
  showLoginModal.value = true;
};

// Actualiser la page une seule fois après connexion réussie
onMounted(() => {
  const unsubscribe = getFirebaseAuth().onAuthStateChanged((user) => {
    if (user && !sessionStorage.getItem("login_refreshed")) {
      // Marquer qu'on a déjà actualisé après cette connexion
      sessionStorage.setItem("login_refreshed", "true");
      // Actualiser la page après connexion réussie
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });

  onUnmounted(() => {
    unsubscribe();
  });
});

const handleLogout = () => {
  logout();
};

onMounted(async () => {
  await checkAuth();
});
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
}

.user-profile {
  position: relative;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: transparent;
  padding: 0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(232, 90, 79, 0.5);
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.user-name {
  color: #fff;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.user-role {
  color: #e85a4f;
  font-size: 0.6rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-btn,
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.2s ease;
  text-decoration: none;
}

.admin-btn {
  background: #e85a4f;
  color: #fff;
  border: none;
}

.admin-btn:hover {
  background: #d04a3f;
}

.logout-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-btn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-text {
  position: relative;
}

.btn-icon {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.4rem 1rem;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: #e85a4f;
  border-color: #e85a4f;
}

.login-content {
  display: flex;
  align-items: center;
}

.login-text {
  position: relative;
}

.login-decoration {
  display: none;
}

.login-icon {
  display: none;
}

@media (max-width: 768px) {
  .auth-container {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .user-card {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .user-header {
    justify-content: center;
  }

  .user-actions {
    width: 100%;
    justify-content: center;
  }

  .admin-btn,
  .logout-btn {
    padding: 0.5rem 1rem;
  }

  .login-btn {
    width: 100%;
    justify-content: center;
    padding: 0.5rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .user-avatar {
    width: 28px;
    height: 28px;
  }

  .user-name {
    font-size: 0.75rem;
  }

  .user-role {
    font-size: 0.55rem;
  }

  .admin-btn,
  .logout-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.65rem;
  }
}
</style>
