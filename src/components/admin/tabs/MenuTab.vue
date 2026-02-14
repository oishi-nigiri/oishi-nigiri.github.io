<template>
  <div class="menu-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Gestion de la Carte</h1>
    </div>

    <!-- Section Stats et Actions -->
    <div class="menu-overview-section">
      <div class="menu-header-block">
        <div class="menu-title-block">
          <h2 class="menu-title">Plats</h2>
          <p class="menu-subtitle">{{ menuItems.length }} plat(s) enregistré(s)</p>
        </div>
        <div class="menu-kpis">
          <div class="kpi-item kpi-red">
            <span class="kpi-label">TOTAL</span>
            <span class="kpi-value">{{ menuItems.length }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">CATÉGORIES</span>
            <span class="kpi-value">{{ categories.length }}</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">PRIX MOYEN</span>
            <span class="kpi-value">{{ averagePrice.toFixed(1) }} €</span>
          </div>
          <div class="kpi-item kpi-orange">
            <span class="kpi-label">MODE</span>
            <span class="kpi-value">{{ useImageMode ? "Image" : "Manuel" }}</span>
          </div>
        </div>
      </div>

      <div class="menu-actions">
        <button @click="openItemModal()" class="btn-primary-menu">
          <i class="fas fa-plus"></i>
          <span>Nouveau Plat</span>
        </button>
        <button @click="openCategoryModal()" class="btn-secondary-menu">
          <i class="fas fa-folder-plus"></i>
          <span>Nouvelle Catégorie</span>
        </button>
      </div>
    </div>

    <!-- Configuration d'Affichage -->
    <div class="menu-config-section">
      <div class="config-card">
        <div class="config-item">
          <label class="checkbox-label-modern">
            <input
              type="checkbox"
              v-model="useImageMode"
              @change="updateImageMode"
            />
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
          />
        </div>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="menu-main-content">
      <!-- Left Column: Filters -->
      <div class="left-column">
        <!-- Filters Sidebar -->
        <div class="filters-sidebar">
          <div class="filters-header">
            <h3 class="filters-title">Filtres</h3>
            <button
              @click="filtersExpanded = !filtersExpanded"
              class="filters-toggle"
            >
              <i :class="filtersExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </button>
          </div>

          <div v-show="filtersExpanded" class="filters-content">
            <div class="filter-group">
              <label class="filter-label">Recherche</label>
              <div class="search-wrapper">
                <i class="fas fa-search"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Rechercher..."
                  class="search-input"
                />
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Catégorie</label>
              <select v-model="categoryFilter" class="filter-select">
                <option value="">Toutes les catégories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Tri par</label>
              <select v-model="sortBy" class="filter-select">
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="price-asc">Prix (croissant)</option>
                <option value="price-desc">Prix (décroissant)</option>
                <option value="category-asc">Catégorie (A-Z)</option>
              </select>
            </div>

            <button @click="resetFilters" class="btn-reset-filters">
              <i class="fas fa-times"></i>
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Chargement des données...</p>
        </div>

        <div v-else-if="filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-utensils"></i>
          </div>
          <h3>
            {{ menuItems.length === 0 ? "Aucun plat enregistré" : "Aucun résultat" }}
          </h3>
          <p>
            {{
              menuItems.length === 0
                ? "Commencez par ajouter votre premier plat"
                : "Aucun plat ne correspond à vos critères"
            }}
          </p>
          <button
            v-if="menuItems.length === 0"
            @click="openItemModal()"
            class="btn-primary-menu"
          >
            <i class="fas fa-plus"></i>
            <span>Ajouter un Plat</span>
          </button>
        </div>

        <div v-else class="table-wrapper">
          <table class="menu-table">
            <thead>
              <tr>
                <th>NOM</th>
                <th>CATÉGORIE</th>
                <th>PRIX</th>
                <th>DESCRIPTION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item.id">
                <td class="name-cell">
                  <span class="name-text">{{ item.name }}</span>
                </td>
                <td class="category-cell">
                  <span class="category-badge">{{ item.category || "Sans catégorie" }}</span>
                </td>
                <td class="price-cell">
                  <span>{{ item.price }} €</span>
                </td>
                <td class="description-cell">
                  <span v-if="item.description" class="description-text">{{ item.description }}</span>
                  <span v-else class="description-empty">Aucune description</span>
                </td>
                <td class="actions-cell">
                  <button
                    @click="openItemModal(item)"
                    class="btn-icon"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="btn-icon btn-icon-danger"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
import { ref, computed, onMounted } from "vue";
import { getDb } from "../../../composables/useFirebase";
import { useConfirm } from "../../../composables/useConfirm";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import ItemModal from "../modals/ItemModal.vue";
import CategoryModal from "../modals/CategoryModal.vue";

const menuItems = ref([]);
const categories = ref([]);
const loading = ref(true);
const useImageMode = ref(false);
const imageUrl = ref("");
const showItemModal = ref(false);
const showCategoryModal = ref(false);
const editingItem = ref(null);
const editingCategory = ref(null);
const { confirm, alert } = useConfirm();

// Filters
const searchQuery = ref("")
const categoryFilter = ref("")
const sortBy = ref("name-asc")
const filtersExpanded = ref(true)

const categoryOrderMap = computed(() => {
  const map = {};
  categories.value.forEach((cat) => {
    map[cat.name] = cat.order ?? 999;
  });
  return map;
});

const orderedCategories = computed(() => {
  return [...categories.value].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || "").localeCompare(b.name || "");
  });
});

