<template>
  <nav class="admin-nav">
    <div class="admin-nav-header">
      <h2>
        <img :src="logoPath" alt="Oishi Nigiri" class="logo-img-admin">
        <span class="logo-kanji">美味しい</span>
        <span class="logo-text">Panel Admin</span>
      </h2>
      <a href="#/" class="home-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Accueil
      </a>
    </div>
    <div class="admin-nav-user">
      <img :src="avatarUrl" :alt="username" class="user-avatar">
      <div class="user-info">
        <span class="username">{{ username }}</span>
        <button @click="$emit('logout')" class="logout-btn">Déconnexion</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '../../composables/useAuth'

const props = defineProps({
  user: Object
})

defineEmits(['logout'])

const { getAvatarUrl, getUsername } = useAuth()

const username = computed(() => props.user ? getUsername(props.user) : 'Admin')
const avatarUrl = computed(() => props.user ? getAvatarUrl(props.user) : 'https://cdn.discordapp.com/embed/avatars/0.png')

// Gérer le chemin du logo pour GitHub Pages
const logoPath = computed(() => {
  return './logo.png'
})
</script>

<style scoped>
.admin-nav {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c1810 100%);
  color: white;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 100;
}

.admin-nav-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-nav-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  color: white;
  font-weight: 700;
}

.logo-img-admin {
  height: 50px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.logo-kanji {
  color: #c41e3a;
  font-size: 1.75rem;
}

.logo-text {
  color: #fff8f0;
  font-size: 1.25rem;
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: #c41e3a;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.home-btn:hover {
  background: #9a1629;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(196, 30, 58, 0.4);
}

.home-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.admin-nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #c41e3a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.username {
  font-weight: 600;
  font-size: 0.95rem;
}

.logout-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  transition: all 0.3s ease;
  padding: 0.25rem 0;
}

.logout-btn:hover {
  color: #c41e3a;
  text-decoration: none;
}

@media (max-width: 768px) {
  .admin-nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>

