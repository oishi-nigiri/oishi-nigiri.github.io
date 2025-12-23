<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="modal-icon">
              <i class="fas fa-user-tie"></i>
            </div>
            <div>
              <h2>{{ employee ? 'Modifier un Employé' : 'Ajouter un Employé' }}</h2>
              <p class="modal-subtitle">{{ employee ? 'Modifiez les informations de l\'employé' : 'Ajoutez un nouvel employé à votre équipe' }}</p>
            </div>
          </div>
          <button class="modal-close" @click="$emit('close')" aria-label="Fermer">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label for="employee-name">
              <i class="fas fa-user"></i>
              Nom
            </label>
            <input 
              type="text" 
              id="employee-name" 
              v-model="formData.name" 
              required 
              placeholder="Ex: Jean Dupont"
              autocomplete="off"
            >
          </div>
          
          <div class="form-group">
            <label for="employee-rank">
              <i class="fas fa-star"></i>
              Grade
            </label>
            <select id="employee-rank" v-model="formData.rankId" required>
              <option value="">Sélectionner un grade</option>
              <option v-for="rank in ranks" :key="rank.id" :value="rank.id">{{ rank.name }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="employee-discord-id">
              <i class="fab fa-discord"></i>
              Discord ID (optionnel)
            </label>
            <div class="discord-id-selector">
              <select 
                id="employee-discord-id-select" 
                v-model="selectedAdminId"
                @change="onAdminSelect"
                class="discord-select"
              >
                <option value="">Sélectionner un administrateur</option>
                <option v-for="admin in admins" :key="admin.id" :value="admin.discordId">
                  {{ admin.username || admin.discordId || 'Admin' }} ({{ admin.discordId }})
                </option>
                <option value="manual">Saisir manuellement</option>
              </select>
              <input 
                v-if="showManualInput"
                type="text" 
                id="employee-discord-id" 
                v-model="formData.discordId" 
                placeholder="Ex: 123456789012345678"
                autocomplete="off"
                class="discord-input"
              >
            </div>
            <small class="form-hint">
              <i class="fas fa-info-circle"></i>
              Choisissez un administrateur ou saisissez l'ID Discord pour que l'employé puisse supprimer ses propres ventes
            </small>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              <i class="fas fa-times"></i>
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-check"></i>
              {{ employee ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  employee: Object,
  ranks: Array,
  admins: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  name: '',
  rankId: '',
  discordId: ''
})

const selectedAdminId = ref('')
const showManualInput = ref(false)

watch(() => props.employee, (newEmployee) => {
  if (newEmployee) {
    formData.value = {
      name: newEmployee.name || '',
      rankId: newEmployee.rankId || '',
      discordId: newEmployee.discordId || ''
    }
    // Si l'employé a un discordId, chercher s'il correspond à un admin
    if (newEmployee.discordId) {
      const matchingAdmin = props.admins.find(a => a.discordId === newEmployee.discordId)
      if (matchingAdmin) {
        selectedAdminId.value = matchingAdmin.discordId
        showManualInput.value = false
      } else {
        selectedAdminId.value = 'manual'
        showManualInput.value = true
      }
    } else {
      selectedAdminId.value = ''
      showManualInput.value = false
    }
  } else {
    formData.value = {
      name: '',
      rankId: '',
      discordId: ''
    }
    selectedAdminId.value = ''
    showManualInput.value = false
  }
}, { immediate: true })

const onAdminSelect = () => {
  if (selectedAdminId.value === 'manual') {
    showManualInput.value = true
    formData.value.discordId = ''
  } else if (selectedAdminId.value) {
    formData.value.discordId = selectedAdminId.value
    showManualInput.value = false
  } else {
    formData.value.discordId = ''
    showManualInput.value = false
  }
}

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
  max-width: 500px;
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
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group:last-of-type {
  margin-bottom: 0;
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
  color: #17a2b8;
  font-size: 0.9rem;
}

.form-group input,
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
.form-group select:focus {
  outline: none;
  border-color: #17a2b8;
  background: white;
  box-shadow: 0 0 0 4px rgba(23, 162, 184, 0.1);
  transform: translateY(-1px);
}

.discord-id-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.discord-select {
  width: 100%;
}

.discord-input {
  width: 100%;
  margin-top: 0;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.form-hint i {
  color: #17a2b8;
  font-size: 0.8rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
  margin-top: 1.5rem;
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
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #138496 0%, #17a2b8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(23, 162, 184, 0.4);
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
