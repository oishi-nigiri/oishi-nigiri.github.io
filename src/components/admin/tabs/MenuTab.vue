<template>
  <div class="menu-dashboard">
    <!-- Header avec actions rapides -->
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="dashboard-title">Gestion de la Carte</h1>
          <p class="dashboard-subtitle">Gérez vos catégories et plats de la semaine</p>
        </div>
        <div class="header-actions">
          <button @click="openItemModal()" class="btn-action btn-primary-action">
            <i class="fas fa-plus-circle"></i>
            <span>Nouveau Plat</span>
          </button>
          <button @click="openCategoryModal()" class="btn-action btn-secondary-action">
            <i class="fas fa-folder-plus"></i>
            <span>Nouvelle Catégorie</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div class="stats-grid">
      <div class="stat-card-large primary">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-utensils"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total Plats</div>
            <div class="stat-value-large">
              <span>{{ menuItems.length }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-list"></i>
          <span>{{ sortedCategories.length }} catégories</span>
        </div>
      </div>

      <div class="stat-card-large success">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-folder"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Catégories</div>
            <div class="stat-value-large">
              <span>{{ categories.length }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-check-circle"></i>
          <span>Organisées</span>
        </div>
      </div>

      <div class="stat-card-large warning">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-image"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Mode Affichage</div>
            <div class="stat-value-large">
              <span>{{ useImageMode ? 'Image' : 'Manuel' }}</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-toggle-on"></i>
          <span>{{ useImageMode ? 'Activé' : 'Désactivé' }}</span>
        </div>
      </div>

      <div class="stat-card-large info">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-euro-sign"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Prix Moyen</div>
            <div class="stat-value-large">
              <span>{{ averagePrice.toFixed(2) }}</span>
              <span class="currency">€</span>
            </div>
          </div>
        </div>
        <div class="stat-trend">
          <i class="fas fa-chart-bar"></i>
          <span>Prix moyen</span>
        </div>
      </div>
    </div>

    <!-- Configuration du mode d'affichage -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Configuration d'Affichage</h2>
          <p class="section-description">Choisissez comment afficher le menu sur le site</p>
        </div>
      </div>

      <div class="config-card">
        <div class="config-item">
          <label class="checkbox-label-modern">
            <input type="checkbox" v-model="useImageMode" @change="updateImageMode">
            <span class="checkbox-custom"></span>
            <div class="checkbox-content">
              <span class="checkbox-title">Utiliser une image au lieu du menu manuel</span>
              <span class="checkbox-description">Si coché, seule l'image sera affichée sur le site</span>
            </div>
          </label>
        </div>
        <div v-if="useImageMode" class="config-item">
          <label for="menu-image-url" class="form-label-modern">
            <i class="fas fa-link"></i>
            URL de l'image du menu
          </label>
          <input 
            type="url" 
            id="menu-image-url" 
            v-model="imageUrl" 
            placeholder="https://..."
            @blur="saveMenuConfig"
            class="form-input-modern"
          >
          <small class="form-hint-modern">
            <i class="fas fa-info-circle"></i>
            Collez ici le lien de l'image (ex: depuis Discord ou un hébergeur d'images)
          </small>
        </div>
      </div>
    </div>

    <!-- Catégories -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Catégories</h2>
          <p class="section-description">Organisez vos plats par catégories</p>
        </div>
        <div class="section-actions">
          <button @click="openCategoryModal()" class="btn-icon-text">
            <i class="fas fa-plus"></i>
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>
      <div v-else-if="categories.length === 0" class="empty-container">
        <i class="fas fa-folder-open"></i>
        <p>Aucune catégorie. Ajoutez-en une pour commencer !</p>
      </div>
      <div v-else class="categories-grid">
        <div v-for="category in sortedCategories" :key="category.id" class="category-card-modern">
          <div class="card-header-modern">
            <div class="card-icon">
              <i class="fas fa-folder"></i>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ category.name }}</h3>
              <p class="card-subtitle">Ordre: {{ category.order || 0 }}</p>
            </div>
          </div>
          <div class="card-actions-modern">
            <button @click="openCategoryModal(category)" class="btn-card-action">
              <i class="fas fa-edit"></i>
              <span>Modifier</span>
            </button>
            <button @click="deleteCategory(category.id)" class="btn-card-action danger">
              <i class="fas fa-trash"></i>
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Plats de la Semaine -->
    <div class="content-section">
      <div class="section-header-modern">
        <div>
          <h2 class="section-title">Plats de la Semaine</h2>
          <p class="section-description">Gérez les plats disponibles cette semaine</p>
        </div>
        <div class="section-actions">
          <button @click="openItemModal()" class="btn-icon-text">
            <i class="fas fa-plus"></i>
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>
      <div v-else-if="menuItems.length === 0" class="empty-container">
        <i class="fas fa-utensils"></i>
        <p>Aucun plat dans la carte. Ajoutez-en un pour commencer !</p>
      </div>
      <div v-else>
        <div v-for="category in sortedCategories" :key="category" class="category-section-modern">
          <h3 class="category-title-modern">
            <i class="fas fa-folder-open"></i>
            {{ category }}
          </h3>
          <div class="items-grid-modern">
            <div v-for="item in getItemsByCategory(category)" :key="item.id" class="menu-item-card-modern">
              <div class="card-header-modern">
                <div class="card-info">
                  <h3 class="card-title">{{ item.name }}</h3>
                  <div class="card-price-modern">{{ item.price }}€</div>
                </div>
                <div class="card-badge">
                  <i class="fas fa-tag"></i>
                  {{ item.category }}
                </div>
              </div>
              <div v-if="item.description" class="card-description">
                {{ item.description }}
              </div>
              <div class="card-actions-modern">
                <button @click="openItemModal(item)" class="btn-card-action">
                  <i class="fas fa-edit"></i>
                  <span>Modifier</span>
                </button>
                <button @click="deleteItem(item.id)" class="btn-card-action danger">
                  <i class="fas fa-trash"></i>
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <ItemModal 
      v-if="showItemModal"
      :item="editingItem"
      :categories="categories"
      @close="closeItemModal"
      @save="saveItem"
    />
    
    <CategoryModal
      v-if="showCategoryModal"
      :category="editingCategory"
      @close="closeCategoryModal"
      @save="saveCategory"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDb } from '../../../composables/useFirebase'
