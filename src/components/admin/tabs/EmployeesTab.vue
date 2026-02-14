<template>
  <div class="employees-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Gestion des Employés</h1>
    </div>

    <!-- Section Stats et Actions -->
    <div class="employees-overview-section">
      <div class="employees-header-block">
        <div class="employees-title-block">
          <h2 class="employees-title">Employés</h2>
          <p class="employees-subtitle">{{ employees.length }} employé(s) enregistré(s)</p>
        </div>
        <div class="employees-kpis">
          <div class="kpi-item kpi-red">
            <span class="kpi-label">TOTAL</span>
            <span class="kpi-value">{{ employees.length }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">GRADES</span>
            <span class="kpi-value">{{ uniqueRanks }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">EMAIL</span>
            <span class="kpi-value">{{ employeesWithEmail }}</span>
          </div>
          <div class="kpi-item kpi-orange">
            <span class="kpi-label">POURCENTAGE</span>
            <span class="kpi-value">{{ emailPercentage }}%</span>
          </div>
        </div>
      </div>

      <div class="employees-actions">
        <button @click="openEmployeeModal()" class="btn-primary-employees">
          <i class="fas fa-plus"></i>
          <span>Nouvel Employé</span>
        </button>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="employees-main-content">
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
              <label class="filter-label">Grade</label>
              <select v-model="rankFilter" class="filter-select">
                <option value="">Tous les grades</option>
                <option v-for="rank in ranks" :key="rank.id" :value="rank.id">
                  {{ rank.name }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Email</label>
              <select v-model="emailFilter" class="filter-select">
                <option value="">Tous</option>
                <option value="with">Avec Email</option>
                <option value="without">Sans Email</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Tri par</label>
              <select v-model="sortBy" class="filter-select">
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="rank-asc">Grade (A-Z)</option>
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

        <div v-else-if="filteredEmployees.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-user-tie"></i>
          </div>
          <h3>
            {{ employees.length === 0 ? "Aucun employé enregistré" : "Aucun résultat" }}
          </h3>
          <p>
            {{
              employees.length === 0
                ? "Commencez par ajouter votre premier employé"
                : "Aucun employé ne correspond à vos critères"
            }}
          </p>
          <button
            v-if="employees.length === 0"
            @click="openEmployeeModal()"
            class="btn-primary-employees"
          >
            <i class="fas fa-plus"></i>
            <span>Ajouter un Employé</span>
          </button>
        </div>

        <div v-else class="table-wrapper">
          <table class="employees-table">
            <thead>
              <tr>
                <th>NOM</th>
                <th>GRADE</th>
                <th>EMAIL</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in filteredEmployees" :key="employee.id">
                <td class="name-cell">
                  <i class="fas fa-user"></i>
                  <span>{{ employee.name }}</span>
                </td>
                <td class="rank-cell">
                  <span class="rank-badge">
                    <i class="fas fa-star"></i>
                    {{ getRankName(employee.rankId) }}
                  </span>
                </td>
                <td class="email-cell">
                  <span v-if="employee.email" class="email-text">
                    <i class="fas fa-envelope"></i>
                    {{ employee.email }}
                  </span>
                  <span v-else class="email-empty">Non défini</span>
                </td>
                <td class="actions-cell">
                  <button
                    @click="openEmployeeModal(employee)"
                    class="btn-icon"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteEmployee(employee.id)"
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

    <EmployeeModal
      v-if="showEmployeeModal"
      :employee="editingEmployee"
      :ranks="ranks"
      :admins="admins"
      @close="closeEmployeeModal"
      @save="saveEmployee"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirestore } from '../../../composables/useFirestore'
import { useConfirm } from '../../../composables/useConfirm'
import { getDb } from '../../../composables/useFirebase'
import { collection, onSnapshot } from 'firebase/firestore'
import EmployeeModal from '../modals/EmployeeModal.vue'

const { getAll, create, update, remove, getAllRanks } = useFirestore()

const employees = ref([])
const ranks = ref([])
const admins = ref([])
const loading = ref(true)
const showEmployeeModal = ref(false)
const editingEmployee = ref(null)
const { confirm, alert } = useConfirm()

// Filters
const searchQuery = ref('')
const rankFilter = ref('')
const emailFilter = ref('')
const sortBy = ref('name-asc')
const filtersExpanded = ref(true)

const getRankName = (rankId) => {
  const rank = ranks.value.find(r => r.id === rankId)
  return rank ? rank.name : 'Aucun'
}

const uniqueRanks = computed(() => {
  const rankIds = new Set(employees.value.map(e => e.rankId).filter(Boolean))
  return rankIds.size
})

const employeesWithEmail = computed(() => {
  return employees.value.filter(e => e.email).length
})

const emailPercentage = computed(() => {
  if (employees.value.length === 0) return 0
  return Math.round((employeesWithEmail.value / employees.value.length) * 100)
})

const filteredEmployees = computed(() => {
  let filtered = [...employees.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        (emp.email && emp.email.toLowerCase().includes(query))
    )
  }

  // Rank filter
  if (rankFilter.value) {
    filtered = filtered.filter((emp) => emp.rankId === rankFilter.value)
  }

  // Email filter
  if (emailFilter.value === 'with') {
    filtered = filtered.filter((emp) => emp.email)
  } else if (emailFilter.value === 'without') {
    filtered = filtered.filter((emp) => !emp.email)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'rank-asc':
        return getRankName(a.rankId).localeCompare(getRankName(b.rankId))
      default:
        return 0
    }
  })

  return filtered
})

