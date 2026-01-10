<template>
  <div class="ranks-dashboard">
    <!-- Header avec actions rapides -->
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="dashboard-title">Gestion des Grades</h1>
          <p class="dashboard-subtitle">Gérez les grades et leurs commissions</p>
        </div>
        <div class="header-actions">
          <button @click="openRankModal()" class="btn-action btn-primary-action">
            <i class="fas fa-plus-circle"></i>
            <span>Nouveau Grade</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div class="stats-grid">
      <div class="stat-card-large primary">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Grades</div>
            <div class="stat-value-large">
              <span>{{ ranks.length }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-list"></i>
          <span>Enregistrés</span>
        </div>
      </div>

      <div class="stat-card-large success">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-percent"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Commission Moyenne</div>
            <div class="stat-value-large">
              <span>{{ averageCommission.toFixed(2) }}</span>
              <span class="currency">%</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-chart-line"></i>
          <span>Moyenne</span>
        </div>
      </div>

      <div class="stat-card-large info">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-arrow-up"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Commission Max</div>
            <div class="stat-value-large">
              <span>{{ maxCommission.toFixed(2) }}</span>
              <span class="currency">%</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-trophy"></i>
          <span>Maximum</span>
        </div>
      </div>
    </div>

    <!-- Liste des Grades -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Grades et Commissions</h2>
          <p class="section-description">Gérez les grades disponibles pour les employés</p>
        </div>
        <div class="section-actions">
          <button @click="openRankModal()" class="btn-icon-text">
            <i class="fas fa-plus"></i>
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>
      <div v-else-if="ranks.length === 0" class="empty-container">
        <i class="fas fa-star"></i>
        <p>Aucun grade enregistré. Créez-en un pour commencer !</p>
      </div>
      <div v-else class="ranks-grid">
        <div v-for="rank in ranks" :key="rank.id" class="rank-card-modern">
          <div class="card-header-modern">
            <div class="card-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ rank.name }}</h3>
              <div class="card-commission">
                <span class="commission-value">{{ parseFloat(rank.percentage).toFixed(2) }}%</span>
                <span class="commission-label">Commission</span>
              </div>
            </div>
          </div>
          <div v-if="rank.description" class="card-description">
            {{ rank.description }}
          </div>
          <div class="card-actions-modern">
            <button @click="openRankModal(rank)" class="btn-card-action">
              <i class="fas fa-edit"></i>
              <span>Modifier</span>
            </button>
            <button @click="deleteRank(rank.id)" class="btn-card-action danger">
              <i class="fas fa-trash"></i>
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <RankModal
      v-if="showRankModal"
      :rank="editingRank"
      @close="closeRankModal"
      @save="saveRank"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirestore } from '../../../composables/useFirestore'
import { useConfirm } from '../../../composables/useConfirm'
import { getDb } from '../../../composables/useFirebase'
import { collection, onSnapshot } from 'firebase/firestore'
import RankModal from '../modals/RankModal.vue'

const { getAll, create, update, remove } = useFirestore()

const ranks = ref([])
const loading = ref(true)
const showRankModal = ref(false)
const editingRank = ref(null)
const { confirm, alert } = useConfirm()

const averageCommission = computed(() => {
  if (ranks.value.length === 0) return 0
  const total = ranks.value.reduce((sum, rank) => {
    return sum + parseFloat(rank.percentage || 0)
  }, 0)
  return total / ranks.value.length
})

const maxCommission = computed(() => {
  if (ranks.value.length === 0) return 0
  return Math.max(...ranks.value.map(r => parseFloat(r.percentage || 0)))
})

const loadData = async () => {
  try {
    loading.value = true
    ranks.value = await getAll('ranks', 'name')
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    loading.value = false
  }
}

const openRankModal = (rank = null) => {
  editingRank.value = rank
  showRankModal.value = true
}

const closeRankModal = () => {
  showRankModal.value = false
  editingRank.value = null
}

const saveRank = async (rankData) => {
  try {
    const data = {
      ...rankData,
      percentage: parseFloat(rankData.percentage)
    }
    
    if (editingRank.value) {
      await update('ranks', editingRank.value.id, data)
    } else {
      await create('ranks', data)
    }
    
    closeRankModal()
    loadData()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    await alert('Erreur lors de la sauvegarde', { type: 'danger' })
  }
}

const deleteRank = async (id) => {
  const result = await confirm('Êtes-vous sûr de vouloir supprimer ce grade ? Les employés avec ce grade devront être réassignés.', {
    type: 'warning',
    title: 'Supprimer un grade',
    confirmText: 'Supprimer'
  })
  if (!result) return
  
  try {
    await remove('ranks', id)
    loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    await alert('Erreur lors de la suppression', { type: 'danger' })
  }
}

onMounted(() => {
  loadData()
  
  const db = getDb()
  onSnapshot(collection(db, 'ranks'), () => loadData())
})
</script>

<style scoped>
.ranks-dashboard {
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

.stat-card-large.info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-card-large.info::before {
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
.stat-card-large.info .stat-icon-wrapper {
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
.stat-card-large.info .stat-trend {
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

/* Ranks Grid */
.ranks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.rank-card-modern {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.rank-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #c41e3a;
}

.card-header-modern {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
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

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 0.5rem 0;
}

.card-commission {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.commission-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #17a2b8;
}

.commission-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 1rem 0;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.card-actions-modern {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-card-action {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background: white;
  color: #6c757d;
  border: 1px solid #e5e7eb;
}

.btn-card-action:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.btn-card-action.danger {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.btn-card-action.danger:hover {
  background: #fecaca;
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

  .ranks-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

  .ranks-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn-action {
    flex: 1;
    justify-content: center;
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
</style>
