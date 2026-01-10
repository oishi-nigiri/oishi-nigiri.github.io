<template>
  <header class="admin-header">
    <div class="header-left">
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <i class="fas fa-bars"></i>
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-item">{{ currentPageTitle }}</span>
      </div>
    </div>
    
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: String
})

const pageTitles = {
  menu: 'Gestion de la Carte',
  team: 'Gestion de l\'Équipe',
  sales: 'Gestion des Ventes',
  history: 'Historique des Ventes',
  employees: 'Gestion des Employés',
  ranks: 'Gestion des Grades',
  admins: 'Gestion des Administrateurs'
}

const currentPageTitle = computed(() => {
  return pageTitles[props.activeTab] || 'Panel Admin'
})

const toggleMobileMenu = () => {
  // Émettre un événement pour ouvrir le menu mobile
  const sidebar = document.querySelector('.admin-sidebar')
  if (sidebar) {
    sidebar.classList.toggle('mobile-open')
  }
}
</script>

<style scoped>
.admin-header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: none;
  color: #2c1810;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.mobile-menu-btn:hover {
  background: #f3f4f6;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-item {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c1810;
  letter-spacing: -0.5px;
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: block;
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 1rem;
  }
  
  .breadcrumb-item {
    font-size: 1.1rem;
  }
}
</style>

