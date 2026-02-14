<template>
  <div class="admins-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Gestion des Administrateurs</h1>
    </div>

    <!-- Section Stats et Actions -->
    <div class="admins-overview-section">
      <div class="admins-header-block">
        <div class="admins-title-block">
          <h2 class="admins-title">Administrateurs</h2>
          <p class="admins-subtitle">{{ admins.length }} administrateur(s) enregistré(s)</p>
        </div>
        <div class="admins-kpis">
          <div class="kpi-item kpi-red">
            <span class="kpi-label">TOTAL</span>
            <span class="kpi-value">{{ admins.length }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">PERMISSIONS</span>
            <span class="kpi-value">{{ totalPermissions }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">SUPER ADMINS</span>
            <span class="kpi-value">{{ superAdminCount }}</span>
          </div>
          <div class="kpi-item kpi-orange">
            <span class="kpi-label">ACTIFS</span>
            <span class="kpi-value">{{ admins.length }}</span>
          </div>
        </div>
      </div>

      <div class="admins-actions">
        <button
          v-if="canManageAdmins"
          @click="openAdminModal()"
          class="btn-primary-admins"
        >
          <i class="fas fa-plus"></i>
          <span>Nouvel Admin</span>
        </button>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div v-if="!canManageAdmins" class="permission-denied">
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h3>Accès refusé</h3>
        <p>Vous n'avez pas les permissions pour gérer les administrateurs.</p>
      </div>
    </div>

    <div v-else class="admins-main-content">
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
              <label class="filter-label">Tri par</label>
              <select v-model="sortBy" class="filter-select">
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
                <option value="username-asc">Nom d'utilisateur (A-Z)</option>
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

        <div v-else-if="filteredAdmins.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-user-shield"></i>
          </div>
          <h3>
            {{ admins.length === 0 ? "Aucun administrateur enregistré" : "Aucun résultat" }}
          </h3>
          <p>
            {{
              admins.length === 0
                ? "Commencez par ajouter votre premier administrateur"
                : "Aucun administrateur ne correspond à vos critères"
            }}
          </p>
          <button
            v-if="admins.length === 0"
            @click="openAdminModal()"
            class="btn-primary-admins"
          >
            <i class="fas fa-plus"></i>
            <span>Ajouter un Administrateur</span>
          </button>
        </div>

        <div v-else class="table-wrapper">
          <table class="admins-table">
            <thead>
              <tr>
                <th>EMAIL</th>
                <th>NOM D'UTILISATEUR</th>
                <th>PERMISSIONS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in filteredAdmins" :key="admin.id">
                <td class="email-cell">
                  <i class="fas fa-envelope"></i>
                  <span>{{ admin.email }}</span>
                </td>
                <td class="username-cell">
                  <span v-if="admin.username" class="username-text">{{ admin.username }}</span>
                  <span v-else class="username-empty">Non défini</span>
                </td>
                <td class="permissions-cell">
                  <div class="permissions-badges">
                    <span
                      v-if="hasAllPermissions(admin)"
                      class="permission-badge permission-super"
                    >
                      <i class="fas fa-crown"></i>
                      Super Admin
                    </span>
                    <template v-else>
                      <span
                        v-for="perm in getActivePermissions(admin)"
                        :key="perm"
                        class="permission-badge"
                      >
                        {{ getPermissionLabel(perm) }}
                      </span>
                      <span v-if="getActivePermissions(admin).length === 0" class="permission-empty">
                        Aucune permission
                      </span>
                    </template>
                  </div>
                </td>
                <td class="actions-cell">
                  <button
                    @click="openAdminModal(admin)"
                    class="btn-icon"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteAdmin(admin.id)"
                    class="btn-icon btn-icon-danger"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AdminModal
      v-if="showAdminModal && canManageAdmins"
      :admin="editingAdmin"
      @close="closeAdminModal"
      @save="saveAdmin"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useFirestore } from "../../../composables/useFirestore";
import { useConfirm } from "../../../composables/useConfirm";
import { useAuth } from "../../../composables/useAuth";
import { getDb } from "../../../composables/useFirebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import AdminModal from "../modals/AdminModal.vue";

const { getAll, create, update, remove } = useFirestore();
const { isSuperAdmin, permissions } = useAuth();

const admins = ref([]);
const loading = ref(true);
const showAdminModal = ref(false);
const editingAdmin = ref(null);
const { confirm, alert } = useConfirm();

// Filters
const searchQuery = ref("");
const sortBy = ref("email-asc");
const filtersExpanded = ref(true);

const canManageAdmins = computed(() => {
  return isSuperAdmin.value || permissions.value.admins === true;
});

const totalPermissions = computed(() => {
  return admins.value.reduce((total, admin) => {
    const perms = admin.permissions || {};
    return total + Object.values(perms).filter(Boolean).length;
  }, 0);
});

const superAdminCount = computed(() => {
  return admins.value.filter((admin) => {
    const perms = admin.permissions || {};
    return Object.values(perms).every((v) => v === true);
  }).length;
});

const hasAllPermissions = (admin) => {
  const perms = admin.permissions || {};
  const values = Object.values(perms);
  return values.length > 0 && values.every((v) => v === true);
};

const getActivePermissions = (admin) => {
  const perms = admin.permissions || {};
  return Object.keys(perms).filter((key) => perms[key] === true);
};

const getPermissionLabel = (key) => {
  const labels = {
    menu: "Carte",
    team: "Équipe",
    sales: "Ventes",
    history: "Historique",
    employees: "Employés",
    ranks: "Grades",
    admins: "Admins",
    bonuses: "Primes",
    resetSales: "Réinit. Ventes",
  };
  return labels[key] || key;
};

const filteredAdmins = computed(() => {
  let filtered = [...admins.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (admin) =>
        admin.email.toLowerCase().includes(query) ||
        (admin.username && admin.username.toLowerCase().includes(query))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "email-asc":
        return a.email.localeCompare(b.email);
      case "email-desc":
        return b.email.localeCompare(a.email);
      case "username-asc":
        const usernameA = a.username || "";
        const usernameB = b.username || "";
        return usernameA.localeCompare(usernameB);
      default:
        return 0;
    }
  });

  return filtered;
});

