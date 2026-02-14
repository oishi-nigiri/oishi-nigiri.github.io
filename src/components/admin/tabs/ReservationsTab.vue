<template>
  <div class="reservations-dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Gestion des Réservations</h1>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total</span>
        <span class="stat-value">{{ reservations.length }}</span>
      </div>
      <div class="stat-card pending">
        <span class="stat-label">En attente</span>
        <span class="stat-value">{{ pendingCount }}</span>
      </div>
      <div class="stat-card confirmed">
        <span class="stat-label">Confirmées</span>
        <span class="stat-value">{{ confirmedCount }}</span>
      </div>
    </div>

    <!-- Availability Management -->
    <div class="availability-section">
      <h2 class="section-subtitle">Disponibilités (Prochains 7 jours)</h2>
      <div class="days-grid">
        <div 
          v-for="day in nextWeek" 
          :key="day.date" 
          :class="['day-card', { 'is-full': isDayFull(day.date) }]"
          @click="toggleAvailability(day.date)"
        >
          <div class="day-name">{{ day.label }}</div>
          <div class="day-date">{{ day.displayDate }}</div>
          <div class="day-status">
            {{ isDayFull(day.date) ? 'COMPLET' : 'OUVERT' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Rechercher un nom ou un numéro..."
        >
      </div>
      <div class="status-filter">
        <select v-model="statusFilter">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des réservations...</p>
      </div>

      <div v-else-if="filteredReservations.length === 0" class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <p>Aucune réservation trouvée.</p>
      </div>

      <table v-else class="reservations-table">
        <thead>
          <tr>
            <th>Date & Heure</th>
            <th>Client</th>
            <th>Couverts</th>
            <th>Message</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in filteredReservations" :key="res.id">
            <td class="date-cell">
              <div class="res-date">{{ formatDate(res.date) }}</div>
              <div class="res-time">{{ res.time }}</div>
            </td>
            <td class="client-cell">
              <div class="res-name">{{ res.name }}</div>
              <div class="res-phone">{{ res.phone }}</div>
            </td>
            <td class="guests-cell">
              <span class="guest-badge">{{ res.guests }}</span>
            </td>
            <td class="message-cell">
              <p v-if="res.message" class="message-text" :title="res.message">
                {{ res.message }}
              </p>
              <span v-else class="no-message">-</span>
            </td>
            <td class="status-cell">
              <span :class="['status-badge', res.status]">
                {{ formatStatus(res.status) }}
              </span>
            </td>
            <td class="actions-cell">
              <button 
                v-if="res.status !== 'confirmed'"
                @click="updateStatus(res.id, 'confirmed')"
                class="btn-action confirm"
                title="Confirmer"
              >
                <i class="fas fa-check"></i>
              </button>
              <button 
                v-if="res.status !== 'cancelled'"
                @click="updateStatus(res.id, 'cancelled')"
                class="btn-action cancel"
                title="Annuler"
              >
                <i class="fas fa-times"></i>
              </button>
              <button 
                @click="deleteReservation(res.id)"
                class="btn-action delete"
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDb } from '../../../composables/useFirebase'
import { useConfirm } from '../../../composables/useConfirm'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore'

const reservations = ref([])
const availability = ref({})
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const { confirm } = useConfirm()

const nextWeek = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      displayDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    })
  }
  return days
})

const isDayFull = (date) => availability.value[date]?.isFull || false

const pendingCount = computed(() => reservations.value.filter(r => r.status === 'pending').length)
const confirmedCount = computed(() => reservations.value.filter(r => r.status === 'confirmed').length)

const filteredReservations = computed(() => {
  return reservations.value
    .filter(r => {
      const matchesSearch = (r.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                            (r.phone || '').includes(searchQuery.value)
      const matchesStatus = !statusFilter.value || r.status === statusFilter.value
      return matchesSearch && matchesStatus
    })
})

const loadData = () => {
  loading.value = true
  const db = getDb()
  
  // Load Reservations
  const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'))
  onSnapshot(q, (snapshot) => {
    reservations.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    loading.value = false
  })

  // Load Availability
  onSnapshot(collection(db, 'availability'), (snapshot) => {
    const data = {}
    snapshot.docs.forEach(doc => {
      data[doc.id] = doc.data()
    })
    availability.value = data
  })
}

const toggleAvailability = async (date) => {
  try {
    const db = getDb()
    const currentlyFull = isDayFull(date)
    await setDoc(doc(db, 'availability', date), {
      isFull: !currentlyFull,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la disponibilité:', error)
  }
}

const updateStatus = async (id, status) => {
  try {
    const db = getDb()
    await updateDoc(doc(db, 'reservations', id), { status })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
}

const deleteReservation = async (id) => {
  const ok = await confirm('Voulez-vous vraiment supprimer cette réservation ?', {
    type: 'danger',
    confirmText: 'Supprimer'
  })
  
  if (ok) {
    try {
      const db = getDb()
      await deleteDoc(doc(db, 'reservations', id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatStatus = (status) => {
  const map = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    cancelled: 'Annulée'
  }
  return map[status] || status
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reservations-dashboard {
  padding: 1rem;
}

.dashboard-title {
  font-size: 1.75rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-card.pending .stat-value { color: #f59e0b; }
.stat-card.confirmed .stat-value { color: #22c55e; }

/* Availability Styles */
.availability-section {
  margin-bottom: 2.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.days-grid {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.day-card {
  min-width: 100px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.day-card:hover {
  border-color: var(--accent-red);
  transform: translateY(-2px);
}

.day-name {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.day-date {
  font-weight: 700;
  font-size: 1rem;
}

.day-status {
  font-size: 0.7rem;
  font-weight: 800;
  color: #22c55e;
  margin-top: 0.5rem;
}

.day-card.is-full {
  background: rgba(232, 90, 79, 0.05);
  border-color: rgba(232, 90, 79, 0.3);
}

.day-card.is-full .day-status {
  color: #e85a4f;
}

.day-card.is-full .day-date {
  color: #e85a4f;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-box input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 8px;
  color: var(--text-primary);
}

option {
  background: var(--bg-card);
  color: var(--text-primary);
}

.status-filter select {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--text-primary);
  min-width: 150px;
}

.table-container {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th {
  background: rgba(255, 255, 255, 0.02);
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.res-date { font-weight: 600; color: var(--text-primary); }
.res-time { font-size: 0.8rem; color: var(--text-secondary); }

.res-name { font-weight: 600; color: var(--text-primary); }
.res-phone { font-size: 0.8rem; color: var(--text-secondary); }

.guest-badge {
  background: var(--bg-secondary);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-weight: 600;
}

.message-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-badge.confirmed { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.status-badge.cancelled { background: rgba(232, 90, 79, 0.1); color: #e85a4f; }

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.confirm:hover { background: #22c55e; color: white; }

.cancel { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.cancel:hover { background: #f59e0b; color: white; }

.delete { background: rgba(232, 90, 79, 0.1); color: #e85a4f; }
.delete:hover { background: #e85a4f; color: white; }

.loading-state, .empty-state {
  padding: 4rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .reservations-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