const averagePrice = computed(() => {
  if (menuItems.value.length === 0) return 0;
  const total = menuItems.value.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    return sum + price;
  }, 0);
  return total / menuItems.value.length;
});

const filteredItems = computed(() => {
  let filtered = [...menuItems.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query))
    );
  }

  // Category filter
  if (categoryFilter.value) {
    filtered = filtered.filter((item) => item.category === categoryFilter.value);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");
      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");
      case "price-asc":
        return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      case "price-desc":
        return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      case "category-asc":
        const catA = a.category || "";
        const catB = b.category || "";
        return catA.localeCompare(catB);
      default:
        return 0;
    }
  });

  return filtered;
});

const resetFilters = () => {
  searchQuery.value = ""
  categoryFilter.value = ""
  sortBy.value = "name-asc"
}

const loadData = async () => {
  try {
    loading.value = true;
    const db = getDb();

    // Charger la configuration
    const configDoc = await getDoc(doc(db, "menuConfig", "display"));
    if (configDoc.exists()) {
      const config = configDoc.data();
      useImageMode.value = config.useImageMode || false;
      imageUrl.value = config.imageUrl || "";
    }

    // Charger les catégories
    const categoriesSnapshot = await getDocs(
      query(collection(db, "menuCategories"), orderBy("order", "asc"))
    );
    categories.value = categoriesSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Charger les items
    const menuSnapshot = await getDocs(collection(db, "menuSemaine"));
    menuItems.value = menuSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    loading.value = false;
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    loading.value = false;
  }
};