const resetFilters = () => {
  searchQuery.value = "";
  sortBy.value = "email-asc";
};

const loadData = async () => {
  try {
    loading.value = true;
    admins.value = await getAll("admins");
    loading.value = false;
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    loading.value = false;
  }
};

const openAdminModal = async (admin = null, prefillEmail = null) => {
  if (!canManageAdmins.value) {
    await alert("Vous n'avez pas la permission de gérer les administrateurs.", {
      type: "warning",
    });
    return;
  }

  if (prefillEmail) {
    editingAdmin.value = {
      email: prefillEmail,
      permissions: {
        menu: false,
        team: false,
        sales: false,
        employees: false,
        ranks: false,
        admins: false,
      },
    };
  } else {
    editingAdmin.value = admin;
  }

  showAdminModal.value = true;
};

const closeAdminModal = () => {
  showAdminModal.value = false;
  editingAdmin.value = null;
};

const saveAdmin = async (adminData) => {
  try {
    const db = getDb();
    const data = {
      email: adminData.email,
      username: adminData.username || null,
      isAdmin: true,
      permissions: adminData.permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingAdmin.value && editingAdmin.value.id) {
      if (
        adminData.email.toLowerCase() !== editingAdmin.value.id.toLowerCase()
      ) {
        await deleteDoc(doc(db, "admins", editingAdmin.value.id));
        await setDoc(doc(db, "admins", adminData.email.toLowerCase()), data);
      } else {
        await update("admins", editingAdmin.value.id, data);
      }
    } else {
      await setDoc(doc(db, "admins", adminData.email.toLowerCase()), data);
    }

    closeAdminModal();
    loadData();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    await alert("Erreur lors de la sauvegarde", { type: "danger" });
  }
};

const deleteAdmin = async (id) => {
  if (!canManageAdmins.value) {
    await alert(
      "Vous n'avez pas la permission de supprimer des administrateurs.",
      { type: "warning" }
    );
    return;
  }

  const result = await confirm(
    "Êtes-vous sûr de vouloir supprimer cet administrateur ?",
    {
      type: "danger",
      title: "Supprimer un administrateur",
      confirmText: "Supprimer",
    }
  );
  if (!result) return;

  try {
    await remove("admins", id);
    loadData();
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    await alert("Erreur lors de la suppression", { type: "danger" });
  }
};

onMounted(() => {
  loadData();

  const db = getDb();
  onSnapshot(collection(db, "admins"), () => loadData());
});
</script>

<style scoped>
.admins-dashboard {
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

/* Admins Overview Section */
.admins-overview-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.admins-header-block {
  margin-bottom: 1rem;
}

.admins-title-block {
  margin-bottom: 0.75rem;
}

.admins-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.admins-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.admins-kpis {
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

.admins-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary-admins {
  background: #c41e3a;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}

.btn-primary-admins:hover {
  background: #a01a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(196, 30, 58, 0.3);
}

.permission-denied {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

/* Main Content with Sidebar */
.admins-main-content {
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
  border: 4px solid #2a2d35;
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
  margin: 0 0 1.5rem 0;
}

.table-wrapper {
  overflow-x: auto;
}

.admins-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.admins-table thead {
  background: var(--bg-secondary);
}

.admins-table th {
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

.admins-table th:first-child {
  padding-left: 1rem;
}

.admins-table th:last-child {
  text-align: center;
  padding-right: 1rem;
}

.admins-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
  vertical-align: middle;
  line-height: 1.5;
  box-sizing: border-box;
}

.admins-table td:first-child {
  padding-left: 1rem;
}

.admins-table td:last-child {
  text-align: center;
  padding-right: 1rem;
}

.admins-table tbody tr:hover {
  background: var(--bg-secondary);
}

.email-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.email-cell i {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.username-cell {
  white-space: nowrap;
}

.username-text {
  color: var(--text-primary);
}

.username-empty {
  color: var(--text-secondary);
  font-style: italic;
}

.permissions-cell {
  max-width: 400px;
}

.permissions-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.permission-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
}

.permission-badge.permission-super {
  background: #f59e0b;
  color: var(--text-primary);
  border-color: #f59e0b;
}

.permission-badge i {
  font-size: 0.6875rem;
}

.permission-empty {
  color: var(--text-secondary);
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

.btn-icon-danger:hover {
  border-color: #dc2626;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 1200px) {
  .admins-main-content {
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
