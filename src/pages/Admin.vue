<template>
  <div class="admin-page">
    <LoginScreen v-if="!isAuthenticated" @login="handleLogin" />
    <AdminPanel v-else :user="user" @logout="handleLogout" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import LoginScreen from '../components/admin/LoginScreen.vue'
import AdminPanel from '../components/admin/AdminPanel.vue'

const { user, isAdmin, checkAuth, loginWithDiscord, logout } = useAuth()
const isAuthenticated = ref(false)

onMounted(async () => {
  const authenticated = await checkAuth()
  isAuthenticated.value = authenticated && isAdmin.value
})

const handleLogin = () => {
  loginWithDiscord()
}

const handleLogout = () => {
  logout()
  isAuthenticated.value = false
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
}
</style>




