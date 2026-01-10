<template>
  <div class="sales-dashboard">
    <!-- Header avec actions rapides -->
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="dashboard-title">Tableau de Bord des Ventes</h1>
          <p class="dashboard-subtitle">Gérez vos ventes et suivez vos performances</p>
        </div>
        <div class="header-actions">
          <button @click="openSaleModal()" class="btn-action btn-primary-action">
            <i class="fas fa-plus-circle"></i>
            <span>Nouvelle Vente</span>
          </button>
          <button v-if="hasPermission('bonuses')" @click="openBonusModal()" class="btn-action btn-secondary-action">
            <i class="fas fa-gift"></i>
            <span>Ajouter Prime</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div class="stats-grid">
      <div class="stat-card-large primary">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-euro-sign"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Chiffre d'Affaires</div>
            <div class="stat-value-large">
              <span>{{ totalSales.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-arrow-up"></i>
          <span>{{ sales.length }} ventes</span>
        </div>
      </div>

      <div class="stat-card-large success">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-wallet"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Salaires & Commissions</div>
            <div class="stat-value-large">
              <span>{{ totalCommissions.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-users"></i>
          <span>{{ employeeSales.length }} employés</span>
        </div>
      </div>

      <div class="stat-card-large warning">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-gift"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Primes Total</div>
            <div class="stat-value-large">
              <span>{{ totalBonuses.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-star"></i>
          <span>{{ bonuses.length }} primes</span>
        </div>
      </div>

      <div class="stat-card-large" :class="totalBenefits >= 0 ? 'info' : 'danger'">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Bénéfices</div>
            <div class="stat-value-large">
              <span>{{ totalBenefits.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-percentage"></i>
          <span>Moy: {{ avgSale.toFixed(2) }}€</span>
        </div>
      </div>
    </div>

    <!-- Vue d'ensemble des ventes récentes -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Ventes Récentes</h2>
          <p class="section-description">Dernières transactions enregistrées</p>
        </div>
        <div class="section-actions">
          <button v-if="hasPermission('resetSales')" @click="resetSales" class="btn-icon-text danger">
            <i class="fas fa-redo"></i>
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>

      <div v-else-if="sales.length === 0" class="empty-state-modern">
        <div class="empty-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>Aucune vente enregistrée</h3>
        <p>Commencez par ajouter votre première vente</p>
        <button @click="openSaleModal()" class="btn-action btn-primary-action">
          <i class="fas fa-plus"></i>
          <span>Ajouter une Vente</span>
        </button>
      </div>

      <div v-else class="sales-grid">
        <div v-for="sale in sales" :key="sale.id" class="sale-card">
          <div class="sale-card-header">
            <div class="sale-employee">
              <div class="employee-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="employee-info">
                <div class="employee-name">{{ getEmployeeName(sale.employeeId) }}</div>
                <div class="sale-date">{{ formatDate(sale.date) }}</div>
              </div>
            </div>
            <div class="sale-amount-large">
              <span>{{ parseFloat(sale.amount).toFixed(2) }}</span>
              <span class="currency-small">€</span>
            </div>
          </div>
          <div class="sale-card-body">
            <div class="sale-details">
              <div class="detail-item">
                <i class="fas fa-percent"></i>
                <span>Commission: <strong>{{ getSaleCommission(sale).toFixed(2) }}€</strong></span>
              </div>
            </div>
          </div>
          <div class="sale-card-footer">
            <button
              v-if="canEditSale(sale)"
              @click="openSaleModal(sale)"
              class="btn-card-action"
            >
              <i class="fas fa-edit"></i>
              <span>Modifier</span>
            </button>
            <button
              v-if="canDeleteSale(sale)"
              @click="deleteSale(sale.id)"
              class="btn-card-action danger"
              :title="isCurrentUserEmployee() && getCurrentEmployee()?.id === sale.employeeId ? 'Supprimer votre vente' : 'Supprimer cette vente'"
            >
              <i class="fas fa-trash"></i>
              <span>{{ isCurrentUserEmployee() && getCurrentEmployee()?.id === sale.employeeId ? 'Supprimer (vôtre)' : 'Supprimer' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue par employé -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Performance par Employé</h2>
          <p class="section-description">Détails des ventes et commissions par employé</p>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="employeeSales.length === 0" class="empty-state-modern">
        <div class="empty-icon">
          <i class="fas fa-users"></i>
        </div>
        <h3>Aucun employé avec des ventes</h3>
      </div>

      <div v-else class="employees-grid">
        <div v-for="empSale in employeeSales" :key="empSale.employeeId" class="employee-card">
          <div class="employee-card-header">
            <div class="employee-avatar-large">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="employee-header-info">
              <h3 class="employee-card-name">{{ empSale.employeeName }}</h3>
              <div class="employee-stats-mini">
                <span class="stat-badge">
                  <i class="fas fa-shopping-cart"></i>
                  {{ empSale.salesCount }} ventes
                </span>
                <span v-if="empSale.bonusesCount > 0" class="stat-badge bonus">
                  <i class="fas fa-gift"></i>
                  {{ empSale.bonusesCount }} primes
                </span>
              </div>
            </div>
          </div>

          <div class="employee-card-body">
            <div class="employee-metrics">
              <div class="metric-item">
                <div class="metric-label">Chiffre d'Affaires</div>
                <div class="metric-value primary">
                  <span>{{ empSale.totalAmount.toFixed(2) }}</span>
                  <span class="currency-small">€</span>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Salaire</div>
                <div class="metric-value success">
                  <span>{{ empSale.totalCommission.toFixed(2) }}</span>
                  <span class="currency-small">€</span>
                </div>
              </div>
              <div v-if="empSale.totalBonus > 0" class="metric-item">
                <div class="metric-label">Primes</div>
                <div class="metric-value warning">
                  <span>{{ empSale.totalBonus.toFixed(2) }}</span>
                  <span class="currency-small">€</span>
                </div>
              </div>
              <div v-if="empSale.totalBonus > 0" class="metric-item total">
                <div class="metric-label">Total</div>
                <div class="metric-value total-value">
                  <span>{{ (empSale.totalCommission + empSale.totalBonus).toFixed(2) }}</span>
                  <span class="currency-small">€</span>
                </div>
              </div>
            </div>

            <div v-if="empSale.sales.length > 0" class="employee-sales-mini">
              <div class="mini-sales-header">
                <span>Dernières ventes</span>
              </div>
              <div class="mini-sales-list">
                <div v-for="sale in empSale.sales.slice(0, 3)" :key="sale.id" class="mini-sale-item">
                  <span class="mini-sale-date">{{ formatDate(sale.date) }}</span>
                  <span class="mini-sale-amount">{{ parseFloat(sale.amount).toFixed(2) }}€</span>
                </div>
                <button 
                  @click="openEmployeeSalesModal(empSale)"
                  class="mini-sale-more"
                >
                  <i class="fas fa-eye"></i>
                  Voir toutes les ventes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Primes -->
    <div v-if="hasPermission('bonuses') || hasPermission('sales')" class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Primes Attribuées</h2>
          <p class="section-description">Historique des primes distribuées</p>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="bonuses.length === 0" class="empty-state-modern">
        <div class="empty-icon">
          <i class="fas fa-gift"></i>
        </div>
        <h3>Aucune prime enregistrée</h3>
      </div>

      <div v-else class="bonuses-grid">
        <div v-for="bonus in bonuses" :key="bonus.id" class="bonus-card">
          <div class="bonus-card-header">
            <div class="bonus-icon">
              <i class="fas fa-gift"></i>
            </div>
            <div class="bonus-amount-large">
              <span>{{ parseFloat(bonus.amount).toFixed(2) }}</span>
              <span class="currency-small">€</span>
            </div>
          </div>
          <div class="bonus-card-body">
            <div class="bonus-employee">
              <i class="fas fa-user"></i>
              <span>{{ getEmployeeName(bonus.employeeId) }}</span>
            </div>
            <div class="bonus-date">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(bonus.date) }}</span>
            </div>
            <div v-if="bonus.description" class="bonus-description">
              <i class="fas fa-info-circle"></i>
              <span>{{ bonus.description }}</span>
            </div>
          </div>
          <div class="bonus-card-footer">
            <button @click="openBonusModal(bonus)" class="btn-card-action">
              <i class="fas fa-edit"></i>
              <span>Modifier</span>
            </button>
            <button @click="deleteBonus(bonus.id)" class="btn-card-action danger">
              <i class="fas fa-trash"></i>
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <SaleModal
      v-if="showSaleModal"
      :sale="editingSale"
      :employees="employees"
      @close="closeSaleModal"
      @save="saveSale"
    />

    <BonusModal
      v-if="showBonusModal"
      :bonus="editingBonus"
      :employees="employees"
      @close="closeBonusModal"
      @save="saveBonus"
    />

    <!-- Modale des ventes d'un employé -->
    <div v-if="showEmployeeSalesModal" class="modal-overlay" @click.self="closeEmployeeSalesModal">
      <div class="employee-sales-modal">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Toutes les ventes</h2>
            <p class="modal-subtitle">{{ selectedEmployeeSales?.employeeName }}</p>
          </div>
          <button @click="closeEmployeeSalesModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="employee-sales-summary">
            <div class="summary-item">
              <span class="summary-label">Total CA:</span>
              <span class="summary-value">{{ selectedEmployeeSales?.totalAmount.toFixed(2) }}€</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Salaire:</span>
              <span class="summary-value success">{{ selectedEmployeeSales?.totalCommission.toFixed(2) }}€</span>
            </div>
            <div class="summary-item" v-if="selectedEmployeeSales?.totalBonus > 0">
              <span class="summary-label">Total Primes:</span>
              <span class="summary-value warning">{{ selectedEmployeeSales?.totalBonus.toFixed(2) }}€</span>
            </div>
          </div>
          <div v-if="visibleSales.length === 0" class="empty-sales-message">
            <i class="fas fa-lock"></i>
            <p>Vous n'avez pas la permission de voir ces ventes.</p>
          </div>
          <div v-else class="sales-list-modal">
            <div 
              v-for="sale in visibleSales" 
              :key="sale.id" 
              class="sale-item-modal"
            >
              <div class="sale-item-info">
                <div class="sale-item-date">{{ formatDate(sale.date) }}</div>
                <div class="sale-item-amount">{{ parseFloat(sale.amount).toFixed(2) }}€</div>
              </div>
              <div class="sale-item-commission">
                Commission: <strong>{{ getSaleCommission(sale).toFixed(2) }}€</strong>
              </div>
              <div class="sale-item-actions">
                <button 
                  v-if="canEditSale(sale)" 
                  @click="openSaleModal(sale); closeEmployeeSalesModal()" 
                  class="btn-small"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  v-if="canDeleteSale(sale)"
                  @click="handleDeleteSaleFromModal(sale.id)"
                  class="btn-small danger"
                  :title="isCurrentUserEmployee() && getCurrentEmployee()?.id === sale.employeeId ? 'Supprimer votre vente' : 'Supprimer cette vente'"
                >
                  <i class="fas fa-trash"></i>
                </button>
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
import { useAuth } from '../../../composables/useAuth'
import { useConfirm } from '../../../composables/useConfirm'
import SaleModal from '../modals/SaleModal.vue'
import BonusModal from '../modals/BonusModal.vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { getDb } from '../../../composables/useFirebase'

const { 
  getAll, 
  create, 
  update, 
  remove, 
  formatDate,
  getAllEmployees,
  getAllRanks,
  toTimestamp
} = useFirestore()

const { hasPermission: checkPermission, user } = useAuth()
const { confirm, alert } = useConfirm()

const sales = ref([])
const bonuses = ref([])
const employees = ref([])
const ranks = ref([])
const loading = ref(true)
const showSaleModal = ref(false)
const showBonusModal = ref(false)
const showEmployeeSalesModal = ref(false)
const editingSale = ref(null)
const editingBonus = ref(null)
const selectedEmployeeSales = ref(null)

const hasPermission = (perm) => {
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
  if (isSuperAdmin) return true
  try {
    const perms = JSON.parse(localStorage.getItem('adminPermissions') || '{}')
    return perms[perm] === true
  } catch {
    return false
  }
}

const totalSales = computed(() => {
  return sales.value.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0)
})

const avgSale = computed(() => {
  return sales.value.length > 0 ? totalSales.value / sales.value.length : 0
})

const totalCommissions = computed(() => {
  let total = 0
  sales.value.forEach(sale => {
    const commission = getSaleCommission(sale)
    total += commission
  })
  return total
})

const totalBonuses = computed(() => {
  return bonuses.value.reduce((sum, bonus) => sum + parseFloat(bonus.amount || 0), 0)
})

const totalBenefits = computed(() => {
  return totalSales.value - totalCommissions.value - totalBonuses.value
})

const employeeSales = computed(() => {
  const empSalesMap = {}
  
  employees.value.forEach(emp => {
    const empSales = sales.value.filter(s => s.employeeId === emp.id)
    const empBonuses = bonuses.value.filter(b => b.employeeId === emp.id)
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
        sales: empSales.sort((a, b) => b.date - a.date)
      }
    }
  })
  
  return Object.values(empSalesMap)
})

const getEmployeeName = (employeeId) => {
  const emp = employees.value.find(e => e.id === employeeId)
  return emp ? emp.name : 'Employé supprimé'
}

const getSaleCommission = (sale) => {
  const emp = employees.value.find(e => e.id === sale.employeeId)
  if (!emp) return 0
  const rank = ranks.value.find(r => r.id === emp.rankId)
  if (!rank) return 0
  return parseFloat(sale.amount || 0) * parseFloat(rank.percentage || 0) / 100
}

const loadData = async () => {
  try {
    loading.value = true
    
    employees.value = await getAllEmployees()
    ranks.value = await getAllRanks()
    
    const salesSnapshot = await getAll('sales')
    sales.value = salesSnapshot.map(sale => ({
      ...sale,
      date: sale.date?.toDate ? sale.date.toDate() : (sale.date instanceof Date ? sale.date : new Date(sale.date))
    })).sort((a, b) => b.date - a.date)
    
    const bonusesSnapshot = await getAll('bonuses')
    bonuses.value = bonusesSnapshot.map(bonus => ({
      ...bonus,
      date: bonus.date?.toDate ? bonus.date.toDate() : (bonus.date instanceof Date ? bonus.date : new Date(bonus.date))
    })).sort((a, b) => b.date - a.date)
    
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    loading.value = false
  }
}

const openSaleModal = (sale = null) => {
  editingSale.value = sale
  showSaleModal.value = true
}

const closeSaleModal = () => {
  showSaleModal.value = false
  editingSale.value = null
}

const saveSale = async (saleData) => {
  try {
    const data = {
      ...saleData,
      date: toTimestamp(new Date(saleData.date)),
      amount: parseFloat(saleData.amount)
    }
    
    if (editingSale.value) {
      await update('sales', editingSale.value.id, data)
    } else {
      await create('sales', data)
    }
    
    closeSaleModal()
    loadData()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    await alert('Erreur lors de la sauvegarde', { type: 'danger' })
  }
}

// Vérifier si l'utilisateur peut voir/gérer une vente
const canManageSale = (sale) => {
  if (!sale) return false

  // SuperAdmin peut tout gérer
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
  if (isSuperAdmin) return true

  // Vérifier les permissions admin
  let hasAdminPermission = false
  let hasSalesPermission = false
  try {
    const perms = JSON.parse(localStorage.getItem('adminPermissions') || '{}')
    hasAdminPermission = perms.admins === true
    hasSalesPermission = perms.sales === true
  } catch {
    hasAdminPermission = false
    hasSalesPermission = false
  }

  // Si l'utilisateur a la permission 'admins', il peut tout gérer
  if (hasAdminPermission) return true

  // Pour les utilisateurs avec permission 'sales' ou employés normaux :
  // vérifier si la vente leur appartient
  const currentUser = user.value
  if (!currentUser || !currentUser.id) return false

  const currentUserId = String(currentUser.id)

  // Trouver l'employé correspondant à l'utilisateur Discord
  const employee = employees.value.find(emp => {
    if (emp.discordId && emp.discordId.trim()) {
      return String(emp.discordId).trim() === currentUserId
    }
    return false
  })

  // Si l'utilisateur a la permission 'sales' OU est un employé enregistré,
  // vérifier si la vente lui appartient
  if ((hasSalesPermission || employee) && sale.employeeId === employee?.id) {
    return true
  }

  // Par défaut, pas de permission
  return false
}

// Vérifier si l'utilisateur peut supprimer une vente (alias pour compatibilité)
const canDeleteSale = (sale) => {
  return canManageSale(sale)
}

// Vérifier si l'utilisateur peut modifier une vente
const canEditSale = (sale) => {
  if (!sale) return false

  // SuperAdmin peut tout gérer
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
  if (isSuperAdmin) return true

  // Vérifier les permissions
  let hasAdminPermission = false
  try {
    const perms = JSON.parse(localStorage.getItem('adminPermissions') || '{}')
    hasAdminPermission = perms.admins === true
  } catch {
    hasAdminPermission = false
  }

  // Si l'utilisateur a la permission 'admins', il peut tout modifier
  if (hasAdminPermission) return true

  // Pour TOUS les utilisateurs : vérifier si la vente leur appartient
  const currentUser = user.value
  if (!currentUser || !currentUser.id) return false

  const currentUserId = String(currentUser.id)

  // Trouver l'employé correspondant à l'utilisateur Discord
  const employee = employees.value.find(emp => {
    if (emp.discordId && emp.discordId.trim()) {
      return String(emp.discordId).trim() === currentUserId
    }
    return false
  })

  // Si l'utilisateur est un employé, vérifier si la vente lui appartient
  if (employee && sale.employeeId === employee.id) {
    return true
  }

  // Par défaut, pas de permission
  return false
}

// Vérifier si l'utilisateur actuel est un employé
const isCurrentUserEmployee = () => {
  const currentUser = user.value
  if (!currentUser || !currentUser.id) return false

  const currentUserId = String(currentUser.id)
  return employees.value.some(emp => {
    if (emp.discordId && emp.discordId.trim()) {
      return String(emp.discordId).trim() === currentUserId
    }
    return false
  })
}

// Obtenir l'employé actuel
const getCurrentEmployee = () => {
  const currentUser = user.value
  if (!currentUser || !currentUser.id) return null

  const currentUserId = String(currentUser.id)
  return employees.value.find(emp => {
    if (emp.discordId && emp.discordId.trim()) {
      return String(emp.discordId).trim() === currentUserId
    }
    return false
  })
}

// Filtrer les ventes selon les permissions pour la modal
const getVisibleSales = (empSale) => {
  if (!empSale || !empSale.sales) return []
  
  // SuperAdmin et Admin peuvent voir toutes les ventes
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
  if (isSuperAdmin) return empSale.sales
  
  try {
    const perms = JSON.parse(localStorage.getItem('adminPermissions') || '{}')
    if (perms.sales === true) return empSale.sales
  } catch {
    // Continue pour vérifier si c'est un employé
  }
  
  // Vérifier si l'utilisateur est un employé et si les ventes lui appartiennent
  const currentUser = user.value
  if (!currentUser || !currentUser.id) return []
  
  const currentUserId = String(currentUser.id)
  
  // Trouver l'employé correspondant à l'utilisateur Discord
  const employee = employees.value.find(emp => {
    if (emp.discordId) {
      return String(emp.discordId) === currentUserId
    }
    return false
  })
  
  // Si l'utilisateur est un employé, retourner seulement ses ventes
  if (employee && empSale.employeeId === employee.id) {
    return empSale.sales
  }
  
  return []
}

const deleteSale = async (id) => {
  const sale = sales.value.find(s => s.id === id)
  if (!sale) {
    await alert('Vente introuvable', { type: 'danger' })
    return
  }
  
  // Vérifier les permissions
  if (!canDeleteSale(sale)) {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
    const currentUser = user.value
    const currentUserId = currentUser ? String(currentUser.id) : null

    // Trouver l'employé correspondant à l'utilisateur Discord
    const employee = employees.value.find(emp => {
      if (emp.discordId && emp.discordId.trim()) {
        return String(emp.discordId).trim() === currentUserId
      }
      return false
    })

    let message = 'Vous n\'avez pas la permission de supprimer cette vente.'

    if (!isSuperAdmin) {
      try {
        const perms = JSON.parse(localStorage.getItem('adminPermissions') || '{}')
        if (!perms.sales) {
          if (employee) {
            message += ' Vous ne pouvez supprimer que vos propres ventes.'
          } else {
            message += ' Votre compte employé n\'est pas correctement configuré avec Discord.'
          }
        }
      } catch {
        message += ' Erreur de configuration des permissions.'
      }
    }

    await alert(message, {
      type: 'danger',
      title: 'Permission refusée'
    })
    return
  }
  
  const result = await confirm('Êtes-vous sûr de vouloir supprimer cette vente ?', {
    type: 'danger',
    title: 'Supprimer une vente',
    confirmText: 'Supprimer'
  })
  if (!result) return
  
  try {
    await remove('sales', id)
    loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    await alert('Erreur lors de la suppression', { type: 'danger' })
  }
}

const openBonusModal = (bonus = null) => {
  editingBonus.value = bonus
  showBonusModal.value = true
}

const closeBonusModal = () => {
  showBonusModal.value = false
  editingBonus.value = null
}

const visibleSales = computed(() => {
  if (!selectedEmployeeSales.value) return []
  return getVisibleSales(selectedEmployeeSales.value)
})

const openEmployeeSalesModal = (empSale) => {
  selectedEmployeeSales.value = empSale
  showEmployeeSalesModal.value = true
}

const closeEmployeeSalesModal = () => {
  showEmployeeSalesModal.value = false
  selectedEmployeeSales.value = null
}

const handleDeleteSaleFromModal = async (saleId) => {
  await deleteSale(saleId)
  // Recharger les données après suppression
  loadData()
}

const saveBonus = async (bonusData) => {
  try {
    const data = {
      ...bonusData,
      date: toTimestamp(new Date(bonusData.date)),
      amount: parseFloat(bonusData.amount)
    }
    
    if (editingBonus.value) {
      await update('bonuses', editingBonus.value.id, data)
    } else {
      await create('bonuses', data)
    }
    
    closeBonusModal()
    loadData()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    await alert('Erreur lors de la sauvegarde', { type: 'danger' })
  }
}

const deleteBonus = async (id) => {
  const result = await confirm('Êtes-vous sûr de vouloir supprimer cette prime ?', {
    type: 'danger',
    title: 'Supprimer une prime',
    confirmText: 'Supprimer'
  })
  if (!result) return
  
  try {
    await remove('bonuses', id)
    loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    await alert('Erreur lors de la suppression', { type: 'danger' })
  }
}

const resetSales = async () => {
  const result1 = await confirm('⚠️ ATTENTION: Cette action va supprimer TOUTES les ventes et primes. Cette action est irréversible. Continuer ?', {
    type: 'danger',
    title: 'Réinitialiser les ventes',
    confirmText: 'Continuer'
  })
  if (!result1) return
  
  const result2 = await confirm('Êtes-vous VRAIMENT sûr ? Toutes les données de ventes seront perdues.', {
    type: 'danger',
    title: 'Confirmation finale',
    confirmText: 'Oui, supprimer tout'
  })
  if (!result2) return
  
  try {
    loading.value = true
    
    for (const sale of sales.value) {
      await remove('sales', sale.id)
    }
    
    for (const bonus of bonuses.value) {
      await remove('bonuses', bonus.id)
    }
    
    // Préparer les données des ventes pour l'historique
    const salesData = sales.value.map(sale => {
      // Convertir la date en format compatible (Timestamp ou Date)
      let saleDate = sale.date
      if (saleDate && !saleDate.toDate && !(saleDate instanceof Date)) {
        saleDate = sale.date?.toDate ? sale.date.toDate() : new Date(sale.date)
      }
      return {
        date: saleDate,
        employeeId: sale.employeeId,
        amount: sale.amount,
        description: sale.description || ''
      }
    })
    
    // Préparer les données des primes pour l'historique
    const bonusesData = bonuses.value.map(bonus => {
      // Convertir la date en format compatible (Timestamp ou Date)
      let bonusDate = bonus.date
      if (bonusDate && !bonusDate.toDate && !(bonusDate instanceof Date)) {
        bonusDate = bonus.date?.toDate ? bonus.date.toDate() : new Date(bonus.date)
      }
      return {
        date: bonusDate,
        employeeId: bonus.employeeId,
        amount: bonus.amount,
        description: bonus.description || ''
      }
    })
    
    const historyData = {
      period: new Date().toISOString(),
      totalSales: totalSales.value,
      totalCommissions: totalCommissions.value,
      totalBonuses: totalBonuses.value,
      salesCount: sales.value.length,
      bonusesCount: bonuses.value.length,
      sales: salesData,
      bonuses: bonusesData,
      archivedAt: new Date()
    }
    
    await create('salesHistory', historyData)
    
    loadData()
    await alert('Ventes réinitialisées avec succès. Les données ont été archivées dans l\'historique.', {
      type: 'success',
      title: 'Succès'
    })
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error)
    await alert('Erreur lors de la réinitialisation', { type: 'danger' })
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  
  const db = getDb()
  onSnapshot(collection(db, 'sales'), () => loadData())
  onSnapshot(collection(db, 'bonuses'), () => loadData())
  onSnapshot(collection(db, 'employees'), () => loadData())
  onSnapshot(collection(db, 'ranks'), () => loadData())
})
</script>

<style scoped>
.sales-dashboard {
  padding: 0;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.dashboard-header {
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  padding: 2.5rem;
  border-radius: 20px;
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

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-family: 'Noto Sans JP', sans-serif;
  white-space: nowrap;
}

.btn-primary-action {
  background: white;
  color: #c41e3a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-secondary-action {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary-action:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
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

.section-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-icon-text {
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background: #f3f4f6;
  color: #6c757d;
}

.btn-icon-text:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-icon-text.danger {
  background: #fee2e2;
  color: #dc2626;
}

.btn-icon-text.danger:hover {
  background: #fecaca;
}

/* Sales Grid */
.sales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.sale-card {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.sale-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #c41e3a;
}

.sale-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid #e5e7eb;
}

.sale-employee {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.employee-avatar {
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

.employee-info {
  flex: 1;
  min-width: 0;
}

.employee-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c1810;
  margin-bottom: 0.25rem;
}

.sale-date {
  font-size: 0.875rem;
  color: #6c757d;
}

.sale-amount-large {
  font-size: 1.75rem;
  font-weight: 700;
  color: #c41e3a;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
}

.currency-small {
  font-size: 1.25rem;
  font-weight: 600;
}

.sale-card-body {
  margin-bottom: 1.25rem;
}

.sale-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.detail-item i {
  color: #c41e3a;
  width: 16px;
}

.sale-card-footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e7eb;
}

.btn-card-action {
  flex: 1;
  padding: 0.65rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-card-action:hover {
  background: #f3f4f6;
  border-color: #c41e3a;
  color: #c41e3a;
  transform: translateY(-1px);
}

.btn-card-action.danger {
  border-color: #fee2e2;
  color: #dc2626;
}

.btn-card-action.danger:hover {
  background: #fee2e2;
  border-color: #dc2626;
}

/* Employees Grid */
.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  width: 100%;
  overflow: hidden;
}

.employee-card {
  background: linear-gradient(135deg, #fff 0%, #f9fafb 100%);
  border-radius: 16px;
  padding: 1.75rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 0;
}

.employee-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #c41e3a;
}

.employee-card-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  min-width: 0;
  overflow: hidden;
}

.employee-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.employee-header-info {
  flex: 1;
  min-width: 0;
}

.employee-card-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 0.75rem 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.employee-stats-mini {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
}

.stat-badge.bonus {
  background: #fef3c7;
  color: #d97706;
}

.employee-card-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.employee-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

.metric-item {
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: visible;
}

.metric-item.total {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  border: none;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
  margin-bottom: 0.5rem;
}

.metric-item.total .metric-label {
  opacity: 0.9;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
  flex-wrap: nowrap;
  width: 100%;
}

.metric-value > span:first-child {
  white-space: nowrap;
  flex-shrink: 1;
}

.metric-value .currency-small {
  flex-shrink: 0;
  flex-grow: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;
}

.metric-value.primary {
  color: #c41e3a;
}

.metric-value.success {
  color: #10b981;
}

.metric-value.warning {
  color: #f59e0b;
}

.metric-value.total-value {
  color: white;
  font-size: 1.75rem;
}

.employee-sales-mini {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  min-width: 0;
}

.mini-sales-header {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6c757d;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.mini-sales-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  overflow: hidden;
}

.mini-sale-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  gap: 0.75rem;
  min-width: 0;
}

.mini-sale-date {
  color: #6c757d;
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 0.8rem;
}

.mini-sale-amount {
  font-weight: 600;
  color: #2c1810;
  white-space: nowrap;
  flex-shrink: 0;
  text-align: right;
}

.mini-sale-more {
  width: 100%;
  text-align: center;
  font-size: 0.85rem;
  color: #c41e3a;
  font-weight: 600;
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  background: transparent;
  border-left: none;
  border-right: none;
  border-bottom: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0 0 8px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.mini-sale-more:hover {
  background: rgba(196, 30, 58, 0.1);
  color: #9a1629;
  transform: translateY(-1px);
}

.mini-sale-more i {
  font-size: 0.9rem;
}

/* Bonuses Grid */
.bonuses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.bonus-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #fbbf24;
  transition: all 0.3s ease;
}

.bonus-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
}

.bonus-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid rgba(217, 119, 6, 0.2);
}

.bonus-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(217, 119, 6, 0.2);
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.bonus-amount-large {
  font-size: 1.75rem;
  font-weight: 700;
  color: #d97706;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
}

.bonus-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.bonus-employee,
.bonus-date,
.bonus-description {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #92400e;
}

.bonus-card-footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(217, 119, 6, 0.2);
}

