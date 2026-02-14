<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="modal-icon">
              <i class="fas fa-star"></i>
            </div>
            <div>
              <h2>{{ rank ? 'Modifier un Grade' : 'Créer un Grade' }}</h2>
              <p class="modal-subtitle">{{ rank ? 'Modifiez les informations du grade' : 'Créez un nouveau grade avec un pourcentage de commission' }}</p>
            </div>
          </div>
          <button class="modal-close" @click="$emit('close')" aria-label="Fermer">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label for="rank-name">
              <i class="fas fa-tag"></i>
              Nom du Grade
            </label>
            <input 
              type="text" 
              id="rank-name" 
              v-model="formData.name" 
              required 
              placeholder="Ex: Serveur, Chef, Manager..."
              autocomplete="off"
            >
          </div>
          
          <div class="form-group">
            <label for="rank-percentage">
              <i class="fas fa-percent"></i>
              Pourcentage de Commission (%)
            </label>
            <input 
              type="number" 
              id="rank-percentage" 
              v-model.number="formData.percentage" 
              step="0.01" 
              min="0" 
              max="100" 
              required 
              placeholder="Ex: 5.5"
            >
            <small class="form-hint">
              <i class="fas fa-info-circle"></i>
              Le pourcentage que les employés de ce grade gagneront sur chaque vente
            </small>
          </div>
          
          <div class="form-group">
            <label for="rank-description">
              <i class="fas fa-align-left"></i>
              Description (optionnel)
            </label>
            <textarea 
              id="rank-description" 
              v-model="formData.description" 
              rows="3" 
              placeholder="Description du grade..."
            ></textarea>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              <i class="fas fa-times"></i>
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-check"></i>
              {{ rank ? 'Modifier' : 'Créer' }}
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
  rank: Object
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  name: '',
  percentage: 0,
  description: ''
})

watch(() => props.rank, (newRank) => {
  if (newRank) {
    formData.value = {
      name: newRank.name || '',
      percentage: newRank.percentage || 0,
      description: newRank.description || ''
    }
  } else {
    formData.value = {
      name: '',
      percentage: 0,
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
  background: #1b1e26;
  border-radius: 20px;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid #2a2d35;
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
  background: #252831;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  border-bottom: 1px solid #2a2d35;
}

.modal-header-content {
  display: flex;
  gap: 1.25rem;
  flex: 1;
}

.modal-icon {
  width: 56px;
  height: 56px;
  background: #c41e3a;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  color: white;
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
  background: #2a2d35;
  border: 1px solid #3a3d45;
  color: #ffffff;
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
  background: #3a3d45;
  border-color: #c41e3a;
  color: #c41e3a;
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
  background: #1b1e26;
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
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group label i {
  color: #c41e3a;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #3a3d45;
  border-radius: 8px;
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #252831;
  color: #ffffff;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #c41e3a;
  background: #2a2d35;
  box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
  transform: translateY(-1px);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #6b7280;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a0a0a8;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  padding: 0.5rem;
  background: #252831;
  border-radius: 8px;
  border: 1px solid #2a2d35;
}

.form-hint i {
  color: #c41e3a;
  font-size: 0.8rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #2a2d35;
  margin-top: 1.5rem;
  background: #1b1e26;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Noto Sans JP', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.btn-primary {
  background: #c41e3a;
  color: white;
}

.btn-primary:hover {
  background: #a01a2e;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(196, 30, 58, 0.4);
}

.btn-secondary {
  background: #252831;
  color: #ffffff;
  border: 1px solid #3a3d45;
}

.btn-secondary:hover {
  background: #2a2d35;
  border-color: #3a3d45;
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
