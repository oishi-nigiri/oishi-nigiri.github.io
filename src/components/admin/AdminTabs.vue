<template>
  <div class="admin-tabs">
    <button 
      v-for="tab in visibleTabs" 
      :key="tab.id"
      :class="['tab-btn', { active: activeTab === tab.id }]"
      @click="$emit('tab-change', tab.id)"
    >
      <i :class="tab.icon"></i>
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: String,
  permissions: Object
})

defineEmits(['tab-change'])

const tabs = [
  { id: 'menu', label: 'Carte', icon: 'fas fa-utensils', permission: 'menu' },
  { id: 'team', label: 'Équipe', icon: 'fas fa-users', permission: 'team' },
  { id: 'sales', label: 'Ventes', icon: 'fas fa-money-bill-wave', permission: 'sales' },
  { id: 'history', label: 'Historique', icon: 'fas fa-history', permission: 'history' },
  { id: 'employees', label: 'Employés', icon: 'fas fa-user-tie', permission: 'employees' },
  { id: 'ranks', label: 'Grades', icon: 'fas fa-star', permission: 'ranks' },
  { id: 'admins', label: 'Admins', icon: 'fas fa-shield-alt', permission: 'admins' }
]

const isSuperAdmin = computed(() => localStorage.getItem('isSuperAdmin') === 'true')

const visibleTabs = computed(() => {
  return tabs.filter(tab => {
    if (isSuperAdmin.value) return true
    return props.permissions[tab.permission] === true
  })
})
</script>

<style scoped>
.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 3px solid #e0e0e0;
  overflow-x: auto;
  padding-bottom: 0;
}

.tab-btn {
  padding: 1rem 1.75rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: 'Noto Sans JP', sans-serif;
  position: relative;
  margin-bottom: -3px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0;
  height: 3px;
  background: #c41e3a;
  transition: width 0.3s ease;
}

.tab-btn:hover {
  color: #c41e3a;
  background: rgba(196, 30, 58, 0.05);
}

.tab-btn:hover::after {
  width: 100%;
}

.tab-btn.active {
  color: #c41e3a;
  border-bottom-color: #c41e3a;
  font-weight: 600;
}

.tab-btn.active::after {
  width: 100%;
}

.tab-btn i {
  font-size: 1rem;
}
</style>

