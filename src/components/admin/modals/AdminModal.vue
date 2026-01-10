<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="modal-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div>
              <h2>{{ admin ? 'Modifier un Administrateur' : 'Ajouter un Administrateur' }}</h2>
              <p class="modal-subtitle">{{ admin ? 'Modifiez les permissions de l\'administrateur' : 'Ajoutez un nouvel administrateur avec des permissions personnalisées' }}</p>
            </div>
          </div>
          <button class="modal-close" @click="$emit('close')" aria-label="Fermer">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label for="admin-discord-id">
              <i class="fab fa-discord"></i>
              Discord ID *
            </label>
            <input 
              type="text" 
              id="admin-discord-id" 
              v-model="formData.discordId" 
              required 
              placeholder="Ex: 123456789012345678"
              autocomplete="off"
            >
            <small class="form-hint">
              <i class="fas fa-info-circle"></i>
              L'ID Discord de l'utilisateur (visible dans le mode développeur Discord)
            </small>
          </div>
          
          <div class="form-group">
            <label for="admin-username">
              <i class="fas fa-user"></i>
              Nom d'utilisateur (optionnel)
            </label>
            <input 
              type="text" 
              id="admin-username" 
              v-model="formData.username" 
              placeholder="Ex: JohnDoe#1234"
              autocomplete="off"
            >
          </div>
          
          <div class="form-group">
            <label class="permissions-label">
              <i class="fas fa-key"></i>
              Permissions
            </label>
            <div class="permissions-grid">
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.menu">
                <div class="permission-content">
                  <i class="fas fa-utensils"></i>
                  <span>Carte</span>
                </div>
              </label>
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.team">
                <div class="permission-content">
                  <i class="fas fa-users"></i>
                  <span>Équipe</span>
                </div>
              </label>
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.sales">
                <div class="permission-content">
                  <i class="fas fa-chart-line"></i>
                  <span>Ventes</span>
                </div>
              </label>
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.history">
                <div class="permission-content">
                  <i class="fas fa-history"></i>
                  <span>Historique</span>
                </div>
              </label>
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.resetSales">
                <div class="permission-content">
                  <i class="fas fa-redo"></i>
                  <span>Réinit. Ventes</span>
                </div>
              </label>
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.bonuses">
                <div class="permission-content">
                  <i class="fas fa-gift"></i>
                  <span>Primes</span>
                </div>
              </label>
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.employees">
                <div class="permission-content">
                  <i class="fas fa-user-tie"></i>
                  <span>Employés</span>
                </div>
              </label>
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.ranks">
                <div class="permission-content">
                  <i class="fas fa-star"></i>
                  <span>Grades</span>
                </div>
              </label>
              <label class="permission-item">
                <input type="checkbox" v-model="formData.permissions.admins">
                <div class="permission-content">
                  <i class="fas fa-shield-alt"></i>
                  <span>Administrateurs</span>
                </div>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              <i class="fas fa-times"></i>
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-check"></i>
              {{ admin ? 'Modifier' : 'Ajouter' }}
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
  admin: Object
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  discordId: '',
  username: '',
  permissions: {
    menu: true,
    team: true,
    sales: true,
    history: false,
    resetSales: false,
    bonuses: false,
    employees: true,
    ranks: true,
    admins: false
  }
})

watch(() => props.admin, (newAdmin) => {
  if (newAdmin) {
    formData.value = {
      discordId: newAdmin.discordId || '',
      username: newAdmin.username || '',
      permissions: { ...formData.value.permissions, ...(newAdmin.permissions || {}) }
    }
  } else {
    formData.value = {
      discordId: '',
      username: '',
      permissions: {
        menu: true,
        team: true,
        sales: true,
        history: false,
        resetSales: false,
        bonuses: false,
        employees: true,
        ranks: true,
        admins: false
      }
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
  max-width: 650px;
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
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
  color: #28a745;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-group input:focus {
  outline: none;
  border-color: #28a745;
  background: white;
  box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.1);
  transform: translateY(-1px);
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.form-hint i {
  color: #28a745;
  font-size: 0.8rem;
}

.permissions-label {
  margin-bottom: 1rem !important;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.permission-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.875rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  background: white;
  border: 2px solid #e5e7eb;
  position: relative;
}

.permission-item:hover {
  border-color: #28a745;
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.1);
}

.permission-item input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.permission-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  font-weight: 500;
  color: #2c1810;
}

.permission-content i {
  color: #28a745;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.permission-item input[type="checkbox"]:checked + .permission-content {
  color: #28a745;
  font-weight: 600;
}

.permission-item input[type="checkbox"]:checked ~ .permission-content,
.permission-item:has(input[type="checkbox"]:checked) {
  border-color: #28a745;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
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
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #20c997 0%, #28a745 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
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
  .permissions-grid {
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

  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
