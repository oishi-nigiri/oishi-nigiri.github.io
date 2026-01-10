<template>
  <div class="history-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="dashboard-title">Historique des Ventes</h1>
          <p class="dashboard-subtitle">Consultez les périodes archivées</p>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div v-if="!loading && history.length > 0" class="stats-grid">
      <div class="stat-card-large primary">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-archive"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Périodes Archivées</div>
            <div class="stat-value-large">
              <span>{{ history.length }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-calendar"></i>
          <span>Total archivé</span>
        </div>
      </div>

      <div class="stat-card-large success">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-euro-sign"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">CA Total Archivé</div>
            <div class="stat-value-large">
              <span>{{ totalArchivedSales.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-chart-bar"></i>
          <span>Toutes périodes</span>
        </div>
      </div>

      <div class="stat-card-large info">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-wallet"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Salaires Total</div>
            <div class="stat-value-large">
              <span>{{ totalArchivedCommissions.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-users"></i>
          <span>Total versé</span>
        </div>
      </div>

      <div class="stat-card-large" :class="totalArchivedBenefits >= 0 ? 'warning' : 'danger'">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Bénéfices Total</div>
            <div class="stat-value-large">
              <span>{{ totalArchivedBenefits.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-percentage"></i>
          <span>Toutes périodes</span>
        </div>
      </div>
    </div>

    <!-- Archives des Périodes -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Archives des Périodes</h2>
          <p class="section-description">Consultez les statistiques des périodes archivées</p>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>
      <div v-else-if="history.length === 0" class="empty-container">
        <i class="fas fa-archive"></i>
        <p>Aucun historique disponible. Les périodes archivées apparaîtront ici après une réinitialisation des ventes.</p>
      </div>
      <div v-else class="history-grid-modern">
        <div 
          v-for="entry in history" 
          :key="entry.id" 
          class="history-card-modern clickable"
          @click="openHistoryDetailsModal(entry)"
        >
          <div class="card-header-modern">
            <div class="card-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="card-info">
              <h3 class="card-title">Période Archivée</h3>
              <div class="card-date">{{ formatDate(entry.archivedAt) }}</div>
            </div>
            <div class="card-action-icon">
              <i class="fas fa-eye"></i>
            </div>
          </div>
          <div class="history-stats-modern">
            <div class="history-stat-item">
              <div class="stat-icon-small">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label-small">Nombre de ventes</div>
                <div class="stat-value-small">{{ entry.salesCount || 0 }}</div>
              </div>
            </div>
            <div class="history-stat-item primary">
              <div class="stat-icon-small">
                <i class="fas fa-euro-sign"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label-small">Chiffre d'Affaires</div>
                <div class="stat-value-small primary">
                  <span>{{ (entry.totalSales || entry.totalAmount || 0).toFixed(2) }}</span>
                  <span class="currency-small">€</span>
                </div>
              </div>
            </div>
            <div class="history-stat-item success">
              <div class="stat-icon-small">
                <i class="fas fa-wallet"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label-small">Total Salaires</div>
                <div class="stat-value-small success">
                  <span>{{ entry.totalCommissions?.toFixed(2) || '0.00' }}</span>
                  <span class="currency-small">€</span>
                </div>
              </div>
            </div>
            <div class="history-stat-item warning">
              <div class="stat-icon-small">
                <i class="fas fa-gift"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label-small">Total Primes</div>
                <div class="stat-value-small warning">
                  <span>{{ entry.totalBonuses?.toFixed(2) || '0.00' }}</span>
                  <span class="currency-small">€</span>
                </div>
              </div>
            </div>
            <div class="history-stat-item total" :class="getBenefitsClass(entry)">
              <div class="stat-icon-small">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label-small">Bénéfices</div>
                <div class="stat-value-small total-value" :class="getBenefitsClass(entry)">
                  <span>{{ getBenefits(entry).toFixed(2) }}</span>
                  <span class="currency-small">€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Détails par Employé -->
    <div v-if="showHistoryDetailsModal" class="modal-overlay" @click.self="closeHistoryDetailsModal">
      <div class="history-details-modal">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Détails de la Période Archivée</h2>
            <p class="modal-subtitle">{{ formatDate(selectedHistoryEntry?.archivedAt) }}</p>
          </div>
          <button @click="closeHistoryDetailsModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
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
import { getDb } from '../../../composables/useFirebase'
import { collection, onSnapshot } from 'firebase/firestore'

const { getAll, formatDate, getAllEmployees, getAllRanks } = useFirestore()

const history = ref([])
const loading = ref(true)
const showHistoryDetailsModal = ref(false)
const selectedHistoryEntry = ref(null)
const employees = ref([])
const ranks = ref([])

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
  if (benefits < 0) return 'danger'
  if (benefits > 0) return 'success'
  return ''
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Dashboard Header */
.dashboard-header {
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(196, 30, 58, 0.25);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.dashboard-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card-large {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card-large::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #c41e3a 0%, #9a1629 100%);
}

.stat-card-large:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card-large.primary::before {
  background: linear-gradient(90deg, #c41e3a 0%, #9a1629 100%);
}

.stat-card-large.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-card-large.success::before {
  background: rgba(255, 255, 255, 0.3);
}

.stat-card-large.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stat-card-large.warning::before {
  background: rgba(255, 255, 255, 0.3);
}

.stat-card-large.info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-card-large.info::before {
  background: rgba(255, 255, 255, 0.3);
}

.stat-card-large.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.stat-card-large.danger::before {
  background: rgba(255, 255, 255, 0.3);
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: rgba(196, 30, 58, 0.1);
  color: #c41e3a;
  flex-shrink: 0;
}

.stat-card-large.success .stat-icon-wrapper,
.stat-card-large.warning .stat-icon-wrapper,
.stat-card-large.info .stat-icon-wrapper,
.stat-card-large.danger .stat-icon-wrapper {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.8;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value-large {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
}

.stat-value-large .currency {
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0.9;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-card-large.success .stat-trend,
.stat-card-large.warning .stat-trend,
.stat-card-large.info .stat-trend,
.stat-card-large.danger .stat-trend {
  border-top-color: rgba(255, 255, 255, 0.2);
}

/* Content Sections */
.content-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.section-description {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0;
}

/* History Grid */
.history-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.history-card-modern {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.history-card-modern.clickable {
  cursor: pointer;
}

.history-card-modern.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #c41e3a;
}

.card-header-modern {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-action-icon {
  color: #c41e3a;
  font-size: 1.25rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.history-card-modern.clickable:hover .card-action-icon {
  opacity: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 0.25rem 0;
}

.card-date {
  font-size: 0.875rem;
  color: #6c757d;
}

.history-stats-modern {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.history-stat-item:hover {
  border-color: #c41e3a;
  transform: translateX(4px);
}

.history-stat-item.primary {
  border-left: 4px solid #c41e3a;
}

.history-stat-item.success {
  border-left: 4px solid #10b981;
}

.history-stat-item.warning {
  border-left: 4px solid #f59e0b;
}

.history-stat-item.total {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px solid #c41e3a;
  font-weight: 700;
}

.history-stat-item.total.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.history-stat-item.total.danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
}

.stat-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.history-stat-item.primary .stat-icon-small {
  background: rgba(196, 30, 58, 0.1);
  color: #c41e3a;
}

.history-stat-item.success .stat-icon-small {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.history-stat-item.warning .stat-icon-small {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label-small {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.stat-value-small {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c1810;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
}

.stat-value-small.primary {
  color: #c41e3a;
}

.stat-value-small.success {
  color: #10b981;
}

.stat-value-small.warning {
  color: #f59e0b;
}

.stat-value-small.total-value {
  font-size: 1.5rem;
}

.stat-value-small.total-value.success {
  color: #10b981;
}

.stat-value-small.total-value.danger {
  color: #ef4444;
}

.currency-small {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.8;
}

/* Loading & Empty States */
.loading-container,
.empty-container {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.loading-container i,
.empty-container i {
  font-size: 3rem;
  color: #c41e3a;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .history-grid-modern {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1.5rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .content-section {
    padding: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .history-grid-modern {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 1.25rem;
  }

  .content-section {
    padding: 1.25rem;
  }

  .section-header-modern {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.history-details-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  border-radius: 20px 20px 0 0;
}

.modal-title {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.modal-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin: 0;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.empty-sales-message {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
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
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.history-employee-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #c41e3a;
}

.employee-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.employee-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.employee-card-info {
  flex: 1;
  min-width: 0;
}

.employee-card-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-card-meta {
  font-size: 0.875rem;
  color: #6c757d;
}

.employee-card-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.metric-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
}

.metric-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c1810;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
}

.metric-value.success {
  color: #10b981;
}

.metric-value.warning {
  color: #f59e0b;
}

.metric-value .currency {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.8;
}

.employee-sales-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.sales-list-header {
  margin-bottom: 1rem;
}

.sales-list-header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #2c1810;
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
  padding: 0.5rem 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.mini-sale-date {
  color: #6c757d;
}

.mini-sale-amount {
  font-weight: 700;
  color: #2c1810;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .history-details-modal {
    max-width: 100%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .history-employees-grid {
    grid-template-columns: 1fr;
  }
}
</style>
