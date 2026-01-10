<template>
  <ConfirmModal
    v-if="showConfirm"
    :title="confirmConfig.title"
    :message="confirmConfig.message"
    :confirmText="confirmConfig.confirmText"
    :cancelText="confirmConfig.cancelText"
    :type="confirmConfig.type"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { watch } from 'vue'
import { useConfirm } from '../../composables/useConfirm'
import ConfirmModal from './modals/ConfirmModal.vue'

const { showConfirm, confirmConfig } = useConfirm()

const handleConfirm = () => {
  if (confirmConfig.value.onConfirm) {
    confirmConfig.value.onConfirm()
  }
}

const handleCancel = () => {
  if (confirmConfig.value.onCancel) {
    confirmConfig.value.onCancel()
  } else if (!confirmConfig.value.cancelText) {
    // Si pas de bouton annuler (pour les alertes), fermer quand même
    if (confirmConfig.value.onConfirm) {
      confirmConfig.value.onConfirm()
    }
  }
}
</script>