import { useConfirm } from '../../../composables/useConfirm'
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, setDoc } from 'firebase/firestore'
import ItemModal from '../modals/ItemModal.vue'
import CategoryModal from '../modals/CategoryModal.vue'

const menuItems = ref([])
const categories = ref([])
const loading = ref(true)
const useImageMode = ref(false)
const imageUrl = ref('')
const showItemModal = ref(false)
const showCategoryModal = ref(false)
const editingItem = ref(null)
const editingCategory = ref(null)
const { confirm, alert } = useConfirm()

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

const averagePrice = computed(() => {
  if (menuItems.value.length === 0) return 0
  const total = menuItems.value.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    return sum + price
  }, 0)
  return total / menuItems.value.length
})

const getItemsByCategory = (category) => {
  return menuItems.value
    .filter(item => (item.category || 'Sans catégorie') === category)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

const loadData = async () => {
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
    
    // Charger les catégories
    const categoriesSnapshot = await getDocs(query(collection(db, 'menuCategories'), orderBy('order', 'asc')))
    categories.value = categoriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    
    // Charger les items
    const menuSnapshot = await getDocs(collection(db, 'menuSemaine'))
    menuItems.value = menuSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    
    loading.value = false
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    loading.value = false
  }
}

const saveMenuConfig = async () => {
  try {
    const db = getDb()
    await setDoc(doc(db, 'menuConfig', 'display'), {
      useImageMode: useImageMode.value,
      imageUrl: imageUrl.value
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la config:', error)
    alert('Erreur lors de la sauvegarde')
  }
}

const updateImageMode = () => {
  saveMenuConfig()
}

const openItemModal = (item = null) => {
  editingItem.value = item
  showItemModal.value = true
}

const closeItemModal = () => {
  showItemModal.value = false
  editingItem.value = null
}

const saveItem = async (itemData) => {
  try {
    const db = getDb()
    if (editingItem.value) {
      await updateDoc(doc(db, 'menuSemaine', editingItem.value.id), {
        ...itemData,
        updatedAt: new Date()
      })
    } else {
      await addDoc(collection(db, 'menuSemaine'), {
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    closeItemModal()
    loadData()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    await alert('Erreur lors de la sauvegarde', { type: 'danger' })
  }
}

const deleteItem = async (id) => {
  const result = await confirm('Êtes-vous sûr de vouloir supprimer ce plat ?', {
    type: 'danger',
    title: 'Supprimer un plat',
    confirmText: 'Supprimer'
  })
  if (!result) return
  
  try {
    const db = getDb()
    await deleteDoc(doc(db, 'menuSemaine', id))
    loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    await alert('Erreur lors de la suppression', { type: 'danger' })
  }
}

const openCategoryModal = (category = null) => {
  editingCategory.value = category
  showCategoryModal.value = true
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
  editingCategory.value = null
}

const saveCategory = async (categoryData) => {
  try {
    const db = getDb()
    if (editingCategory.value) {
      await updateDoc(doc(db, 'menuCategories', editingCategory.value.id), categoryData)
    } else {
      await addDoc(collection(db, 'menuCategories'), categoryData)
    }
    closeCategoryModal()
    loadData()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    await alert('Erreur lors de la sauvegarde', { type: 'danger' })
  }
}

const deleteCategory = async (id) => {
  const result = await confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?', {
    type: 'danger',
    title: 'Supprimer une catégorie',
    confirmText: 'Supprimer'
  })
  if (!result) return
  
  try {
    const db = getDb()
    await deleteDoc(doc(db, 'menuCategories', id))
    loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    await alert('Erreur lors de la suppression', { type: 'danger' })
  }
}

onMounted(() => {
  loadData()
  
  // Écouter les changements
  const db = getDb()
  onSnapshot(collection(db, 'menuSemaine'), () => loadData())
  onSnapshot(collection(db, 'menuCategories'), () => loadData())
})
</script>

<style scoped>
.menu-dashboard {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Dashboard Header */
.dashboard-header {
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(196, 30, 58, 0.25);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.dashboard-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-family: 'Noto Sans JP', sans-serif;
  white-space: nowrap;
}

.btn-primary-action {
  background: white;
  color: #c41e3a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-secondary-action {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary-action:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card-large {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card-large::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #c41e3a 0%, #9a1629 100%);
}

.stat-card-large:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card-large.primary::before {
  background: linear-gradient(90deg, #c41e3a 0%, #9a1629 100%);
}

.stat-card-large.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-card-large.success::before {
  background: rgba(255, 255, 255, 0.3);
}

.stat-card-large.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stat-card-large.warning::before {
  background: rgba(255, 255, 255, 0.3);
}

.stat-card-large.info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-card-large.info::before {
  background: rgba(255, 255, 255, 0.3);
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: rgba(196, 30, 58, 0.1);
  color: #c41e3a;
  flex-shrink: 0;
}

.stat-card-large.success .stat-icon-wrapper,
.stat-card-large.warning .stat-icon-wrapper,
.stat-card-large.info .stat-icon-wrapper {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.8;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value-large {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  white-space: nowrap;
}

.stat-value-large .currency {
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0.9;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-card-large.success .stat-trend,
.stat-card-large.warning .stat-trend,
.stat-card-large.info .stat-trend {
  border-top-color: rgba(255, 255, 255, 0.2);
}

/* Content Sections */
.content-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.section-description {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-icon-text {
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background: #f3f4f6;
  color: #6c757d;
}

.btn-icon-text:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

/* Config Card */
.config-card {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.config-item {
  margin-bottom: 1.5rem;
}

.config-item:last-child {
  margin-bottom: 0;
}

.checkbox-label-modern {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
}

.checkbox-label-modern input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 24px;
  height: 24px;
  border: 2px solid #c41e3a;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s ease;
}

.checkbox-label-modern input[type="checkbox"]:checked + .checkbox-custom {
  background: #c41e3a;
  border-color: #c41e3a;
}

.checkbox-label-modern input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.checkbox-content {
  flex: 1;
}

.checkbox-title {
  display: block;
  font-weight: 600;
  color: #2c1810;
  margin-bottom: 0.25rem;
}

.checkbox-description {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
}

.form-label-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c1810;
  margin-bottom: 0.5rem;
}

.form-input-modern {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input-modern:focus {
  outline: none;
  border-color: #c41e3a;
  box-shadow: 0 0 0 4px rgba(196, 30, 58, 0.1);
}

.form-hint-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.form-hint-modern i {
  color: #c41e3a;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-card-modern {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.category-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #c41e3a;
}

.card-header-modern {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 0.25rem 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

.card-actions-modern {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-card-action {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background: white;
  color: #6c757d;
  border: 1px solid #e5e7eb;
}

.btn-card-action:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.btn-card-action.danger {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.btn-card-action.danger:hover {
  background: #fecaca;
}

/* Category Section */
.category-section-modern {
  margin-bottom: 2.5rem;
}

.category-section-modern:last-child {
  margin-bottom: 0;
}

.category-title-modern {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c1810;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #c41e3a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.items-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.menu-item-card-modern {
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.menu-item-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #c41e3a;
}

.card-price-modern {
  font-size: 1.5rem;
  font-weight: 700;
  color: #c41e3a;
  margin-top: 0.5rem;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #c41e3a 0%, #9a1629 100%);
  color: white;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.card-description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 1rem 0;
}

/* Loading & Empty States */
.loading-container,
.empty-container {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.loading-container i,
.empty-container i {
  font-size: 3rem;
  color: #c41e3a;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .categories-grid,
  .items-grid-modern {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1.5rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .content-section {
    padding: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .categories-grid,
  .items-grid-modern {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn-action {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 1.25rem;
  }

  .content-section {
    padding: 1.25rem;
  }

  .section-header-modern {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
