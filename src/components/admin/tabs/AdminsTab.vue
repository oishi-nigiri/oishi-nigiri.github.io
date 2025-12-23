<template>
  <div class="admins-dashboard">
    <!-- Header avec actions rapides -->
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="dashboard-title">Gestion des Administrateurs</h1>
          <p class="dashboard-subtitle">Gérez les administrateurs et leurs permissions</p>
        </div>
        <div class="header-actions">
          <button v-if="canManageAdmins" @click="openAdminModal()" class="btn-action btn-primary-action">
            <i class="fas fa-plus-circle"></i>
            <span>Nouvel Admin</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div class="stats-grid">
      <div class="stat-card-large primary">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-user-shield"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Admins</div>
            <div class="stat-value-large">
              <span>{{ admins.length }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-users"></i>
          <span>Enregistrés</span>
        </div>
      </div>

      <div class="stat-card-large success">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-key"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Permissions Actives</div>
            <div class="stat-value-large">
              <span>{{ totalPermissions }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-check-circle"></i>
          <span>Au total</span>
        </div>
      </div>

      <div class="stat-card-large info">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-crown"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Super Admins</div>
            <div class="stat-value-large">
              <span>{{ superAdminCount }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-star"></i>
          <span>Accès complet</span>
        </div>
      </div>
    </div>

    <!-- Liste des Administrateurs -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Administrateurs</h2>
          <p class="section-description">Gérez les administrateurs et leurs permissions</p>
        </div>
        <div class="section-actions">
          <button v-if="canManageAdmins" @click="openAdminModal()" class="btn-icon-text">
            <i class="fas fa-plus"></i>
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div v-if="!canManageAdmins" class="empty-container">
        <i class="fas fa-lock"></i>
        <p>Vous n'avez pas les permissions pour gérer les administrateurs.</p>
      </div>
      <div v-else-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>
      <div v-else-if="admins.length === 0" class="empty-container">
        <i class="fas fa-user-shield"></i>
        <p>Aucun administrateur enregistré</p>
      </div>
      <div v-else class="admins-grid">
        <div v-for="admin in admins" :key="admin.id" class="admin-card-modern">
          <div class="card-header-modern">
            <div class="card-icon">
              <i class="fas fa-user-shield"></i>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ admin.username || admin.discordId || 'Admin' }}</h3>
              <div class="card-meta">
                <i class="fab fa-discord"></i>
                <span>{{ admin.discordId }}</span>
              </div>
            </div>
          </div>
          <div class="permissions-section-modern">
            <div class="permissions-label">
              <i class="fas fa-key"></i>
              Permissions
            </div>
            <div class="permissions-grid-modern">
              <span v-if="(admin.permissions || {}).menu" class="permission-badge">
                <i class="fas fa-utensils"></i> Carte
              </span>
              <span v-if="(admin.permissions || {}).team" class="permission-badge">
                <i class="fas fa-users"></i> Équipe
              </span>
              <span v-if="(admin.permissions || {}).sales" class="permission-badge">
                <i class="fas fa-chart-line"></i> Ventes
              </span>
              <span v-if="(admin.permissions || {}).history" class="permission-badge">
                <i class="fas fa-clock"></i> Historique
              </span>
              <span v-if="(admin.permissions || {}).resetSales" class="permission-badge">
                <i class="fas fa-redo"></i> Réinit. Ventes
              </span>
              <span v-if="(admin.permissions || {}).bonuses" class="permission-badge">
                <i class="fas fa-gift"></i> Primes
              </span>
              <span v-if="(admin.permissions || {}).employees" class="permission-badge">
                <i class="fas fa-user-tie"></i> Employés
              </span>
              <span v-if="(admin.permissions || {}).ranks" class="permission-badge">
                <i class="fas fa-star"></i> Grades
              </span>
              <span v-if="(admin.permissions || {}).admins" class="permission-badge success">
                <i class="fas fa-crown"></i> Admins
              </span>
            </div>
          </div>
          <div class="card-actions-modern">
            <button @click="openAdminModal(admin)" class="btn-card-action">
              <i class="fas fa-edit"></i>
              <span>Modifier</span>
            </button>
            <button @click="deleteAdmin(admin.id)" class="btn-card-action danger">
              <i class="fas fa-trash"></i>
              <span>Supprimer</span>
            </button>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useFirestore } from '../../../composables/useFirestore'
