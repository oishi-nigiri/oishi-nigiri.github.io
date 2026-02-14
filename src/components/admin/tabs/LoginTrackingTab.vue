<template>
  <div class="login-tracking-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Suivi des Connexions</h1>
    </div>

    <!-- Section Stats et Actions -->
    <div class="login-overview-section">
      <div class="login-header-block">
        <div class="login-title-block">
          <h2 class="login-title">Connexions</h2>
          <p class="login-subtitle">{{ loginEvents.length }} événement(s) enregistré(s)</p>
        </div>
        <div class="login-kpis">
          <div class="kpi-item kpi-red">
            <span class="kpi-label">AUJOURD'HUI</span>
            <span class="kpi-value">{{ todaysLogins }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">ACTIFS</span>
            <span class="kpi-value">{{ activeUsers }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">SESSIONS</span>
            <span class="kpi-value">{{ averageSessionTime }} min</span>
          </div>
          <div class="kpi-item kpi-orange">
            <span class="kpi-label">TOTAL</span>
            <span class="kpi-value">{{ loginEvents.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="login-main-content">
      <!-- Left Column: Filters -->
      <div class="left-column">
        <!-- Filters Sidebar -->
        <div class="filters-sidebar">
          <div class="filters-header">
            <h3 class="filters-title">Filtres</h3>
            <button
              @click="filtersExpanded = !filtersExpanded"
              class="filters-toggle"
            >
              <i :class="filtersExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </button>
          </div>

          <div v-show="filtersExpanded" class="filters-content">
            <div class="filter-group">
              <label class="filter-label">Recherche</label>
              <div class="search-wrapper">
                <i class="fas fa-search"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Rechercher..."
                  class="search-input"
                />
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Type</label>
              <select v-model="typeFilter" class="filter-select">
                <option value="">Tous les types</option>
                <option value="success">Connexions réussies</option>
                <option value="failure">Échecs de connexion</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Tri par</label>
              <select v-model="sortBy" class="filter-select">
                <option value="date-desc">Date (récent)</option>
                <option value="date-asc">Date (ancien)</option>
                <option value="user-asc">Utilisateur (A-Z)</option>
              </select>
            </div>

            <button @click="resetFilters" class="btn-reset-filters">
              <i class="fas fa-times"></i>
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Chargement des données...</p>
        </div>

        <div v-else-if="filteredEvents.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-sign-in-alt"></i>
          </div>
          <h3>
            {{ loginEvents.length === 0 ? "Aucune connexion récente" : "Aucun résultat" }}
          </h3>
          <p>
            {{
              loginEvents.length === 0
                ? "Les connexions apparaîtront ici"
                : "Aucun événement ne correspond à vos critères"
            }}
          </p>
        </div>

        <div v-else class="table-wrapper">
          <table class="login-table">
            <thead>
              <tr>
                <th>UTILISATEUR</th>
                <th>DATE</th>
                <th>TYPE</th>
                <th>IP</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in filteredEvents" :key="event.id">
                <td class="user-cell">
                  <i class="fas fa-user"></i>
                  <span>{{ event.user || event.email || "Utilisateur" }}</span>
                </td>
                <td class="date-cell">
                  <i class="fas fa-clock"></i>
                  <span>{{ formatDate(event.timestamp) }}</span>
                </td>
                <td class="type-cell" :class="event.success ? 'type-success' : 'type-failure'">
                  <span class="type-badge">{{ event.type || "Connexion" }}</span>
                </td>
                <td class="ip-cell">
                  <span v-if="event.ip">{{ event.ip }}</span>
                  <span v-else class="ip-empty">Non disponible</span>
                </td>
                <td class="actions-cell">
                  <button
                    v-if="canManageAdmins && event.email && !isExistingAdmin(event.email)"
                    @click="quickAddAdmin(event.email)"
                    class="btn-icon"
                    title="Ajouter comme admin"
                  >
                    <i class="fas fa-user-plus"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useFirestore } from "../../../composables/useFirestore";
import { useAuth } from "../../../composables/useAuth";

const emit = defineEmits(["change-tab"]);

const { getAll } = useFirestore();
const { isSuperAdmin, permissions } = useAuth();

const loginEvents = ref([]);
const loading = ref(true);
const adminEmails = ref([]);

// Filters
const searchQuery = ref("")
const typeFilter = ref("")
const sortBy = ref("date-desc")
const filtersExpanded = ref(true)

const todaysLogins = computed(() => {
  const today = new Date().toDateString();
  return loginEvents.value.filter(
    (event) => new Date(event.timestamp).toDateString() === today
  ).length;
});

const activeUsers = computed(() => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const uniqueUsers = new Set(
    loginEvents.value
      .filter((event) => new Date(event.timestamp) > weekAgo)
      .map((event) => event.user || event.email)
  );
  return uniqueUsers.size;
});

const averageSessionTime = computed(() => {
  return "25";
});

const canManageAdmins = computed(() => {
  return isSuperAdmin.value || permissions.value.admins === true;
});

const isExistingAdmin = (email) => {
  return adminEmails.value.includes(email.toLowerCase());
};

const quickAddAdmin = (email = null) => {
  if (email) {
    sessionStorage.setItem("admin_prefill_email", email);
  }
  emit("change-tab", "admins");
};

const loadAdmins = async () => {
  try {
    const admins = await getAll("admins");
    adminEmails.value = admins
      .map((admin) => admin.email?.toLowerCase())
      .filter(Boolean);
  } catch (error) {
    console.error("Erreur lors du chargement des admins:", error);
  }
};

const filteredEvents = computed(() => {
  let filtered = [...loginEvents.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        (event.user && event.user.toLowerCase().includes(query)) ||
        (event.email && event.email.toLowerCase().includes(query)) ||
        (event.ip && event.ip.toLowerCase().includes(query))
    );
  }

  // Type filter
  if (typeFilter.value === "success") {
    filtered = filtered.filter((event) => event.success !== false);
  } else if (typeFilter.value === "failure") {
    filtered = filtered.filter((event) => event.success === false);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "date-desc":
        return new Date(b.timestamp) - new Date(a.timestamp);
      case "date-asc":
        return new Date(a.timestamp) - new Date(b.timestamp);
      case "user-asc":
        const userA = a.user || a.email || "";
        const userB = b.user || b.email || "";
        return userA.localeCompare(userB);
      default:
        return 0;
    }
  });

  return filtered;
});

