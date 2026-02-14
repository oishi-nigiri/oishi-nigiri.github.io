<template>
  <div id="app">
    <RoleplayDisclaimer />
    <TrollModal />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import RoleplayDisclaimer from './components/RoleplayDisclaimer.vue'
import TrollModal from './components/TrollModal.vue'

onMounted(() => {
  console.log('Oishi Nigiri App loaded')
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>