const saveMenuConfig = async () => {
  try {
    const db = getDb();
    await setDoc(doc(db, "menuConfig", "display"), {
      useImageMode: useImageMode.value,
      imageUrl: imageUrl.value,
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la config:", error);
    alert("Erreur lors de la sauvegarde");
  }
};

const updateImageMode = () => {
  saveMenuConfig();
};

const openItemModal = (item = null) => {
  editingItem.value = item;
  showItemModal.value = true;
};

const closeItemModal = () => {
  showItemModal.value = false;
  editingItem.value = null;
};

const saveItem = async (itemData) => {
  try {
    const db = getDb();
    if (editingItem.value) {
      await updateDoc(doc(db, "menuSemaine", editingItem.value.id), {
        ...itemData,
        updatedAt: new Date(),
      });
    } else {
      await addDoc(collection(db, "menuSemaine"), {
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    closeItemModal();
    loadData();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    await alert("Erreur lors de la sauvegarde", { type: "danger" });
  }
};

const deleteItem = async (id) => {
  const result = await confirm("Êtes-vous sûr de vouloir supprimer ce plat ?", {
    type: "danger",
    title: "Supprimer un plat",
    confirmText: "Supprimer",
  });
  if (!result) return;

  try {
    const db = getDb();
    await deleteDoc(doc(db, "menuSemaine", id));
    loadData();
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    await alert("Erreur lors de la suppression", { type: "danger" });
  }
};

const openCategoryModal = (category = null) => {
  editingCategory.value = category;
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  editingCategory.value = null;
};

const saveCategory = async (categoryData) => {
  try {
    const db = getDb();
    if (editingCategory.value) {
      await updateDoc(
        doc(db, "menuCategories", editingCategory.value.id),
        categoryData
      );
    } else {
      await addDoc(collection(db, "menuCategories"), categoryData);
    }
    closeCategoryModal();
    loadData();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    await alert("Erreur lors de la sauvegarde", { type: "danger" });
  }
};

onMounted(() => {
  loadData();

  const db = getDb();
  onSnapshot(collection(db, "menuSemaine"), () => loadData());
  onSnapshot(collection(db, "menuCategories"), () => loadData());
});
</script>

<style scoped>
.menu-dashboard {
  padding: 1rem 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 1.5rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* Menu Overview Section */
.menu-overview-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.menu-header-block {
  margin-bottom: 1rem;
}

.menu-title-block {
  margin-bottom: 0.75rem;
}

.menu-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.menu-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.menu-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.kpi-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: transparent;
}

.kpi-red .kpi-value {
  color: #c41e3a;
  font-weight: 700;
  font-size: 1.125rem;
}

.kpi-green .kpi-value {
  color: #16a34a;
  font-weight: 700;
  font-size: 1.125rem;
}

.kpi-orange .kpi-value {
  color: #f59e0b;
  font-weight: 700;
  font-size: 1.125rem;
}

.kpi-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.kpi-value {
  font-size: 1.125rem;
  font-weight: 700;
}

.menu-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary-menu {
  background: #c41e3a;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}

.btn-primary-menu:hover {
  background: #a01a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(196, 30, 58, 0.3);
}

.btn-secondary-menu {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}

.btn-secondary-menu:hover {
  background: var(--bg-secondary);
  border-color: #3a3d45;
}

/* Menu Config Section */
.menu-config-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.config-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label-modern {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label-modern input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #3a3d45;
  border-radius: 4px;
  background: var(--bg-secondary);
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label-modern input[type="checkbox"]:checked + .checkbox-custom {
  background: #c41e3a;
  border-color: #c41e3a;
}

.checkbox-label-modern input[type="checkbox"]:checked + .checkbox-custom::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.checkbox-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.form-label-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-label-modern i {
  color: #c41e3a;
  font-size: 0.875rem;
}

.form-input-modern {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-input-modern:focus {
  outline: none;
  border-color: #c41e3a;
  background: var(--bg-secondary);
}

.form-input-modern::placeholder {
  color: #6b7280;
}

/* Main Content with Sidebar */
.menu-main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Filters Sidebar */
.filters-sidebar {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  height: fit-content;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.filters-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.filters-toggle {
  background: none;
  border: none;
  color: #c41e3a;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.search-wrapper {
  position: relative;
}

.search-wrapper i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: #c41e3a;
}

.filter-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.filter-select:focus {
  outline: none;
  border-color: #c41e3a;
}

.btn-reset-filters {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.btn-reset-filters:hover {
  background: var(--bg-secondary);
  border-color: #3a3d45;
}

/* Table Section */
.table-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.loading-container {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  color: #c41e3a;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
}

.table-wrapper {
  overflow-x: auto;
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.menu-table thead {
  background: var(--bg-secondary);
}

.menu-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  white-space: nowrap;
}

.menu-table th:first-child {
  padding-left: 1rem;
}

.menu-table th:last-child {
  text-align: center;
  padding-right: 1rem;
}

.menu-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
  vertical-align: middle;
  line-height: 1.5;
  box-sizing: border-box;
}

.menu-table td:first-child {
  padding-left: 1rem;
}

.menu-table td:last-child {
  text-align: center;
  padding-right: 1rem;
}

.menu-table tbody tr:hover {
  background: var(--bg-secondary);
}

.name-cell {
  white-space: nowrap;
}

.name-text {
  color: var(--text-primary);
  font-weight: 500;
}

.category-cell {
  white-space: nowrap;
}

.category-badge {
  display: inline-block;
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
}

.price-cell {
  white-space: nowrap;
  font-weight: 600;
  color: #16a34a;
}

.description-cell {
  max-width: 300px;
}

.description-text {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.description-empty {
  color: #6b7280;
  font-style: italic;
  font-size: 0.8125rem;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-icon {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  border-color: #c41e3a;
  color: #c41e3a;
}

.btn-icon-danger:hover {
  border-color: #dc2626;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 1200px) {
  .menu-main-content {
    grid-template-columns: 1fr;
  }

  .left-column {
    order: 2;
  }

  .table-section {
    order: 1;
  }
}
</style>
