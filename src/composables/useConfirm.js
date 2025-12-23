import { ref } from 'vue'

const showConfirm = ref(false)
const confirmConfig = ref({
  title: 'Confirmation',
  message: '',
  confirmText: 'Confirmer',
  cancelText: 'Annuler',
  type: 'warning',
  onConfirm: null,
  onCancel: null
})

export function useConfirm() {
  const confirm = (message, options = {}) => {
    return new Promise((resolve, reject) => {
      confirmConfig.value = {
        title: options.title || 'Confirmation',
        message: message,
        confirmText: options.confirmText || 'Confirmer',
        cancelText: options.cancelText || 'Annuler',
        type: options.type || 'warning',
        onConfirm: () => {
          showConfirm.value = false
          resolve(true)
        },
        onCancel: () => {
          showConfirm.value = false
          resolve(false)
        }
      }
      showConfirm.value = true
    })
  }

  const alert = (message, options = {}) => {
    return new Promise((resolve) => {
      confirmConfig.value = {
        title: options.title || 'Information',
        message: message,
        confirmText: options.confirmText || 'OK',
        cancelText: '',
        type: options.type || 'info',
        onConfirm: () => {
          showConfirm.value = false
          resolve()
        },
        onCancel: () => {
          showConfirm.value = false
          resolve()
        }
      }
      showConfirm.value = true
    })
  }

  return {
    showConfirm,
    confirmConfig,
    confirm,
    alert
  }
}




