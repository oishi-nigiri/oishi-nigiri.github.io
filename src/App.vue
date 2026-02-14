<template>
  <div id="app">
    <RoleplayDisclaimer />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import RoleplayDisclaimer from './components/RoleplayDisclaimer.vue'

onMounted(() => {
  console.log('Oishi Nigiri App loaded')
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>