const resetFilters = () => {
  searchQuery.value = ""
  typeFilter.value = ""
  sortBy.value = "date-desc"
}

const loadData = async () => {
  try {
    loading.value = true;
    const events = await getAll("login_events");

    loginEvents.value = events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map((event, index) => ({
        id: event.id || index,
        user: event.user || event.email || "Utilisateur inconnu",
        email: event.user || event.email,
        timestamp: event.timestamp,
        type:
          event.type ||
          (event.success ? "Connexion réussie" : "Échec de connexion"),
        method: event.method || "unknown",
        ip: event.ip || null,
        success: event.success !== false,
      }));

    loading.value = false;
  } catch (error) {
    console.error(
      "Erreur lors du chargement des événements de connexion:",
      error
    );
    loginEvents.value = [];
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString("fr-FR");
};

onMounted(() => {
  loadData();
  loadAdmins();
});
</script>

<style scoped>
.login-tracking-dashboard {
  padding: 1rem 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 1.5rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* Login Overview Section */
.login-overview-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.login-header-block {
  margin-bottom: 0;
}

.login-title-block {
  margin-bottom: 0.75rem;
}

.login-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.login-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.login-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.kpi-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: transparent;
}

.kpi-red .kpi-value {
  color: #c41e3a;
  font-weight: 700;
  font-size: 1.125rem;
}

.kpi-green .kpi-value {
  color: #16a34a;
  font-weight: 700;
  font-size: 1.125rem;
}

.kpi-orange .kpi-value {
  color: #f59e0b;
  font-weight: 700;
  font-size: 1.125rem;
}

.kpi-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.kpi-value {
  font-size: 1.125rem;
  font-weight: 700;
}

/* Main Content with Sidebar */
.login-main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Filters Sidebar */
.filters-sidebar {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  height: fit-content;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.filters-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.filters-toggle {
  background: none;
  border: none;
  color: #c41e3a;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.search-wrapper {
  position: relative;
}

.search-wrapper i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: #c41e3a;
}

.filter-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.filter-select:focus {
  outline: none;
  border-color: #c41e3a;
}

.btn-reset-filters {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.btn-reset-filters:hover {
  background: var(--bg-secondary);
  border-color: #3a3d45;
}

/* Table Section */
.table-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.loading-container {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  color: #c41e3a;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.login-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.login-table thead {
  background: var(--bg-secondary);
}

.login-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  white-space: nowrap;
}

.login-table th:first-child {
  padding-left: 1rem;
}

.login-table th:last-child {
  text-align: center;
  padding-right: 1rem;
}

.login-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
  vertical-align: middle;
  line-height: 1.5;
  box-sizing: border-box;
}

.login-table td:first-child {
  padding-left: 1rem;
}

.login-table td:last-child {
  text-align: center;
  padding-right: 1rem;
}

.login-table tbody tr:hover {
  background: var(--bg-secondary);
}

.user-cell {
  white-space: nowrap;
}

.user-cell i {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-right: 0.5rem;
  display: inline-block;
  vertical-align: middle;
}

.date-cell {
  white-space: nowrap;
}

.date-cell i {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-right: 0.5rem;
  display: inline-block;
  vertical-align: middle;
}

.type-cell {
  white-space: nowrap;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.type-success .type-badge {
  background: #16a34a;
  color: var(--text-primary);
}

.type-failure .type-badge {
  background: #dc2626;
  color: var(--text-primary);
}

.ip-cell {
  white-space: nowrap;
}

.ip-empty {
  color: #6b7280;
  font-style: italic;
  font-size: 0.8125rem;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-icon {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  border-color: #c41e3a;
  color: #c41e3a;
}

/* Responsive */
@media (max-width: 1200px) {
  .login-main-content {
    grid-template-columns: 1fr;
  }

  .left-column {
    order: 2;
  }

  .table-section {
    order: 1;
  }
}
</style>
