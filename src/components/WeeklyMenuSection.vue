<template>
  <section id="carte-semaine" class="weekly-menu-section">
    <div class="container">
      <h2 class="section-title">
        <span class="title-decor">━</span>
        Carte de la Semaine
        <span class="title-decor">━</span>
      </h2>
      <div v-if="loading" class="loading-menu">
        <p>Chargement de la carte de la semaine...</p>
      </div>
      <div v-else-if="useImageMode && imageUrl" class="weekly-menu-image-container">
        <img :src="imageUrl" alt="Carte de la semaine" class="weekly-menu-image">
      </div>
      <div v-else-if="menuItems.length === 0" class="loading-menu">
        <p>Aucune carte de la semaine disponible pour le moment.</p>
      </div>
      <div v-else class="weekly-menu-grid">
        <div v-for="category in sortedCategories" :key="category" class="weekly-menu-category-section">
          <h3 class="weekly-menu-category-title">{{ category }}</h3>
          <div class="weekly-menu-grid">
            <div v-for="item in getItemsByCategory(category)" :key="item.id" class="weekly-menu-item">
              <div class="weekly-menu-item-header">
                <div class="weekly-menu-item-title">{{ item.name }}</div>
                <div class="weekly-menu-item-price">{{ item.price }}€</div>
              </div>
              <div class="weekly-menu-item-description">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDb } from '../composables/useFirebase'
import { collection, getDocs, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'

const menuItems = ref([])
const categories = ref([])
const loading = ref(true)
const useImageMode = ref(false)
const imageUrl = ref('')

const sortedCategories = computed(() => {
  const categoryMap = {}
  categories.value.forEach(cat => {
    categoryMap[cat.name] = cat.order || 999
  })
  
  const cats = [...new Set(menuItems.value.map(item => item.category || 'Sans catégorie'))]
  return cats.sort((a, b) => {
    const orderA = categoryMap[a] !== undefined ? categoryMap[a] : 999
    const orderB = categoryMap[b] !== undefined ? categoryMap[b] : 999
    if (orderA !== orderB) return orderA - orderB
    return a.localeCompare(b)
  })
})

const getItemsByCategory = (category) => {
  return menuItems.value
    .filter(item => (item.category || 'Sans catégorie') === category)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

const loadMenu = async () => {
  try {
    loading.value = true
    const db = getDb()
    
    // Charger la configuration
    const configDoc = await getDoc(doc(db, 'menuConfig', 'display'))
    if (configDoc.exists()) {
      const config = configDoc.data()
      useImageMode.value = config.useImageMode || false
      imageUrl.value = config.imageUrl || ''
    }
    
    if (useImageMode.value && imageUrl.value) {
      loading.value = false
      return
    }
    
    // Charger les catégories
    const categoriesSnapshot = await getDocs(query(collection(db, 'menuCategories'), orderBy('order', 'asc')))
    categories.value = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Charger les items
    const menuSnapshot = await getDocs(collection(db, 'menuSemaine'))
    menuItems.value = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement du menu:', error)
    loading.value = false
  }
}

onMounted(() => {
  loadMenu()
  
  // Écouter les changements
  const db = getDb()
  onSnapshot(collection(db, 'menuSemaine'), () => {
    loadMenu()
  })
  
  onSnapshot(doc(db, 'menuConfig', 'display'), () => {
    loadMenu()
  })
})
</script>

<style scoped>
.weekly-menu-section {
  background: white;
  padding: 5rem 0;
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
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #666;
}

.weekly-menu-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.weekly-menu-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.weekly-menu-image:hover {
  transform: scale(1.02);
}

.weekly-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.weekly-menu-category-section {
  grid-column: 1 / -1;
  margin-bottom: 3rem;
}

.weekly-menu-category-title {
  font-size: 2rem;
  color: #2c1810;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #c41e3a;
}

.weekly-menu-item {
  background: #fff8f0;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  border-left: 4px solid #c41e3a;
}

.weekly-menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.weekly-menu-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.weekly-menu-item-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  color: #2c1810;
  font-weight: 600;
}

.weekly-menu-item-price {
  color: #c41e3a;
  font-weight: 700;
  font-size: 1.3rem;
}

.weekly-menu-item-description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-top: 0.75rem;
}

@media (max-width: 1024px) {
  .weekly-menu-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .weekly-menu-section {
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
  
  .weekly-menu-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .weekly-menu-category-title {
    font-size: 1.5rem;
  }

  .weekly-menu-item {
    padding: 1.25rem;
  }

  .weekly-menu-item-title {
    font-size: 1.1rem;
  }

  .weekly-menu-item-price {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.75rem;
  }

  .title-decor {
    display: none;
  }

  .weekly-menu-item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>

