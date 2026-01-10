<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="modal-icon">
              <i class="fas fa-gift"></i>
            </div>
            <div>
              <h2>{{ bonus ? 'Modifier une Prime' : 'Ajouter une Prime' }}</h2>
              <p class="modal-subtitle">{{ bonus ? 'Modifiez les informations de la prime' : 'Attribuez une prime à un employé' }}</p>
            </div>
          </div>
          <button class="modal-close" @click="$emit('close')" aria-label="Fermer">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label for="bonus-employee">
                <i class="fas fa-user-tie"></i>
                Employé
              </label>
              <select id="bonus-employee" v-model="formData.employeeId" required>
                <option value="">Sélectionner un employé</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="bonus-amount">
                <i class="fas fa-euro-sign"></i>
                Montant de la prime (€)
              </label>
              <input 
                type="number" 
                id="bonus-amount" 
                v-model.number="formData.amount" 
                step="0.01" 
                min="0" 
                required
                placeholder="0.00"
              >
            </div>
            
            <div class="form-group">
              <label for="bonus-date">
                <i class="fas fa-calendar-alt"></i>
                Date
              </label>
              <input type="date" id="bonus-date" v-model="formData.date" required>
            </div>
            
            <div class="form-group full-width">
              <label for="bonus-description">
                <i class="fas fa-align-left"></i>
                Raison de la prime (optionnel)
              </label>
              <textarea 
                id="bonus-description" 
                v-model="formData.description" 
                rows="3" 
                placeholder="Ex: Prime de performance, Prime exceptionnelle..."
              ></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              <i class="fas fa-times"></i>
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-check"></i>
              {{ bonus ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFirestore } from '../../../composables/useFirestore'

const props = defineProps({
  bonus: Object,
  employees: Array
})

const emit = defineEmits(['close', 'save'])

const { formatDateInput } = useFirestore()

const formData = ref({
  employeeId: '',
  amount: 0,
  date: '',
  description: ''
})

watch(() => props.bonus, (newBonus) => {
  if (newBonus) {
    formData.value = {
      employeeId: newBonus.employeeId || '',
      amount: newBonus.amount || 0,
      date: formatDateInput(newBonus.date),
      description: newBonus.description || ''
    }
  } else {
    formData.value = {
      employeeId: '',
      amount: 0,
      date: formatDateInput(new Date()),
      description: ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', formData.value)
}
</script>

<style scoped>
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
  animation: fadeIn 0.15s ease-out;
  will-change: opacity;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  will-change: transform, opacity;
  transform: translateZ(0);
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
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.modal-header-content {
  display: flex;
  gap: 1.25rem;
  flex: 1;
}

.modal-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.modal-subtitle {
  font-size: 0.9rem;
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
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 1.1rem;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c1810;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group label i {
  color: #ffc107;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #ffc107;
  background: white;
  box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.1);
  transform: translateY(-1px);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
  margin-top: auto;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Noto Sans JP', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.4);
}

.btn-secondary {
  background: white;
  color: #6c757d;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-header {
    padding: 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-body {
    padding: 1.25rem;
  }

  .modal-footer {
    padding: 1.25rem;
  }
}
</style>
