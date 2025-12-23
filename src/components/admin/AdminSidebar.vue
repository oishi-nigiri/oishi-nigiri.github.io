<template>
  <aside class="admin-sidebar" :class="{ 'mobile-open': mobileOpen, 'collapsed': collapsed && isMobile }">
    <div class="sidebar-header">
      <div class="logo-section">
        <img src="/logo.png" alt="Oishi Nigiri" class="sidebar-logo" :class="{ 'hidden': collapsed && isMobile }">
        <div class="logo-text" :class="{ 'hidden': collapsed && isMobile }">
          <span class="logo-kanji">美味しい</span>
          <span class="logo-title">Admin</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="mobile-close" @click="mobileOpen = false" v-if="mobileOpen">
          <i class="fas fa-times"></i>
        </button>
        <button class="collapse-btn" @click="toggleCollapse" :title="collapsed ? 'Afficher la sidebar' : 'Masquer la sidebar'" v-if="isMobile">
          <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <div v-if="managementTabs.length > 0" class="nav-section">
        <div class="nav-section-title" :class="{ 'hidden': collapsed && isMobile }">Gestion</div>
        <button
          v-for="tab in managementTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id, 'collapsed': collapsed && isMobile }]"
          @click="selectTab(tab.id)"
        >
          <i :class="tab.icon"></i>
          <span :class="{ 'hidden': collapsed && isMobile }">{{ tab.label }}</span>
          <span v-if="tab.badge && !(collapsed && isMobile)" class="nav-badge">{{ tab.badge }}</span>
        </button>
      </div>
      
      <div v-if="configTabs.length > 0" class="nav-section">
        <div class="nav-section-title" :class="{ 'hidden': collapsed && isMobile }">Configuration</div>
        <button
          v-for="tab in configTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id, 'collapsed': collapsed && isMobile }]"
          @click="selectTab(tab.id)"
        >
          <i :class="tab.icon"></i>
          <span :class="{ 'hidden': collapsed && isMobile }">{{ tab.label }}</span>
        </button>
      </div>
    </nav>
    
    <div class="sidebar-footer" :class="{ 'hidden': collapsed && isMobile }">
      <div class="user-section">
        <div class="user-info-sidebar">
          <img :src="avatarUrl" :alt="username" class="user-avatar-sidebar">
          <div class="user-details-sidebar">
            <span class="username-sidebar">{{ username }}</span>
            <span class="user-role-sidebar">{{ userRole }}</span>
          </div>
        </div>
        <button @click="$emit('logout')" class="logout-btn-sidebar">
          <i class="fas fa-sign-out-alt"></i>
          Déconnexion
        </button>
      </div>
      <a href="#/" class="home-link">
        <i class="fas fa-home"></i>
        <span>Retour au site</span>
      </a>
    </div>
  </aside>
  
  <!-- Mobile overlay -->
  <div v-if="mobileOpen" class="mobile-overlay" @click="mobileOpen = false"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { getAvatarUrl, getUsername } = useAuth()

const props = defineProps({
  activeTab: String,
  permissions: Object,
  user: Object
})

const emit = defineEmits(['tab-change', 'logout'])

const mobileOpen = ref(false)
const collapsed = ref(false)
const isMobile = ref(false)

const tabs = [
  { id: 'menu', label: 'Carte', icon: 'fas fa-utensils', permission: 'menu', category: 'management' },
  { id: 'team', label: 'Équipe', icon: 'fas fa-users', permission: 'team', category: 'management' },
  { id: 'sales', label: 'Ventes', icon: 'fas fa-chart-line', permission: 'sales', category: 'management' },
  { id: 'history', label: 'Historique', icon: 'fas fa-history', permission: 'history', category: 'management' },
  { id: 'employees', label: 'Employés', icon: 'fas fa-user-tie', permission: 'employees', category: 'config' },
  { id: 'ranks', label: 'Grades', icon: 'fas fa-star', permission: 'ranks', category: 'config' },
  { id: 'admins', label: 'Administrateurs', icon: 'fas fa-shield-alt', permission: 'admins', category: 'config' }
]

const isSuperAdmin = computed(() => localStorage.getItem('isSuperAdmin') === 'true')

const visibleTabs = computed(() => {
  return tabs.filter(tab => {
    if (isSuperAdmin.value) return true
    return props.permissions[tab.permission] === true
  })
})

const managementTabs = computed(() => {
  return visibleTabs.value.filter(tab => tab.category === 'management')
})

const configTabs = computed(() => {
  return visibleTabs.value.filter(tab => tab.category === 'config')
})

const selectTab = (tabId) => {
  emit('tab-change', tabId)
  mobileOpen.value = false
}

const toggleCollapse = () => {
  if (isMobile.value) {
    collapsed.value = !collapsed.value
  }
}