const resetFilters = () => {
  searchQuery.value = ''
  rankFilter.value = ''
  emailFilter.value = ''
  sortBy.value = 'name-asc'
}

const loadData = async () => {
  try {
    loading.value = true
    employees.value = await getAll('employees', 'name')
    ranks.value = await getAllRanks()
    admins.value = await getAll('admins')
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    loading.value = false
  }
}

const openEmployeeModal = (employee = null) => {
  editingEmployee.value = employee
  showEmployeeModal.value = true
}

const closeEmployeeModal = () => {
  showEmployeeModal.value = false
  editingEmployee.value = null
}

const saveEmployee = async (employeeData) => {
  try {
    if (editingEmployee.value) {
      await update('employees', editingEmployee.value.id, employeeData)
    } else {
      await create('employees', employeeData)
    }
    closeEmployeeModal()
    loadData()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    await alert('Erreur lors de la sauvegarde', { type: 'danger' })
  }
}

const deleteEmployee = async (id) => {
  const result = await confirm('Êtes-vous sûr de vouloir supprimer cet employé ?', {
    type: 'danger',
    title: 'Supprimer un employé',
    confirmText: 'Supprimer'
  })
  if (!result) return

  try {
    await remove('employees', id)
    loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    await alert('Erreur lors de la suppression', { type: 'danger' })
  }
}

onMounted(() => {
  loadData()

  const db = getDb()
  onSnapshot(collection(db, 'employees'), () => loadData())
  onSnapshot(collection(db, 'ranks'), () => loadData())
})
</script>

<style scoped>
.employees-dashboard {
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

/* Employees Overview Section */
.employees-overview-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.employees-header-block {
  margin-bottom: 1rem;
}

.employees-title-block {
  margin-bottom: 0.75rem;
}

.employees-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.employees-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.employees-kpis {
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

.employees-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary-employees {
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

.btn-primary-employees:hover {
  background: #a01a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(196, 30, 58, 0.3);
}

/* Main Content with Sidebar */
.employees-main-content {
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
  background: #2a2d35;
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

.employees-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.employees-table thead {
  background: var(--bg-secondary);
}

.employees-table th {
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

.employees-table th:first-child {
  padding-left: 1rem;
}

.employees-table th:last-child {
  text-align: center;
  padding-right: 1rem;
}

.employees-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
  vertical-align: middle;
  line-height: 1.5;
  box-sizing: border-box;
}

.employees-table td:first-child {
  padding-left: 1rem;
}

.employees-table td:last-child {
  text-align: center;
  padding-right: 1rem;
}

.employees-table tbody tr:hover {
  background: var(--bg-secondary);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.name-cell i {
  color: #c41e3a;
  font-size: 0.875rem;
}

.rank-cell {
  white-space: nowrap;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--bg-secondary);
  color: #f59e0b;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.rank-badge i {
  font-size: 0.75rem;
}

.email-cell {
  white-space: nowrap;
}

.email-text {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-primary);
}

.email-text i {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.email-empty {
  color: var(--text-secondary);
  font-style: italic;
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
  background: #2a2d35;
  border-color: #c41e3a;
  color: #c41e3a;
}

.btn-icon-danger:hover {
  border-color: #dc2626;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 1200px) {
  .employees-main-content {
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
