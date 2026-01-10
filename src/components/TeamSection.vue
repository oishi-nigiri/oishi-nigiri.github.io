<template>
  <section id="equipe" class="team-section">
    <div class="container">
      <h2 class="section-title">
        <span class="title-decor">━</span>
        Notre Équipe
        <span class="title-decor">━</span>
      </h2>
      <div v-if="loading" class="loading-menu">
        <p>Chargement de l'équipe...</p>
      </div>
      <div v-else-if="members.length === 0" class="loading-menu">
        <p>Aucun membre de l'équipe pour le moment.</p>
      </div>
      <div v-else class="organigramme-grid">
        <div v-for="member in sortedMembers" :key="member.id" class="team-member-card">
          <div class="team-member-photo">
            <img v-if="member.photo" :src="member.photo" :alt="member.name">
            <div v-else class="team-member-placeholder">👤</div>
          </div>
          <div class="team-member-info">
            <h3 class="team-member-name">{{ member.name }}</h3>
            <p class="team-member-role">{{ member.role }}</p>
            <p v-if="member.description" class="team-member-description">{{ member.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDb } from '../composables/useFirebase'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'

const members = ref([])
const loading = ref(true)

const sortedMembers = computed(() => {
  return [...members.value].sort((a, b) => (a.order || 0) - (b.order || 0))
})

const loadTeam = async () => {
  try {
    loading.value = true
    const db = getDb()
    const snapshot = await getDocs(collection(db, 'organigramme'))
    members.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement de l\'équipe:', error)
    loading.value = false
  }
}

onMounted(() => {
  loadTeam()
  
  // Écouter les changements
  const db = getDb()
  onSnapshot(collection(db, 'organigramme'), () => {
    loadTeam()
  })
})
</script>

<style scoped>
.team-section {
  padding: 5rem 0;
  background: #fff8f0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2c1810;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-decor {
  color: #c41e3a;
  font-size: 2rem;
}

.loading-menu {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.organigramme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.team-member-card {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.team-member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.team-member-photo {
  margin-bottom: 1.5rem;
}

.team-member-photo img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #c41e3a;
  margin: 0 auto;
  display: block;
}

.team-member-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #f5deb3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin: 0 auto;
  border: 4px solid #c41e3a;
}

.team-member-info {
  margin-top: 1rem;
}

.team-member-name {
  color: #2c1810;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;
}

.team-member-role {
  color: #c41e3a;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.team-member-description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-top: 1rem;
}

@media (max-width: 1024px) {
  .organigramme-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .team-section {
    padding: 3rem 0;
  }

  .container {
    padding: 0 15px;
  }

  .section-title {
    font-size: 2rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .title-decor {
    font-size: 1.5rem;
  }

  .organigramme-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .team-member-card {
    padding: 1.5rem;
  }

  .team-member-photo img,
  .team-member-placeholder {
    width: 120px;
    height: 120px;
  }

  .team-member-name {
    font-size: 1.25rem;
  }

  .team-member-role {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.75rem;
  }

  .title-decor {
    display: none;
  }

  .team-member-photo img,
  .team-member-placeholder {
    width: 100px;
    height: 100px;
  }
}
</style>

