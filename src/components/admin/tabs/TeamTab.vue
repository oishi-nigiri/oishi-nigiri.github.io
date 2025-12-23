<template>
  <div class="team-dashboard">
    <!-- Header avec actions rapides -->
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="dashboard-title">Gestion de l'Équipe</h1>
          <p class="dashboard-subtitle">Gérez les membres de votre organigramme</p>
        </div>
        <div class="header-actions">
          <button @click="openMemberModal()" class="btn-action btn-primary-action">
            <i class="fas fa-plus-circle"></i>
            <span>Nouveau Membre</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div class="stats-grid">
      <div class="stat-card-large primary">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Membres</div>
            <div class="stat-value-large">
              <span>{{ members.length }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-check-circle"></i>
          <span>Dans l'organigramme</span>
        </div>
      </div>

      <div class="stat-card-large success">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Avec Photo</div>
            <div class="stat-value-large">
              <span>{{ membersWithPhoto }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-image"></i>
          <span>{{ photoPercentage }}% avec photo</span>
        </div>
      </div>

      <div class="stat-card-large info">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-briefcase"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Rôles Uniques</div>
            <div class="stat-value-large">
              <span>{{ uniqueRoles }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-tags"></i>
          <span>Différents rôles</span>
        </div>
      </div>
    </div>

    <!-- Membres de l'Équipe -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Membres de l'Équipe</h2>
          <p class="section-description">Gérez les membres affichés dans l'organigramme</p>
        </div>
        <div class="section-actions">
          <button @click="openMemberModal()" class="btn-icon-text">
            <i class="fas fa-plus"></i>
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>
      <div v-else-if="members.length === 0" class="empty-container">
        <i class="fas fa-users"></i>
        <p>Aucun membre dans l'organigramme. Ajoutez-en un pour commencer !</p>
      </div>
      <div v-else class="members-grid">
        <div v-for="member in sortedMembers" :key="member.id" class="member-card-modern">
          <div class="card-header-modern">
            <div class="member-avatar-wrapper">
              <img v-if="member.photo" :src="member.photo" :alt="member.name" class="member-avatar-large">
              <div v-else class="member-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ member.name }}</h3>
              <div class="card-badge">
                <i class="fas fa-briefcase"></i>
                {{ member.role || 'Rôle non défini' }}
              </div>
            </div>
          </div>
          <div v-if="member.description" class="card-description">
            {{ member.description }}
          </div>
          <div class="card-actions-modern">
            <button @click="openMemberModal(member)" class="btn-card-action">
              <i class="fas fa-edit"></i>
              <span>Modifier</span>
            </button>
            <button @click="deleteMember(member.id)" class="btn-card-action danger">
              <i class="fas fa-trash"></i>
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <MemberModal
      v-if="showMemberModal"
      :member="editingMember"
      :ranks="ranks"
      @close="closeMemberModal"
      @save="saveMember"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDb } from '../../../composables/useFirebase'
import { useConfirm } from '../../../composables/useConfirm'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import MemberModal from '../modals/MemberModal.vue'

const members = ref([])
const ranks = ref([])
const loading = ref(true)
const showMemberModal = ref(false)
const editingMember = ref(null)
const { confirm, alert } = useConfirm()

const sortedMembers = computed(() => {
  return [...members.value].sort((a, b) => (a.order || 0) - (b.order || 0))
})

const membersWithPhoto = computed(() => {
  return members.value.filter(m => m.photo).length
})

const photoPercentage = computed(() => {
  if (members.value.length === 0) return 0
  return Math.round((membersWithPhoto.value / members.value.length) * 100)
})

const uniqueRoles = computed(() => {
  const roles = new Set(members.value.map(m => m.role).filter(Boolean))
  return roles.size
})

const loadData = async () => {
  try {
    loading.value = true
    const db = getDb()
    
    const membersSnapshot = await getDocs(collection(db, 'organigramme'))
    members.value = membersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    
    // Charger les grades pour le select
    const ranksSnapshot = await getDocs(collection(db, 'ranks'))
    ranks.value = ranksSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    loading.value = false
  }
}

const openMemberModal = (member = null) => {
  editingMember.value = member
  showMemberModal.value = true
}

const closeMemberModal = () => {
  showMemberModal.value = false
  editingMember.value = null
}

const saveMember = async (memberData) => {
  try {
    const db = getDb()
    if (editingMember.value) {
      await updateDoc(doc(db, 'organigramme', editingMember.value.id), {
        ...memberData,
        updatedAt: new Date()
      })
    } else {
      await addDoc(collection(db, 'organigramme'), {
        ...memberData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    closeMemberModal()
    loadData()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    await alert('Erreur lors de la sauvegarde', { type: 'danger' })
  }
}

const deleteMember = async (id) => {
  const result = await confirm('Êtes-vous sûr de vouloir supprimer ce membre ?', {
    type: 'danger',
    title: 'Supprimer un membre',
    confirmText: 'Supprimer'
  })
  if (!result) return
  
  try {
    const db = getDb()
    await deleteDoc(doc(db, 'organigramme', id))
    loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    await alert('Erreur lors de la suppression', { type: 'danger' })
  }
}

onMounted(() => {
  loadData()
  
  const db = getDb()
  onSnapshot(collection(db, 'organigramme'), () => loadData())
})
</script>

<style scoped>
.team-dashboard {
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

/* Members Grid */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.member-card-modern {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.member-card-modern:hover {
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

.member-avatar-wrapper {
  flex-shrink: 0;
}

.member-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #c41e3a;
}

.member-avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 3px solid #c41e3a;
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

.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.card-description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 1rem 0;
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

  .members-grid {
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

  .members-grid {
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
