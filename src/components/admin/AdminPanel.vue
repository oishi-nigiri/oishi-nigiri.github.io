<template>
  <div class="admin-panel">
    <!-- Sidebar -->
    <AdminSidebar
      :activeTab="activeTab"
      :permissions="permissions"
      :user="user"
      @tab-change="activeTab = $event"
      @logout="$emit('logout')"
      ref="sidebarRef"
    />
    
    <!-- Main Content -->
    <div class="admin-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Top Header -->
      <AdminHeader :activeTab="activeTab" />
      
      <!-- Page Content -->
      <main class="admin-main">
        <div class="content-wrapper">
          <MenuTab v-if="activeTab === 'menu' && hasPermission('menu')" />
          <TeamTab v-if="activeTab === 'team' && hasPermission('team')" />
          <SalesTab v-if="activeTab === 'sales' && hasPermission('sales')" />
          <HistoryTab v-if="activeTab === 'history' && hasPermission('history')" />
          <EmployeesTab v-if="activeTab === 'employees' && hasPermission('employees')" />
          <RanksTab v-if="activeTab === 'ranks' && hasPermission('ranks')" />
          <AdminsTab v-if="activeTab === 'admins' && hasPermission('admins')" />
        </div>
      </main>
    </div>
    
    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'
import MenuTab from './tabs/MenuTab.vue'
import TeamTab from './tabs/TeamTab.vue'
import SalesTab from './tabs/SalesTab.vue'
import HistoryTab from './tabs/HistoryTab.vue'
import EmployeesTab from './tabs/EmployeesTab.vue'
import RanksTab from './tabs/RanksTab.vue'
import AdminsTab from './tabs/AdminsTab.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps({
  user: Object
})

const emit = defineEmits(['logout'])

const { hasPermission: checkPermission } = useAuth()
const activeTab = ref('menu')
const sidebarRef = ref(null)
const sidebarCollapsed = ref(false)

const permissions = computed(() => {
  const perms = {}
  const permsStr = localStorage.getItem('adminPermissions')
  if (permsStr) {
    try {
      return JSON.parse(permsStr)
    } catch {
      return {}
    }
  }
  return perms
})

const hasPermission = (section) => {
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
  if (isSuperAdmin) return true
  return permissions.value[section] === true
}

// Surveiller l'état de la sidebar
watch(() => sidebarRef.value?.collapsed, (newVal) => {
  sidebarCollapsed.value = newVal || false
}, { immediate: true })

onMounted(() => {
  // Déterminer l'onglet actif par défaut
  const visibleTabs = ['menu', 'team', 'sales', 'history', 'employees', 'ranks', 'admins']
  for (const tabName of visibleTabs) {
    if (hasPermission(tabName)) {
      activeTab.value = tabName
      break
    }
  }
})
</script>

<style scoped>
.admin-panel {
  min-height: 100vh;
  display: flex;
  background: #f5f7fa;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
}

.admin-content.sidebar-collapsed {
  margin-left: 80px;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 1024px) {
  .admin-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .admin-main {
    padding: 1rem;
  }

  .content-wrapper {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .admin-main {
    padding: 0.75rem;
  }
}
</style>
