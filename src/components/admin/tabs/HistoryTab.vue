<template>
  <div class="history-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Historique des Ventes</h1>
    </div>

    <!-- Section Stats et Actions -->
    <div class="history-overview-section">
      <div class="history-header-block">
        <div class="history-title-block">
          <h2 class="history-title">Archives</h2>
          <p class="history-subtitle">{{ history.length }} période(s) archivée(s)</p>
        </div>
        <div class="history-kpis">
          <div class="kpi-item kpi-red">
            <span class="kpi-label">PÉRIODES</span>
            <span class="kpi-value">{{ history.length }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">CA TOTAL</span>
            <span class="kpi-value">{{ totalArchivedSales.toFixed(0) }} €</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">SALAIRES</span>
            <span class="kpi-value">{{ totalArchivedCommissions.toFixed(0) }} €</span>
          </div>
          <div class="kpi-item kpi-orange">
            <span class="kpi-label">BÉNÉFICES</span>
            <span class="kpi-value">{{ totalArchivedBenefits.toFixed(0) }} €</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="history-main-content">
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
                <option value="date-desc">Date (récent)</option>
                <option value="date-asc">Date (ancien)</option>
                <option value="amount-desc">CA (décroissant)</option>
                <option value="amount-asc">CA (croissant)</option>
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

        <div v-else-if="filteredHistory.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-archive"></i>
          </div>
          <h3>
            {{ history.length === 0 ? "Aucune période archivée" : "Aucun résultat" }}
          </h3>
          <p>
            {{
              history.length === 0
                ? "Les périodes archivées apparaîtront ici après une réinitialisation des ventes"
                : "Aucune période ne correspond à vos critères"
            }}
          </p>
        </div>

        <div v-else class="table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>VENTES</th>
                <th>CHIFFRE D'AFFAIRES</th>
                <th>COMMISSIONS</th>
                <th>PRIMES</th>
                <th>BÉNÉFICES</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in filteredHistory" :key="entry.id">
                <td class="date-cell">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ formatDate(entry.archivedAt) }}</span>
                </td>
                <td class="sales-count-cell">
                  <span>{{ entry.salesCount || 0 }}</span>
                </td>
                <td class="amount-cell">
                  <span>{{ (entry.totalSales || entry.totalAmount || 0).toFixed(2) }} €</span>
                </td>
                <td class="commission-cell">
                  <span>{{ (entry.totalCommissions || 0).toFixed(2) }} €</span>
                </td>
                <td class="bonus-cell">
                  <span>{{ (entry.totalBonuses || 0).toFixed(2) }} €</span>
                </td>
                <td class="benefits-cell" :class="getBenefitsClass(entry)">
                  <span>{{ getBenefits(entry).toFixed(2) }} €</span>
                </td>
                <td class="actions-cell">
                  <button
                    @click="openHistoryDetailsModal(entry)"
                    class="btn-icon"
                    title="Voir détails"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="restoreFromHistory(entry)"
                    class="btn-icon btn-icon-restore"
                    title="Restaurer"
                  >
                    <i class="fas fa-undo"></i>
                  </button>
                  <button
                    @click="deleteHistory(entry.id)"
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

    <!-- Modal Détails par Employé -->
    <div v-if="showHistoryDetailsModal" class="modal-overlay" @click.self="closeHistoryDetailsModal">
      <div class="history-details-modal">
        <div class="modal-header-dark">
          <div>
            <h2 class="modal-title">Détails de la Période Archivée</h2>
            <p class="modal-subtitle">{{ formatDate(selectedHistoryEntry?.archivedAt) }}</p>
          </div>
          <button @click="closeHistoryDetailsModal" class="modal-close-dark">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body-dark">
          <div v-if="historyEmployeeSales.length === 0" class="empty-sales-message">
            <i class="fas fa-info-circle"></i>
            <p>Aucune donnée détaillée disponible pour cette période.</p>
          </div>
          <div v-else class="history-employees-grid">
            <div 
              v-for="empSale in historyEmployeeSales" 
              :key="empSale.employeeId" 
              class="history-employee-card"
            >
              <div class="employee-card-header">
                <div class="employee-card-icon">
                  <i class="fas fa-user"></i>
                </div>
                <div class="employee-card-info">
                  <h3 class="employee-card-name">{{ empSale.employeeName }}</h3>
                  <div class="employee-card-meta">
                    {{ empSale.salesCount }} vente{{ empSale.salesCount > 1 ? 's' : '' }}
                  </div>
                </div>
              </div>
              <div class="employee-card-metrics">
                <div class="metric-item">
                  <div class="metric-label">Chiffre d'Affaires</div>
                  <div class="metric-value">
                    <span>{{ empSale.totalAmount.toFixed(2) }}</span>
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">Salaire</div>
                  <div class="metric-value success">
                    <span>{{ empSale.totalCommission.toFixed(2) }}</span>
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="metric-item" v-if="empSale.totalBonus > 0">
                  <div class="metric-label">Primes</div>
                  <div class="metric-value warning">
                    <span>{{ empSale.totalBonus.toFixed(2) }}</span>
                    <span class="currency">€</span>
                  </div>
                </div>
              </div>
              <div v-if="empSale.sales && empSale.sales.length > 0" class="employee-sales-list">
                <div class="sales-list-header">
                  <h4>Ventes détaillées</h4>
                </div>
                <div class="sales-list-content">
                  <div 
                    v-for="sale in empSale.sales" 
                    :key="sale.id || sale.date" 
                    class="mini-sale-item"
                  >
                    <div class="mini-sale-date">{{ formatHistoryDate(sale.date) }}</div>
                    <div class="mini-sale-amount">{{ parseFloat(sale.amount || 0).toFixed(2) }}€</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirestore } from '../../../composables/useFirestore'