// Gérer le responsive
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (window.innerWidth <= 1024) {
    mobileOpen.value = false
  }
  // Sur desktop, forcer la sidebar à être déployée
  if (window.innerWidth > 768 && collapsed.value) {
    collapsed.value = false
  }
}

onMounted(() => {
  handleResize() // Détecter le type d'appareil au démarrage
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const username = computed(() => props.user ? getUsername(props.user) : 'Admin')
const avatarUrl = computed(() => props.user ? getAvatarUrl(props.user) : 'https://cdn.discordapp.com/embed/avatars/0.png')

const userRole = computed(() => {
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
  return isSuperAdmin ? 'Super Admin' : 'Administrateur'
})
</script>

<style scoped>
.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a1a 0%, #2c1810 100%);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  transition: transform 0.3s ease, height 0.3s ease;
}



.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.logo-kanji {
  color: #c41e3a;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.logo-title {
  color: #fff8f0;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.mobile-close {
  display: none;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.mobile-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.collapse-btn {
  display: none;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background: rgba(196, 30, 58, 0.3);
  border-color: #c41e3a;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .collapse-btn {
    display: flex;
  }
}


.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section-title {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  font-family: 'Noto Sans JP', sans-serif;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #c41e3a;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  padding-left: 2rem;
}

.nav-item:hover::before {
  transform: scaleY(1);
}

.nav-item.active {
  background: rgba(196, 30, 58, 0.15);
  color: white;
  font-weight: 600;
}

.nav-item.active::before {
  transform: scaleY(1);
}

.nav-item.collapsed {
  padding: 0.875rem;
  justify-content: center;
}

.nav-item.collapsed span {
  display: none;
}

.nav-item.collapsed .nav-badge {
  display: none;
}

.hidden {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}

.sidebar-logo.hidden,
.logo-text.hidden,
.nav-section-title.hidden,
.sidebar-footer.hidden {
  opacity: 0;
  visibility: hidden;
}



.nav-item i {
  width: 20px;
  font-size: 1.1rem;
  text-align: center;
  flex-shrink: 0;
}

.nav-item span {
  flex: 1;
}

.nav-badge {
  background: #c41e3a;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info-sidebar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-sidebar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #c41e3a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.user-avatar-sidebar:hover {
  transform: scale(1.05);
}

.user-details-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
}

.username-sidebar {
  font-weight: 600;
  font-size: 0.95rem;
  color: white;
}

.user-role-sidebar {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.logout-btn-sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-family: 'Noto Sans JP', sans-serif;
  width: 100%;
}

.logout-btn-sidebar:hover {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.logout-btn-sidebar i {
  font-size: 0.9rem;
}

.home-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(196, 30, 58, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid rgba(196, 30, 58, 0.3);
}

.home-link:hover {
  background: rgba(196, 30, 58, 0.3);
  transform: translateX(4px);
}

.home-link i {
  font-size: 1rem;
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
}

@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 280px;
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .mobile-close {
    display: block;
  }
  
  .mobile-overlay {
    display: block;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    max-width: 320px;
  }

  .sidebar-header {
    padding: 1rem;
  }

  .logo-section {
    gap: 0.75rem;
  }

  .sidebar-logo {
    width: 40px;
    height: 40px;
  }

  .logo-title {
    font-size: 1rem;
  }

  .logo-kanji {
    font-size: 1.2rem;
  }

  .nav-item {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }

  .sidebar-footer {
    padding: 1.25rem;
  }

  .user-avatar-sidebar {
    width: 40px;
    height: 40px;
  }

  .username-sidebar {
    font-size: 0.9rem;
  }

  .user-role-sidebar {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .admin-sidebar {
    width: 100%;
    max-width: 100%;
  }
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 280px;
  }

  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }

  .mobile-close {
    display: block;
  }

  .mobile-overlay {
    display: block;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    max-width: 320px;
    height: auto;
    min-height: 100vh;
    max-height: 100vh;
  }

  .admin-sidebar.collapsed {
    transform: translateX(-100%);
  }

  .sidebar-header {
    padding: 1rem;
  }

  .logo-section {
    gap: 0.75rem;
  }

  .sidebar-logo {
    width: 40px;
    height: 40px;
  }

  .logo-title {
    font-size: 1rem;
  }

  .logo-kanji {
    font-size: 1.2rem;
  }

  .nav-item {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }

  .sidebar-footer {
    padding: 1.25rem;
  }

  .user-avatar-sidebar {
    width: 40px;
    height: 40px;
  }

  .username-sidebar {
    font-size: 0.9rem;
  }

  .user-role-sidebar {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .admin-sidebar {
    width: 100%;
    max-width: 100%;
  }
}
</style>

