<template>
  <div class="admin-page">
    <LoginScreen
      v-if="!isAuthenticated"
      @login="handleLogin"
      @googleLogin="handleGoogleLogin"
      :error="loginError"
    />
    <AdminPanel v-else :user="user" @logout="handleLogout" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../composables/useAuth";
import LoginScreen from "../components/admin/LoginScreen.vue";
import AdminPanel from "../components/admin/AdminPanel.vue";

const {
  user,
  isAdmin,
  permissions,
  checkAuth,
  loginWithEmail,
  loginWithGoogle,
  logout,
} = useAuth();
const isAuthenticated = ref(false);
const loginError = ref("");

// Watch for auth state changes
watch(
  [user, permissions],
  ([newUser, newPermissions]) => {
    isAuthenticated.value =
      !!newUser && Object.keys(newPermissions || {}).length > 0;
  },
  { immediate: true }
);

onMounted(async () => {
  await checkAuth();
});

const handleLogin = async (credentials) => {
  loginError.value = "";
  const result = await loginWithEmail(credentials.email, credentials.password);
  if (!result.success) {
    loginError.value = result.error;
  } else {
    // Actualiser la page après connexion réussie
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

const handleGoogleLogin = async () => {
  loginError.value = "";
  const result = await loginWithGoogle();
  if (!result.success) {
    loginError.value = result.error;
  } else {
    // Actualiser la page après connexion réussie
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

const handleLogout = async () => {
  await logout();
  isAuthenticated.value = false;
};
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
}
</style>
