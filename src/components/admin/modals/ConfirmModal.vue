<template>
  <Teleport to="body">
    <div class="confirm-overlay" @click.self="handleCancel">
      <div class="confirm-container">
        <div class="confirm-icon" :class="iconClass">
          <i :class="icon"></i>
        </div>
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button v-if="cancelText" @click="handleCancel" class="btn btn-cancel">
            <i class="fas fa-times"></i>
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="btn btn-confirm" :class="confirmClass">
            <i :class="confirmIcon"></i>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmer'
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  type: {
    type: String,
    default: 'warning', // warning, danger, info, success
    validator: (value) => ['warning', 'danger', 'info', 'success'].includes(value)
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const iconMap = {
  warning: 'fas fa-exclamation-triangle',
  danger: 'fas fa-exclamation-circle',
  info: 'fas fa-info-circle',
  success: 'fas fa-check-circle'
}

const icon = computed(() => iconMap[props.type] || iconMap.warning)

const iconClass = computed(() => `icon-${props.type}`)

const confirmIcon = computed(() => {
  if (props.type === 'danger') return 'fas fa-trash'
  if (props.type === 'success') return 'fas fa-check'
  return 'fas fa-check'
})

const confirmClass = computed(() => {
  if (props.type === 'danger') return 'btn-danger'
  if (props.type === 'success') return 'btn-success'
  return 'btn-primary'
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 3000;
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

.confirm-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  transform: translateZ(0);
  text-align: center;
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

.confirm-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
  position: relative;
}

.confirm-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0.15;
}

.icon-warning {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
}

.icon-warning::before {
  background: #ffc107;
}

.icon-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.icon-danger::before {
  background: #ef4444;
}

.icon-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.icon-info::before {
  background: #3b82f6;
}

.icon-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.icon-success::before {
  background: #10b981;
}

.confirm-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 1rem 0;
  letter-spacing: -0.5px;
}

.confirm-message {
  font-size: 1rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: 'Noto Sans JP', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  justify-content: center;
}

.btn-cancel {
  background: white;
  color: #6c757d;
  border: 2px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-confirm {
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #9a1629 0%, #c41e3a 100%);
  box-shadow: 0 4px 12px rgba(196, 30, 58, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-success:hover {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

@media (max-width: 768px) {
  .confirm-container {
    padding: 2rem 1.5rem;
    max-width: 95%;
    margin: 0.5rem;
  }
  
  .confirm-icon {
    width: 64px;
    height: 64px;
    font-size: 2rem;
  }
  
  .confirm-title {
    font-size: 1.25rem;
  }

  .confirm-message {
    font-size: 0.95rem;
  }
  
  .confirm-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .confirm-container {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    padding: 1.5rem 1.25rem;
  }

  .confirm-icon {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
  }

  .confirm-title {
    font-size: 1.1rem;
  }

  .confirm-message {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
}
</style>

