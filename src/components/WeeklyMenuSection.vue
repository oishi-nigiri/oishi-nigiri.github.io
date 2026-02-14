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
  background: #0f0f0f;
  padding: 5rem 0;
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

.weekly-menu-image-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.weekly-menu-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.weekly-menu-image:hover {
  transform: scale(1.01);
}

.weekly-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.weekly-menu-category-section {
  grid-column: 1 / -1;
  margin-bottom: 2.5rem;
}

.weekly-menu-category-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: #e85a4f;
  font-weight: 400;
  margin-bottom: 1.5rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(232, 90, 79, 0.3);
  padding-bottom: 0.75rem;
}

.weekly-menu-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.25rem;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.weekly-menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(232, 90, 79, 0.3);
}

.weekly-menu-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.weekly-menu-item-title {
  font-size: 1rem;
  color: #fff;
  font-weight: 500;
}

.weekly-menu-item-price {
  color: #e85a4f;
  font-weight: 500;
  font-size: 0.95rem;
}

.weekly-menu-item-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .weekly-menu-section {
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

  .weekly-menu-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .weekly-menu-category-title {
    font-size: 1rem;
  }

  .weekly-menu-item {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.2rem;
  }

  .section-title .title-decor {
    display: none;
  }

  .weekly-menu-item-header {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>