import { useConfirm } from '../../../composables/useConfirm'
import { getDb } from '../../../composables/useFirebase'
import { collection, onSnapshot } from 'firebase/firestore'
import AdminModal from '../modals/AdminModal.vue'

const { getAll, create, update, remove } = useFirestore()

const admins = ref([])
const loading = ref(true)
const showAdminModal = ref(false)
const editingAdmin = ref(null)
const { confirm, alert } = useConfirm()

const isSuperAdmin = computed(() => {
  return localStorage.getItem('isSuperAdmin') === 'true'
})

const currentPermissions = computed(() => {
  return JSON.parse(localStorage.getItem('adminPermissions') || '{}')
})

const canManageAdmins = computed(() => {
  return isSuperAdmin.value || currentPermissions.value.admins === true
})

const totalPermissions = computed(() => {
  return admins.value.reduce((total, admin) => {
    const perms = admin.permissions || {}
    return total + Object.values(perms).filter(Boolean).length
  }, 0)
})

const superAdminCount = computed(() => {
  // Compter les super admins (ceux qui ont toutes les permissions ou sont dans ADMIN_IDS)
  return admins.value.filter(admin => {
    const perms = admin.permissions || {}
    const hasAllPerms = Object.values(perms).every(v => v === true)
    return hasAllPerms
  }).length
})

const loadData = async () => {
  try {
    loading.value = true
    admins.value = await getAll('admins')
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    loading.value = false
  }
}

const openAdminModal = async (admin = null) => {
  if (!canManageAdmins.value) {
    await alert('Vous n\'avez pas la permission de gérer les administrateurs.', { type: 'warning' })
    return
  }
  editingAdmin.value = admin
  showAdminModal.value = true
}

const closeAdminModal = () => {
  showAdminModal.value = false
  editingAdmin.value = null
}

const saveAdmin = async (adminData) => {
  try {
    const data = {
      discordId: String(adminData.discordId),
      username: adminData.username || null,
      isAdmin: true,
      permissions: adminData.permissions
    }
    
    if (editingAdmin.value) {
      await update('admins', String(editingAdmin.value.id), data)
    } else {
      await create('admins', data)
    }
    
    closeAdminModal()
    loadData()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    await alert('Erreur lors de la sauvegarde', { type: 'danger' })
  }
}

const deleteAdmin = async (id) => {
  if (!canManageAdmins.value) {
    await alert('Vous n\'avez pas la permission de supprimer des administrateurs.', { type: 'warning' })
    return
  }
  
  const result = await confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?', {
    type: 'danger',
    title: 'Supprimer un administrateur',
    confirmText: 'Supprimer'
  })
  if (!result) return
  
  try {
    await remove('admins', id)
    loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    await alert('Erreur lors de la suppression', { type: 'danger' })
  }
}

onMounted(() => {
  loadData()
  
  const db = getDb()
  onSnapshot(collection(db, 'admins'), () => loadData())
})
</script>

<style scoped>
.admins-dashboard {
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

/* Admins Grid */
.admins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.admin-card-modern {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.admin-card-modern:hover {
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
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
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

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.card-meta i {
  color: #5865F2;
}

.permissions-section-modern {
  margin: 1rem 0;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.permissions-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c1810;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.permissions-label i {
  color: #c41e3a;
}

.permissions-grid-modern {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.permission-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.75rem;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.permission-badge.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

  .admins-grid {
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

  .admins-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn-action {
    flex: 1;
    justify-content: center;
  }

  .permissions-grid-modern {
    flex-direction: column;
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
