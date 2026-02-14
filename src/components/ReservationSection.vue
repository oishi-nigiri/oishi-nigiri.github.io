<template>
  <section id="reservation" class="reservation-section">
    <div class="container">
      <h2 class="section-title">
        <span class="title-decor">━</span>
        Réservation
        <span class="title-decor">━</span>
      </h2>

      <div class="reservation-container">
        <div class="reservation-info">
          <h3>Réserver une Table</h3>
          <p>
            Vivez une expérience gastronomique unique au cœur de la tradition japonaise. 
            Nous vous conseillons de réserver au moins 24h à l'avance.
          </p>
        </div>

        <form @submit.prevent="submitReservation" class="reservation-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nom complet</label>
              <input 
                type="text" 
                id="name" 
                v-model="form.name" 
                required 
                placeholder="Votre nom"
              >
            </div>
            <div class="form-group">
              <label for="phone">Téléphone</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="form.phone" 
                required 
                placeholder="Votre numéro"
              >
            </div>
            <div class="form-group full-width">
              <label>Choisir une Date</label>
              <div class="weekly-calendar">
                <div 
                  v-for="day in nextWeek" 
                  :key="day.date" 
                  :class="['calendar-day', { 
                    'selected': form.date === day.date, 
                    'full': isDayFull(day.date) 
                  }]"
                  @click="!isDayFull(day.date) && (form.date = day.date)"
                >
                  <div class="day-label">{{ day.label }}</div>
                  <div class="day-number">{{ day.dayNumber }}</div>
                  <div class="day-status" v-if="isDayFull(day.date)">Complet</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="time">Heure</label>
              <input 
                type="time" 
                id="time" 
                v-model="form.time" 
                required
              >
            </div>
            <div class="form-group full-width">
              <label for="guests">Nombre de personnes</label>
              <select id="guests" v-model="form.guests" required>
                <option v-for="n in 10" :key="n" :value="n">
                  {{ n }} personne{{ n > 1 ? 's' : '' }}
                </option>
                <option value="more">Plus de 10 personnes</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="message">Message ou demande particulière (optionnel)</label>
              <textarea 
                id="message" 
                v-model="form.message" 
                placeholder="Allergies, anniversaire, etc."
                rows="3"
              ></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="submitting"
          >
            <span v-if="!submitting">Confirmer la Réservation</span>
            <span v-else>Envoi en cours...</span>
          </button>

          <div v-if="status.message" :class="['status-msg', status.type]">
            {{ status.message }}
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getDb } from '../composables/useFirebase'
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'

const availability = ref({})

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
      dayNumber: d.getDate(),
      fullDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    })
  }
  return days
})

const isDayFull = (date) => availability.value[date]?.isFull || false

const form = reactive({
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 2,
  message: ''
})

const submitting = ref(false)
const status = reactive({
  message: '',
  type: ''
})

const loadAvailability = () => {
  const db = getDb()
  onSnapshot(collection(db, 'availability'), (snapshot) => {
    const data = {}
    snapshot.docs.forEach(doc => {
      data[doc.id] = doc.data()
    })
    availability.value = data
  })
}

onMounted(() => {
  loadAvailability()
})

const submitReservation = async () => {
  submitting.value = true
  status.message = ''
  
  try {
    const db = getDb()
    await addDoc(collection(db, 'reservations'), {
      ...form,
      createdAt: serverTimestamp(),
      status: 'pending' // pending, confirmed, cancelled
    })

    status.message = 'Votre demande de réservation a été envoyée avec succès ! Nous vous recontacterons prochainement.'
    status.type = 'success'
    
    // Reset form
    form.name = ''
    form.phone = ''
    form.date = ''
    form.time = ''
    form.guests = 2
    form.message = ''
    
  } catch (error) {
    console.error('Erreur lors de la réservation:', error)
    status.message = 'Une erreur est survenue lors de l\'envoi de votre réservation. Veuillez réessayer.'
    status.type = 'error'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.reservation-section {
  background: #0a0a0a;
  padding: 6rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-title {
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 4rem;
  color: #fff;
  font-weight: 400;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.section-title .title-decor {
  color: #e85a4f;
  margin: 0 1rem;
}

.reservation-container {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 4rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 3rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.reservation-info h3 {
  font-family: 'Playfair Display', serif;
  color: #e85a4f;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 400;
}

.reservation-info p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  margin-bottom: 2rem;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.info-icon {
  font-size: 1.2rem;
}

.reservation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  font-weight: 500;
}

input, select, textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 1rem;
  border-radius: 4px;
  color: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

option {
  background: #1a1a1a;
  color: #fff;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #e85a4f;
  background: rgba(255, 255, 255, 0.08);
}

/* Weekly Calendar Styles */
.weekly-calendar {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
  scrollbar-color: #e85a4f transparent;
}

.calendar-day {
  min-width: 80px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0.5rem;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid transparent;
}

.calendar-day:hover:not(.full) {
  background: rgba(232, 90, 79, 0.05);
  border-color: rgba(232, 90, 79, 0.3);
}

.calendar-day.selected {
  background: rgba(232, 90, 79, 0.12);
  border-color: #e85a4f;
  box-shadow: 0 0 15px rgba(232, 90, 79, 0.2);
}

.day-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
}

.day-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.day-status {
  font-size: 0.6rem;
  font-weight: 800;
  color: #e85a4f;
  text-transform: uppercase;
}

.calendar-day.full {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

.calendar-day.selected .day-number {
  color: #e85a4f;
}

textarea {
  resize: vertical;
}

.submit-btn {
  background: #e85a4f;
  color: #fff;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover:not(:disabled) {
  background: #f06c62;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(232, 90, 79, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status-msg {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

.status-msg.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-msg.error {
  background: rgba(232, 90, 79, 0.1);
  color: #e85a4f;
  border: 1px solid rgba(232, 90, 79, 0.2);
}

@media (max-width: 900px) {
  .reservation-container {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 2rem;
  }
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
}
</style>
