<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Oishi Nigiri App loaded')
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>