import { useConfirm } from '../../../composables/useConfirm'
import { getDb } from '../../../composables/useFirebase'
import { collection, onSnapshot } from 'firebase/firestore'

const { getAll, formatDate, getAllEmployees, getAllRanks, remove, create } = useFirestore()
const { confirm, alert } = useConfirm()

const history = ref([])
const loading = ref(true)
const showHistoryDetailsModal = ref(false)
const selectedHistoryEntry = ref(null)
const employees = ref([])
const ranks = ref([])

// Filters
const searchQuery = ref("")
const sortBy = ref("date-desc")
const filtersExpanded = ref(true)

const totalArchivedSales = computed(() => {
  return history.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.totalSales || entry.totalAmount || 0)
  }, 0)
})

const totalArchivedCommissions = computed(() => {
  return history.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.totalCommissions || 0)
  }, 0)
})

const totalArchivedBonuses = computed(() => {
  return history.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.totalBonuses || 0)
  }, 0)
})

const totalArchivedBenefits = computed(() => {
  return totalArchivedSales.value - totalArchivedCommissions.value - totalArchivedBonuses.value
})

const getBenefits = (entry) => {
  const sales = parseFloat(entry.totalSales || entry.totalAmount || 0)
  const commissions = parseFloat(entry.totalCommissions || 0)
  const bonuses = parseFloat(entry.totalBonuses || 0)
  return sales - commissions - bonuses
}

const getBenefitsClass = (entry) => {
  const benefits = getBenefits(entry)
  if (benefits < 0) return 'benefits-danger'
  if (benefits > 0) return 'benefits-success'
  return ''
}

const filteredHistory = computed(() => {
  let filtered = [...history.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((entry) => {
      const dateStr = formatDate(entry.archivedAt).toLowerCase()
      return dateStr.includes(query)
    })
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "date-desc":
        return b.archivedAt - a.archivedAt
      case "date-asc":
        return a.archivedAt - b.archivedAt
      case "amount-desc":
        return (b.totalSales || b.totalAmount || 0) - (a.totalSales || a.totalAmount || 0)
      case "amount-asc":
        return (a.totalSales || a.totalAmount || 0) - (b.totalSales || b.totalAmount || 0)
      default:
        return 0
    }
  })

  return filtered
})

