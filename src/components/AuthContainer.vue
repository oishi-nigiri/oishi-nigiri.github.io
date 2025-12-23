<template>
  <div class="auth-container">
    <div v-if="isLoggedIn" class="user-profile">
      <img :src="avatarUrl" :alt="username" class="user-avatar-small">
      <span class="user-name">{{ username }}</span>
      <a v-if="isAuthorized" href="#/admin.html" class="admin-btn">Admin</a>
      <button @click="handleLogout" class="logout-btn-small">Déconnexion</button>
    </div>
    <button v-else @click="handleLogin" class="discord-login-btn-small">
      <svg width="16" height="16" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 49.9718 48.5383C51.038 50.6034 52.2584 52.5699 53.5959 54.435C53.6519 54.5139 53.7526 54.5477 53.845 54.5195C59.6464 52.7249 65.529 50.0174 71.6019 45.5576C71.6551 45.5182 71.6887 45.459 71.6943 45.3942C73.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
      </svg>
      Se connecter
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user, isAdmin, loginWithDiscord, logout, getAvatarUrl, getUsername, checkAuth } = useAuth()

const isLoggedIn = computed(() => !!user.value)
const isAuthorized = computed(() => isAdmin.value)
const username = computed(() => user.value ? getUsername(user.value) : '')
const avatarUrl = computed(() => user.value ? getAvatarUrl(user.value) : '')

const handleLogin = () => {
  loginWithDiscord()
}

const handleLogout = () => {
  logout()
}

onMounted(async () => {
  await checkAuth()
})
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  margin-right: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #c41e3a;
  object-fit: cover;
  flex-shrink: 0;
}

.user-name {
  color: #fff8f0;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.admin-btn {
  background: #c41e3a;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: inline-block;
}

.admin-btn:hover {
  background: #9a1629;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(196, 30, 58, 0.4);
}

.logout-btn-small {
  background: transparent;
  color: #fff8f0;
  border: 1px solid #fff8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: inherit;
}

.logout-btn-small:hover {
  background: #fff8f0;
  color: #1a1a1a;
}

.discord-login-btn-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #5865F2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: inherit;
}

.discord-login-btn-small:hover {
  background: #4752C4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(88, 101, 242, 0.4);
}

.discord-login-btn-small svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .auth-container {
    order: 3;
    width: 100%;
    justify-content: center;
    margin: 1rem 0 0 0;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .user-profile {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .user-name {
    font-size: 0.85rem;
  }

  .admin-btn,
  .logout-btn-small,
  .discord-login-btn-small {
    font-size: 0.8rem;
    padding: 0.4rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .auth-container {
    margin: 0.75rem 0 0 0;
    padding-top: 0.75rem;
  }

  .user-profile {
    gap: 0.375rem;
  }

  .user-avatar-small {
    width: 28px;
    height: 28px;
  }

  .user-name {
    font-size: 0.8rem;
  }

  .admin-btn,
  .logout-btn-small,
  .discord-login-btn-small {
    font-size: 0.75rem;
    padding: 0.35rem 0.65rem;
    width: 100%;
    justify-content: center;
  }
}
</style>

