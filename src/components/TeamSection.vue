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
  background: #0f0f0f;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-title {
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  margin-bottom: 3rem;
  color: #fff;
  font-weight: 400;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.section-title .title-decor {
  color: #e85a4f;
  margin: 0 1rem;
}

.loading-menu {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.organigramme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.team-member-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.team-member-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(232, 90, 79, 0.3);
}

.team-member-photo {
  margin-bottom: 1.25rem;
}

.team-member-photo img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(232, 90, 79, 0.5);
  margin: 0 auto;
  display: block;
  transition: all 0.3s ease;
}

.team-member-card:hover .team-member-photo img {
  border-color: #e85a4f;
}

.team-member-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(232, 90, 79, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto;
  border: 2px solid rgba(232, 90, 79, 0.5);
  transition: all 0.3s ease;
}

.team-member-card:hover .team-member-placeholder {
  border-color: #e85a4f;
}

.team-member-info {
  margin-top: 0.75rem;
}

.team-member-name {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  font-family: 'Playfair Display', serif;
  font-weight: 500;
}

.team-member-role {
  color: #e85a4f;
  font-size: 0.8rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.team-member-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  line-height: 1.6;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .team-section {
    padding: 3.5rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .section-title {
    font-size: 1.4rem;
    letter-spacing: 2px;
    margin-bottom: 2.5rem;
  }

  .organigramme-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .team-member-card {
    padding: 1.5rem 1rem;
  }

  .team-member-photo img,
  .team-member-placeholder {
    width: 80px;
    height: 80px;
  }

  .team-member-name {
    font-size: 1rem;
  }

  .team-member-role {
    font-size: 0.7rem;
  }

  .team-member-description {
    display: none;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.2rem;
  }

  .section-title .title-decor {
    display: none;
  }

  .organigramme-grid {
    grid-template-columns: 1fr;
  }

  .team-member-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
    padding: 1rem;
  }

  .team-member-photo {
    margin-bottom: 0;
  }

  .team-member-photo img,
  .team-member-placeholder {
    width: 60px;
    height: 60px;
  }

  .team-member-info {
    margin-top: 0;
  }
}
</style>