/* Loading & Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state-modern {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.empty-state-modern h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 0.5rem 0;
}

.empty-state-modern p {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
}

/* Modale des ventes d'employé */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.15s ease-out;
  will-change: opacity;
}

.employee-sales-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  transform: translateZ(0);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.modal-header {
  padding: 2rem;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.modal-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
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
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.employee-sales-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #c41e3a;
  white-space: nowrap;
}

.summary-value.success {
  color: #10b981;
}

.summary-value.warning {
  color: #f59e0b;
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

.empty-sales-message p {
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.sales-list-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sale-item-modal {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.sale-item-modal:hover {
  border-color: #c41e3a;
  box-shadow: 0 4px 12px rgba(196, 30, 58, 0.1);
}

.sale-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sale-item-date {
  font-size: 0.9rem;
  color: #6c757d;
  white-space: nowrap;
}

.sale-item-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #c41e3a;
  white-space: nowrap;
}

.sale-item-commission {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
}

.sale-item-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.btn-small {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6c757d;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background: #f3f4f6;
  border-color: #c41e3a;
  color: #c41e3a;
}

.btn-small.danger {
  border-color: #fee2e2;
  color: #dc2626;
}

.btn-small.danger:hover {
  background: #fee2e2;
  border-color: #dc2626;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .sales-grid,
  .employees-grid,
  .bonuses-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1.5rem;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-action {
    flex: 1;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-section {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .employee-metrics {
    grid-template-columns: 1fr;
  }

  .employee-sales-modal {
    max-width: 100%;
    max-height: 95vh;
    margin: 0.5rem;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .employee-sales-summary {
    grid-template-columns: 1fr;
  }
}
</style>
