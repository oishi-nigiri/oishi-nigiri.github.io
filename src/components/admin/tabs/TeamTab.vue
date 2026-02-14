<template>
  <div class="team-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Gestion de l'Équipe</h1>
    </div>

    <!-- Section Stats et Actions -->
    <div class="team-overview-section">
      <div class="team-header-block">
        <div class="team-title-block">
          <h2 class="team-title">Membres</h2>
          <p class="team-subtitle">{{ members.length }} membre(s) enregistré(s)</p>
        </div>
        <div class="team-kpis">
          <div class="kpi-item kpi-red">
            <span class="kpi-label">TOTAL</span>
            <span class="kpi-value">{{ members.length }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">AVEC PHOTO</span>
            <span class="kpi-value">{{ membersWithPhoto }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">RÔLES</span>
            <span class="kpi-value">{{ uniqueRoles }}</span>
          </div>
          <div class="kpi-item kpi-orange">
            <span class="kpi-label">POURCENTAGE</span>
            <span class="kpi-value">{{ photoPercentage }}%</span>
          </div>
        </div>
      </div>

      <div class="team-actions">
        <button @click="openMemberModal()" class="btn-primary-team">
          <i class="fas fa-plus"></i>
          <span>Nouveau Membre</span>
        </button>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="team-main-content">
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
              <label class="filter-label">Rôle</label>
              <select v-model="roleFilter" class="filter-select">
                <option value="">Tous les rôles</option>
                <option v-for="role in uniqueRolesList" :key="role" :value="role">
                  {{ role }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Photo</label>
              <select v-model="photoFilter" class="filter-select">
                <option value="">Tous</option>
                <option value="with">Avec Photo</option>
                <option value="without">Sans Photo</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Tri par</label>
              <select v-model="sortBy" class="filter-select">
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="role-asc">Rôle (A-Z)</option>
                <option value="order-asc">Ordre</option>
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

        <div v-else-if="filteredMembers.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-users"></i>
          </div>
          <h3>
            {{ members.length === 0 ? "Aucun membre dans l'organigramme" : "Aucun résultat" }}
          </h3>
          <p>
            {{
              members.length === 0
                ? "Ajoutez-en un pour commencer !"
                : "Aucun membre ne correspond à vos critères"
            }}
          </p>
          <button
            v-if="members.length === 0"
            @click="openMemberModal()"
            class="btn-primary-team"
          >
            <i class="fas fa-plus"></i>
            <span>Ajouter un Membre</span>
          </button>
        </div>

        <div v-else class="table-wrapper">
          <table class="team-table">
            <thead>
              <tr>
                <th>PHOTO</th>
                <th>NOM</th>
                <th>RÔLE</th>
                <th>DESCRIPTION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in filteredMembers" :key="member.id">
                <td class="photo-cell">
                  <div class="avatar-wrapper">
                    <img v-if="member.photo" :src="member.photo" :alt="member.name" class="avatar-img" />
                    <div v-else class="avatar-placeholder">
                      <i class="fas fa-user"></i>
                    </div>
                  </div>
                </td>
                <td class="name-cell">
                  <span class="name-text">{{ member.name }}</span>
                </td>
                <td class="role-cell">
                  <span class="role-badge">{{ member.role || "Non défini" }}</span>
                </td>
                <td class="description-cell">
                  <span v-if="member.description" class="description-text">{{ member.description }}</span>
                  <span v-else class="description-empty">Aucune description</span>
                </td>
                <td class="actions-cell">
                  <button
                    @click="openMemberModal(member)"
                    class="btn-icon"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteMember(member.id)"
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

// Filters
const searchQuery = ref("")
const roleFilter = ref("")
const photoFilter = ref("")
const sortBy = ref("order-asc")
const filtersExpanded = ref(true)

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

const uniqueRolesList = computed(() => {
  return Array.from(new Set(members.value.map(m => m.role).filter(Boolean))).sort()
})

const filteredMembers = computed(() => {
  let filtered = [...members.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        (member.role && member.role.toLowerCase().includes(query)) ||
        (member.description && member.description.toLowerCase().includes(query))
    )
  }

  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter((member) => member.role === roleFilter.value)
  }

  // Photo filter
  if (photoFilter.value === "with") {
    filtered = filtered.filter((member) => member.photo)
  } else if (photoFilter.value === "without") {
    filtered = filtered.filter((member) => !member.photo)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      case "role-asc":
        const roleA = a.role || ""
        const roleB = b.role || ""
        return roleA.localeCompare(roleB)
      case "order-asc":
        return (a.order || 0) - (b.order || 0)
      default:
        return 0
    }
  })

  return filtered
})

const resetFilters = () => {
  searchQuery.value = ""
  roleFilter.value = ""
  photoFilter.value = ""
  sortBy.value = "order-asc"
}

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

/* Team Overview Section */
.team-overview-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.team-header-block {
  margin-bottom: 1rem;
}

.team-title-block {
  margin-bottom: 0.75rem;
}

.team-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.team-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.team-kpis {
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

.team-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary-team {
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

.btn-primary-team:hover {
  background: #a01a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(196, 30, 58, 0.3);
}

/* Main Content with Sidebar */
.team-main-content {
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

.team-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.team-table thead {
  background: var(--bg-secondary);
}

.team-table th {
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

.team-table th:first-child {
  padding-left: 1rem;
}

.team-table th:last-child {
  text-align: center;
  padding-right: 1rem;
}

.team-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
  vertical-align: middle;
  line-height: 1.5;
  box-sizing: border-box;
}

.team-table td:first-child {
  padding-left: 1rem;
}

.team-table td:last-child {
  text-align: center;
  padding-right: 1rem;
}

.team-table tbody tr:hover {
  background: var(--bg-secondary);
}

.photo-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.avatar-wrapper {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #c41e3a;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid #c41e3a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c41e3a;
  font-size: 1.125rem;
}

.name-cell {
  white-space: nowrap;
}

.name-text {
  color: var(--text-primary);
  font-weight: 500;
}

.role-cell {
  white-space: nowrap;
}

.role-badge {
  display: inline-block;
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
}

.description-cell {
  max-width: 300px;
}

.description-text {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.description-empty {
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

.btn-icon-danger:hover {
  border-color: #dc2626;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 1200px) {
  .team-main-content {
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
