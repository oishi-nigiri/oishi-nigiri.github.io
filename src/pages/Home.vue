<template>
  <div class="home-page">
    <Navbar />
    <HeroSection />
    <WeeklyMenuSection />
    <AboutSection />
    <TeamSection />
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import WeeklyMenuSection from '../components/WeeklyMenuSection.vue'
import AboutSection from '../components/AboutSection.vue'
import TeamSection from '../components/TeamSection.vue'
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}
</style>