const resetFilters = () => {
  searchQuery.value = ""
  sortBy.value = "date-desc"
}

const historyEmployeeSales = computed(() => {
  if (!selectedHistoryEntry.value) return []
  
  const entry = selectedHistoryEntry.value
  const sales = entry.sales || []
  const bonuses = entry.bonuses || []
  
  // Grouper les ventes par employé
  const empSalesMap = {}
  
  employees.value.forEach(emp => {
    const empSales = sales.filter(s => s.employeeId === emp.id)
    const empBonuses = bonuses.filter(b => b.employeeId === emp.id)
    const rank = ranks.value.find(r => r.id === emp.rankId)
    
    let totalAmount = 0
    let totalCommission = 0
    
    empSales.forEach(sale => {
      totalAmount += parseFloat(sale.amount || 0)
      if (rank) {
        totalCommission += parseFloat(sale.amount || 0) * parseFloat(rank.percentage || 0) / 100
      }
    })
    
    const totalBonus = empBonuses.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
    
    if (empSales.length > 0 || empBonuses.length > 0) {
      empSalesMap[emp.id] = {
        employeeId: emp.id,
        employeeName: emp.name,
        salesCount: empSales.length,
        bonusesCount: empBonuses.length,
        totalAmount,
        totalCommission,
        totalBonus,
        sales: empSales.map(s => ({
          ...s,
          date: s.date?.toDate ? s.date.toDate() : (s.date instanceof Date ? s.date : new Date(s.date))
        })).sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date)
          const dateB = b.date instanceof Date ? b.date : new Date(b.date)
          return dateB - dateA
        })
      }
    }
  })
  
  return Object.values(empSalesMap)
})

const formatHistoryDate = (date) => {
  if (!date) return 'Date inconnue'
  try {
    const dateObj = date?.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date))
    return formatDate(dateObj)
  } catch {
    return 'Date invalide'
  }
}

const openHistoryDetailsModal = async (entry) => {
  selectedHistoryEntry.value = entry
  // Charger les employés et grades si pas déjà chargés
  if (employees.value.length === 0) {
    employees.value = await getAllEmployees()
    ranks.value = await getAllRanks()
  }
  showHistoryDetailsModal.value = true
}

const closeHistoryDetailsModal = () => {
  showHistoryDetailsModal.value = false
  selectedHistoryEntry.value = null
}

const deleteHistory = async (historyId) => {
  const result = await confirm(
    "Êtes-vous sûr de vouloir supprimer cet historique ? Cette action est irréversible.",
    {
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger",
    }
  );

  if (result) {
    try {
      await remove('salesHistory', historyId);
      await alert("Historique supprimé avec succès", { type: "success" });
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      await alert("Erreur lors de la suppression de l'historique", { type: "danger" });
    }
  }
}

const restoreFromHistory = async (entry) => {
  const result = await confirm(
    `Êtes-vous sûr de vouloir restaurer ${entry.salesCount || 0} vente(s) et ${entry.bonusesCount || 0} prime(s) depuis cet historique ?`,
    {
      confirmText: "Restaurer",
      cancelText: "Annuler",
      type: "warning",
    }
  );

  if (result) {
    try {
      // Restaurer les ventes
      if (entry.sales && entry.sales.length > 0) {
        for (const sale of entry.sales) {
          await create("sales", {
            date: sale.date,
            employeeId: sale.employeeId,
            amount: parseFloat(sale.amount || 0),
            description: sale.description || ''
          });
        }
      }

      // Restaurer les primes
      if (entry.bonuses && entry.bonuses.length > 0) {
        for (const bonus of entry.bonuses) {
          await create("bonuses", {
            date: bonus.date,
            employeeId: bonus.employeeId,
            amount: parseFloat(bonus.amount || 0),
            reason: bonus.reason || ''
          });
        }
      }

      // Supprimer l'entrée d'historique après restauration
      await remove('salesHistory', entry.id);

      await alert(`${entry.salesCount || 0} vente(s) et ${entry.bonusesCount || 0} prime(s) restaurées avec succès !`, { type: "success" });
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      await alert("Erreur lors de la restauration", { type: "danger" });
    }
  }
}

