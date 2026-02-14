<template>
  <div class="admin-panel">
    <!-- Sidebar -->
    <AdminSidebar
      :activeTab="activeTab"
      :permissions="permissions"
      :user="user"
      :mobileOpen="mobileMenuOpen"
      @tab-change="activeTab = $event"
      @logout="$emit('logout')"
      @close-mobile-menu="mobileMenuOpen = false"
      @toggle-mobile-menu="toggleMobileMenu"
      ref="sidebarRef"
    />

    <!-- Main Content -->
    <div
      class="admin-content"
      :class="{ 'sidebar-collapsed': sidebarCollapsed }"
    >
      <!-- Top Header -->
      <AdminHeader
        :activeTab="activeTab"
        @toggle-mobile-menu="toggleMobileMenu"
      />

      <!-- Page Content -->
      <main class="admin-main">
        <div class="content-wrapper">
          <MenuTab v-if="activeTab === 'menu' && hasPermission('menu')" />
          <TeamTab v-if="activeTab === 'team' && hasPermission('team')" />
          <SalesTab v-if="activeTab === 'sales' && hasPermission('sales')" />
          <HistoryTab
            v-if="activeTab === 'history' && hasPermission('history')"
          />
          <EmployeesTab
            v-if="activeTab === 'employees' && hasPermission('employees')"
          />
          <RanksTab v-if="activeTab === 'ranks' && hasPermission('ranks')" />
          <AdminsTab v-if="activeTab === 'admins' && hasPermission('admins')" />
          <LoginTrackingTab
            v-if="activeTab === 'login-tracking' && hasPermission('admins')"
            @change-tab="activeTab = $event"
          />
          <ReservationsTab v-if="activeTab === 'reservations'" />
        </div>
      </main>
    </div>

    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTheme } from "../../composables/useTheme";

// Initialiser le thème
useTheme();
import AdminSidebar from "./AdminSidebar.vue";
import AdminHeader from "./AdminHeader.vue";
import MenuTab from "./tabs/MenuTab.vue";
import TeamTab from "./tabs/TeamTab.vue";
import SalesTab from "./tabs/SalesTab.vue";
import HistoryTab from "./tabs/HistoryTab.vue";
import EmployeesTab from "./tabs/EmployeesTab.vue";
import RanksTab from "./tabs/RanksTab.vue";
import AdminsTab from "./tabs/AdminsTab.vue";
import LoginTrackingTab from "./tabs/LoginTrackingTab.vue";
import ReservationsTab from "./tabs/ReservationsTab.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = defineProps({
  user: Object,
});

const emit = defineEmits(["logout"]);

const {
  hasPermission: checkPermission,
  permissions: userPermissions,
  isSuperAdmin: userIsSuperAdmin,
} = useAuth();
const activeTab = ref("menu");
const sidebarRef = ref(null);
const sidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false);

const permissions = computed(() => userPermissions.value);

const hasPermission = (section) => {
  if (userIsSuperAdmin.value) return true;
  return permissions.value[section] === true;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// Surveiller l'état de la sidebar
watch(
  () => sidebarRef.value?.collapsed,
  (newVal) => {
    sidebarCollapsed.value = newVal || false;
  },
  { immediate: true }
);

onMounted(() => {
  // Déterminer l'onglet actif par défaut
  const visibleTabs = [
    "menu",
    "team",
    "sales",
    "history",
    "employees",
    "ranks",
    "admins",
    "login-tracking",
    "reservations",
  ];
  for (const tabName of visibleTabs) {
    if (hasPermission(tabName)) {
      activeTab.value = tabName;
      break;
    }
  }
});
</script>

<style>
/* ===== THEME VARIABLES ===== */
.admin-panel {
  --bg-primary: #0f1115;
  --bg-card: #1b1e26;
  --bg-secondary: #2a2e38;
  --bg-hover: rgba(42, 46, 56, 0.8);

  --border-color: #2a2e38;
  --border-subtle: rgba(42, 46, 56, 0.5);

  --text-primary: #ffffff;
  --text-secondary: #9aa0ab;
  --text-disabled: #4b5563;

  --accent-red: #e11d2e;
  --accent-red-hover: rgba(225, 29, 46, 0.9);
  --accent-green: #22c55e;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --transition: all 0.2s ease;

  --theme-toggle-bg: rgba(196, 30, 58, 0.15);
  --theme-toggle-border: rgba(196, 30, 58, 0.3);
  --theme-toggle-bg-hover: rgba(196, 30, 58, 0.25);
}

/* Light theme */
.theme-light .admin-panel {
  --bg-primary: #f5f7fa;
  --bg-card: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-hover: rgba(244, 245, 247, 0.8);

  --border-color: #e5e7eb;
  --border-subtle: rgba(229, 231, 235, 0.5);

  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-disabled: #9ca3af;

  --accent-red: #dc2626;
  --accent-red-hover: rgba(220, 38, 38, 0.9);
  --accent-green: #16a34a;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  --theme-toggle-bg: rgba(220, 38, 38, 0.1);
  --theme-toggle-border: rgba(220, 38, 38, 0.2);
  --theme-toggle-bg-hover: rgba(220, 38, 38, 0.15);
}
</style>

<style scoped>
/* ===== LAYOUT ===== */
.admin-panel {
  min-height: 100vh;
  display: flex;
  background: var(--bg-primary) !important;
  color: var(--text-primary);
  font-family: "Inter", sans-serif;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  background: var(--bg-primary) !important;
}

.admin-content.sidebar-collapsed {
  margin-left: 80px;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: var(--bg-primary) !important;
}

.content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  background: var(--bg-primary);
  padding: 2rem;
}

@media (max-width: 1024px) {
  .admin-content {
    margin-left: 0;
  }

  .content-wrapper {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .admin-main {
    padding: 1rem;
  }

  .content-wrapper {
    max-width: 100%;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .admin-main {
    padding: 0.75rem;
  }

  .content-wrapper {
    padding: 0.75rem;
  }
}
</style>