const loadData = async () => {
  try {
    loading.value = true
    const snapshot = await getAll('salesHistory')
    history.value = snapshot
      .map(entry => ({
        ...entry,
        archivedAt: entry.archivedAt?.toDate ? entry.archivedAt.toDate() : (entry.archivedAt instanceof Date ? entry.archivedAt : new Date(entry.archivedAt))
      }))
      .sort((a, b) => b.archivedAt - a.archivedAt)
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  
  const db = getDb()
  onSnapshot(collection(db, 'salesHistory'), () => loadData())
})
</script>

<style scoped>
.history-dashboard {
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

/* History Overview Section */
.history-overview-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.history-header-block {
  margin-bottom: 0;
}

.history-title-block {
  margin-bottom: 0.75rem;
}

.history-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.history-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.history-kpis {
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
.history-main-content {
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
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.history-table thead {
  background: var(--bg-secondary);
}

.history-table th {
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

.history-table th:first-child {
  padding-left: 1rem;
}

.history-table th:last-child {
  text-align: center;
  padding-right: 1rem;
}

.history-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
  vertical-align: middle;
  line-height: 1.5;
  box-sizing: border-box;
}

.history-table td:first-child {
  padding-left: 1rem;
}

.history-table td:last-child {
  text-align: center;
  padding-right: 1rem;
}

.history-table tbody tr:hover {
  background: var(--bg-secondary);
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  vertical-align: middle;
}

.date-cell span {
  line-height: 1.5;
}

.date-cell i {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.sales-count-cell,
.amount-cell,
.commission-cell,
.bonus-cell {
  white-space: nowrap;
}

.benefits-cell.benefits-success {
  color: #16a34a;
  font-weight: 600;
}

.benefits-cell.benefits-danger {
  color: #dc2626;
  font-weight: 600;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
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
  width: 32px;
  height: 32px;
}

.btn-icon:hover {
  background: var(--bg-card);
  border-color: #c41e3a;
}

.btn-icon-danger {
  color: #ff6b7a;
}

.btn-icon-danger:hover {
  background: rgba(196, 30, 58, 0.2);
  border-color: #ff6b7a;
  color: #ff8a95;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
}

.btn-icon-restore {
  color: #3b82f6;
}

.btn-icon-restore:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #60a5fa;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  border-color: #c41e3a;
  color: #c41e3a;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.history-details-modal {
  background: var(--bg-card);
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.modal-header-dark {
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.modal-close-dark {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.modal-close-dark:hover {
  background: #3a3d45;
  border-color: #c41e3a;
  color: #c41e3a;
}

.modal-body-dark {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
  background: var(--bg-card);
}

.empty-sales-message {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-sales-message i {
  font-size: 3rem;
  color: #c41e3a;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.history-employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.history-employee-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
}

.employee-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.employee-card-icon {
  width: 40px;
  height: 40px;
  background: #c41e3a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
}

.employee-card-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.employee-card-meta {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.employee-card-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.metric-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.metric-value.success {
  color: #16a34a;
}

.metric-value.warning {
  color: #f59e0b;
}

.currency {
  margin-left: 0.25rem;
  font-size: 0.875rem;
}

.employee-sales-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #2a2d35;
}

.sales-list-header {
  margin-bottom: 0.75rem;
}

.sales-list-header h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.sales-list-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.mini-sale-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-card);
  border-radius: 4px;
  font-size: 0.8125rem;
}

.mini-sale-date {
  color: var(--text-secondary);
}

.mini-sale-amount {
  color: var(--text-primary);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1200px) {
  .history-main-content {
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
