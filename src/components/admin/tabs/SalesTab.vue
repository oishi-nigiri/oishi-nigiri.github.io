<template>
  <div class="sales-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Gestion des Ventes</h1>
    </div>

    <!-- Section Stats et Actions -->
    <div class="sales-overview-section">
      <div class="sales-header-block">
        <div class="sales-title-block">
          <h2 class="sales-title">Ventes</h2>
          <p class="sales-subtitle">{{ sales.length }} vente(s) enregistrée(s)</p>
          </div>
        <div class="sales-kpis">
          <div class="kpi-item kpi-red">
            <span class="kpi-label">TOTAL CA</span>
            <span class="kpi-value">{{ totalSales.toFixed(0) }} €</span>
            </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">COMMISSIONS</span>
            <span class="kpi-value">{{ totalCommissions.toFixed(0) }} €</span>
          </div>
          <div class="kpi-item kpi-green">
            <span class="kpi-label">BÉNÉFICES</span>
            <span class="kpi-value">{{ totalBenefits.toFixed(0) }} €</span>
        </div>
          <div class="kpi-item kpi-orange">
            <span class="kpi-label">PRIMES</span>
            <span class="kpi-value">{{ totalBonuses.toFixed(0) }} €</span>
        </div>
        </div>
      </div>

      <div class="sales-actions">
        <button @click="openSaleModal()" class="btn-primary-sales">
            <i class="fas fa-plus"></i>
            <span>Nouvelle Vente</span>
          </button>
        <button
          v-if="hasPermission('bonuses')"
          @click="openBonusModal()"
          class="btn-secondary-sales"
        >
          <i class="fas fa-gift"></i>
          <span>Prime</span>
          </button>
          <button
            v-if="hasPermission('resetSales')"
            @click="resetSales"
          class="btn-secondary-sales"
          >
            <i class="fas fa-redo"></i>
            <span>Réinitialiser</span>
          </button>
          <button
            v-if="hasPermission('resetSales') && lastHistoryId"
            @click="restoreSales"
            class="btn-restore-sales"
          >
            <i class="fas fa-undo"></i>
            <span>Restaurer</span>
          </button>
        </div>
      </div>

    <!-- Main Content with Sidebar -->
    <div class="sales-main-content">
      <!-- Left Column: Filters + Employee Summary -->
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
              <label class="filter-label">Employé</label>
          <select v-model="employeeFilter" class="filter-select">
            <option value="">Tous les employés</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Type</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="typeFilter.sales"
                    class="checkbox-input"
                  />
                  <span>Ventes</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="typeFilter.bonuses"
                    class="checkbox-input"
                  />
                  <span>Primes</span>
                </label>
        </div>
      </div>

            <div class="filter-group">
              <label class="filter-label">Tri par</label>
              <select v-model="sortBy" class="filter-select">
                <option value="date-desc">Date (récent)</option>
                <option value="date-asc">Date (ancien)</option>
                <option value="amount-desc">Montant (décroissant)</option>
                <option value="amount-asc">Montant (croissant)</option>
                <option value="employee-asc">Employé (A-Z)</option>
              </select>
            </div>

            <button @click="resetFilters" class="btn-reset-filters">
              <i class="fas fa-times"></i>
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        <!-- Employee Summary Card -->
        <div class="employee-summary-card">
          <h3 class="employee-summary-title">Par Employé</h3>
          <div v-if="loading" class="employee-summary-loading">
            Chargement...
          </div>
          <div v-else-if="employeeSales.length === 0" class="employee-summary-empty">
            Aucun employé avec des ventes
          </div>
          <div v-else class="employee-summary-list">
            <div
              v-for="empSale in employeeSales"
              :key="empSale.employeeId"
              class="employee-summary-item"
            >
              <div class="employee-summary-header">
                <span class="employee-summary-name">{{ empSale.employeeName }}</span>
              </div>
              <div class="employee-summary-stats">
                <div class="employee-stat-item">
                  <span class="employee-stat-label">Ventes</span>
                  <span class="employee-stat-value">{{ empSale.salesCount }}</span>
                </div>
                <div class="employee-stat-item">
                  <span class="employee-stat-label">CA</span>
                  <span class="employee-stat-value employee-stat-red">{{ empSale.totalAmount.toFixed(0) }} €</span>
                </div>
                <div class="employee-stat-item">
                  <span class="employee-stat-label">Commission</span>
                  <span class="employee-stat-value employee-stat-green">{{ empSale.totalCommission.toFixed(0) }} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>

      <div v-else-if="filteredSales.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>
          {{ sales.length === 0 ? "Aucune vente enregistrée" : "Aucun résultat" }}
        </h3>
        <p>
          {{
            sales.length === 0
              ? "Commencez par ajouter votre première vente"
              : "Aucune vente ne correspond à vos critères"
          }}
        </p>
        <button
          v-if="sales.length === 0"
          @click="openSaleModal()"
          class="btn-primary-sales"
        >
          <i class="fas fa-plus"></i>
          <span>Ajouter une Vente</span>
        </button>
      </div>

      <div v-else class="table-wrapper">
        <table class="sales-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>EMPLOYÉ</th>
              <th>TYPE</th>
              <th>MONTANT</th>
              <th>COMMISSION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredSales" :key="item.id">
              <td class="date-cell">
                <span class="date-main">{{ formatDateShort(item.date) }}</span>
                <span class="date-time">{{ formatTime(item.date) }}</span>
              </td>
              <td class="employee-cell">
                <i class="fas fa-user"></i>
                <span>{{ getEmployeeName(item.employeeId) }}</span>
              </td>
              <td class="type-cell">
                <span v-if="item.itemType === 'sale'" class="type-badge type-sale">
                  <i class="fas fa-shopping-cart"></i>
                  Vente
                </span>
                <span v-else class="type-badge type-bonus">
                  <i class="fas fa-gift"></i>
                  Prime
                </span>
              </td>
              <td class="amount-cell">{{ parseFloat(item.amount || 0).toFixed(0) }} €</td>
              <td class="commission-cell">
                {{ item.itemType === 'sale' ? getSaleCommission(item).toFixed(0) : 0 }} €
              </td>
              <td class="actions-cell">
                <button
                  v-if="item.itemType === 'sale' && canEditSale(item)"
                  @click="openSaleModal(item)"
                  class="btn-icon"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  v-if="item.itemType === 'bonus' && hasPermission('bonuses')"
                  @click="openBonusModal(item)"
                  class="btn-icon"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  v-if="item.itemType === 'sale' && canDeleteSale(item)"
                  @click="deleteSale(item.id)"
                  class="btn-icon btn-icon-danger"
                  title="Supprimer"
                >
                  <i class="fas fa-trash"></i>
                </button>
                <button
                  v-if="item.itemType === 'bonus' && hasPermission('bonuses')"
                  @click="deleteBonus(item.id)"
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
    <SaleModal
      v-if="showSaleModal"
      :sale="editingSale"
      :employees="employees"
      @close="closeSaleModal"
      @save="handleSaleSave"
    />
    <BonusModal
      v-if="showBonusModal"
      :bonus="editingBonus"
      :employees="employees"
      @close="closeBonusModal"
      @save="handleBonusSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useFirestore } from "../../../composables/useFirestore";
import { useAuth } from "../../../composables/useAuth";
import { useConfirm } from "../../../composables/useConfirm";
import SaleModal from "../modals/SaleModal.vue";
import BonusModal from "../modals/BonusModal.vue";
import { collection, onSnapshot } from "firebase/firestore";
import { getDb } from "../../../composables/useFirebase";

const {
  getAll,
  create,
  update,
  remove,
  formatDate,
  getAllEmployees,
  getAllRanks,
  toTimestamp,
  serverTimestamp,
} = useFirestore();

const { hasPermission: checkPermission, user } = useAuth();
const { confirm, alert } = useConfirm();

const sales = ref([]);
const bonuses = ref([]);
const employees = ref([]);
const ranks = ref([]);
const loading = ref(true);
const showSaleModal = ref(false);
const showBonusModal = ref(false);
const editingSale = ref(null);
const editingBonus = ref(null);

// Filters
const searchQuery = ref("");
const employeeFilter = ref("");
const typeFilter = ref({ sales: true, bonuses: true });
const sortBy = ref("date-desc");
const filtersExpanded = ref(true);

// Restore functionality - persisted in localStorage to survive page navigation
const lastHistoryId = ref(localStorage.getItem('lastHistoryId') || null);

const hasPermission = (perm) => {
  const isSuperAdmin = localStorage.getItem("isSuperAdmin") === "true";
  if (isSuperAdmin) return true;
  try {
    const perms = JSON.parse(localStorage.getItem("adminPermissions") || "{}");
    return perms[perm] === true;
  } catch {
    return false;
  }
};

const totalSales = computed(() => {
  return sales.value.reduce(
    (sum, sale) => sum + parseFloat(sale.amount || 0),
    0
  );
});

const totalCommissions = computed(() => {
  let total = 0;
  sales.value.forEach((sale) => {
    const commission = getSaleCommission(sale);
    total += commission;
  });
  return total;
});

const totalBonuses = computed(() => {
  return bonuses.value.reduce(
    (sum, bonus) => sum + parseFloat(bonus.amount || 0),
    0
  );
});

const totalBenefits = computed(() => {
  const benefits = totalSales.value - totalCommissions.value - totalBonuses.value;
  return Math.max(0, benefits);
});

const employeeSales = computed(() => {
  const empSalesMap = {};

  employees.value.forEach((emp) => {
    const empSales = sales.value.filter((s) => s.employeeId === emp.id);
    const rank = ranks.value.find((r) => r.id === emp.rankId);

    let totalAmount = 0;
    let totalCommission = 0;

    empSales.forEach((sale) => {
      totalAmount += parseFloat(sale.amount || 0);
      if (rank) {
        totalCommission +=
          (parseFloat(sale.amount || 0) * parseFloat(rank.percentage || 0)) /
          100;
      }
    });

    if (empSales.length > 0) {
      empSalesMap[emp.id] = {
        employeeId: emp.id,
        employeeName: emp.name,
        salesCount: empSales.length,
        totalAmount,
        totalCommission,
      };
    }
  });

  return Object.values(empSalesMap).sort((a, b) => b.totalAmount - a.totalAmount);
});

const filteredSales = computed(() => {
  let combined = [
    ...sales.value.map(s => ({ ...s, itemType: 'sale' })),
    ...bonuses.value.map(b => ({ ...b, itemType: 'bonus' }))
  ];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    combined = combined.filter(
      (item) =>
        getEmployeeName(item.employeeId).toLowerCase().includes(query) ||
        (item.amount || 0).toString().includes(query) ||
        (item.description || item.reason || '').toLowerCase().includes(query)
    );
  }

  // Employee filter
  if (employeeFilter.value) {
    combined = combined.filter(
      (item) => item.employeeId === employeeFilter.value
    );
  }

  // Type filter
  combined = combined.filter(item => {
    if (item.itemType === 'sale' && !typeFilter.value.sales) return false;
    if (item.itemType === 'bonus' && !typeFilter.value.bonuses) return false;
    return true;
  });

  // Sort
  combined.sort((a, b) => {
    switch (sortBy.value) {
      case "date-desc":
        return new Date(b.date?.toDate ? b.date.toDate() : b.date) - new Date(a.date?.toDate ? a.date.toDate() : a.date);
      case "date-asc":
        return new Date(a.date?.toDate ? a.date.toDate() : a.date) - new Date(b.date?.toDate ? b.date.toDate() : b.date);
      case "amount-desc":
        return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
      case "amount-asc":
        return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
      case "employee-asc":
        return getEmployeeName(a.employeeId).localeCompare(
          getEmployeeName(b.employeeId)
        );
      default:
        return new Date(b.date?.toDate ? b.date.toDate() : b.date) - new Date(a.date?.toDate ? a.date.toDate() : a.date);
    }
  });

  return combined;
});

const getEmployeeName = (employeeId) => {
  const emp = employees.value.find((e) => e.id === employeeId);
  return emp ? emp.name : "Employé supprimé";
};

const getSaleCommission = (sale) => {
  const emp = employees.value.find((e) => e.id === sale.employeeId);
  if (!emp) return 0;
  const rank = ranks.value.find((r) => r.id === emp.rankId);
  if (!rank) return 0;
  return (parseFloat(sale.amount || 0) * parseFloat(rank.percentage || 0)) / 100;
};

const formatDateShort = (date) => {
  if (!date) return "-";
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(d);
};

const formatTime = (date) => {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const resetFilters = () => {
  searchQuery.value = "";
  employeeFilter.value = "";
  typeFilter.value = { sales: true, bonuses: true };
  sortBy.value = "date-desc";
};

const canEditSale = (sale) => {
  return hasPermission("sales");
};

const canDeleteSale = (sale) => {
  return hasPermission("sales");
};

const openSaleModal = (sale = null) => {
  editingSale.value = sale;
  showSaleModal.value = true;
};

const closeSaleModal = () => {
  showSaleModal.value = false;
  editingSale.value = null;
};

const openBonusModal = (bonus = null) => {
  editingBonus.value = bonus;
  showBonusModal.value = true;
};

const closeBonusModal = () => {
  showBonusModal.value = false;
  editingBonus.value = null;
};

const handleSaleSave = async (saleData) => {
  try {
    const dataToSave = {
      ...saleData,
      date: toTimestamp(saleData.date),
      amount: parseFloat(saleData.amount || 0)
    };
    
    if (editingSale.value) {
      await update('sales', editingSale.value.id, dataToSave);
    } else {
      await create('sales', dataToSave);
    }
    closeSaleModal();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    await alert('Erreur lors de la sauvegarde', { type: 'danger' });
  }
};

const handleBonusSave = async (bonusData) => {
  try {
    const dataToSave = {
      ...bonusData,
      date: toTimestamp(bonusData.date),
      amount: parseFloat(bonusData.amount || 0)
    };
    
    if (editingBonus.value) {
      await update('bonuses', editingBonus.value.id, dataToSave);
    } else {
      await create('bonuses', dataToSave);
    }
    closeBonusModal();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    await alert('Erreur lors de la sauvegarde', { type: 'danger' });
  }
};

const deleteSale = async (saleId) => {
  const result = await confirm(
    "Êtes-vous sûr de vouloir supprimer cette vente ?",
    {
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger",
    }
  );

  if (result) {
    try {
      await remove("sales", saleId);
      await alert("Vente supprimée avec succès", { type: "success" });
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      await alert("Erreur lors de la suppression de la vente", {
        type: "danger",
      });
    }
  }
};

const deleteBonus = async (bonusId) => {
  const result = await confirm(
    "Êtes-vous sûr de vouloir supprimer cette prime ?",
    {
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger",
    }
  );

  if (result) {
    try {
      await remove("bonuses", bonusId);
      await alert("Prime supprimée avec succès", { type: "success" });
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      await alert("Erreur lors de la suppression de la prime", {
        type: "danger",
      });
    }
  }
};

const resetSales = async () => {
  const result = await confirm(
    "Êtes-vous sûr de vouloir réinitialiser toutes les ventes et primes ? Elles seront archivées dans l'historique avant d'être supprimées. Cette action est irréversible.",
    {
      confirmText: "Réinitialiser",
      cancelText: "Annuler",
      type: "danger",
    }
  );

  if (result) {
    try {
      const allSales = await getAll("sales");
      const allBonuses = await getAll("bonuses");
      
      if (allSales.length > 0 || allBonuses.length > 0) {
        // S'assurer que les employés et grades sont chargés
        if (employees.value.length === 0) {
          employees.value = await getAllEmployees();
        }
        if (ranks.value.length === 0) {
          ranks.value = await getAllRanks();
        }

        // Calculer les totaux pour l'historique
        let totalAmount = 0;
        let totalCommissions = 0;
        let totalBonusesAmount = 0;
        const salesData = [];
        const bonusesData = [];

        for (const sale of allSales) {
          const saleDate = sale.date?.toDate ? sale.date.toDate() : new Date(sale.date);
          totalAmount += parseFloat(sale.amount || 0);
          
          // Calculer la commission en utilisant les arrays déjà chargés
          const employee = employees.value.find(e => e.id === sale.employeeId);
          if (employee) {
            const rank = ranks.value.find(r => r.id === employee.rankId);
            if (rank) {
              totalCommissions += (parseFloat(sale.amount || 0) * parseFloat(rank.percentage || 0)) / 100;
            }
          }

          salesData.push({
            date: toTimestamp(saleDate),
            employeeId: sale.employeeId,
            amount: parseFloat(sale.amount || 0),
            description: sale.description || ''
          });
        }

        // Archiver les primes
        for (const bonus of allBonuses) {
          const bonusDate = bonus.date?.toDate ? bonus.date.toDate() : new Date(bonus.date);
          totalBonusesAmount += parseFloat(bonus.amount || 0);

          bonusesData.push({
            date: toTimestamp(bonusDate),
            employeeId: bonus.employeeId,
            amount: parseFloat(bonus.amount || 0),
            reason: bonus.reason || ''
          });
        }

        // Trouver les dates min et max (ventes + primes)
        const allDates = [
          ...allSales.map(s => s.date?.toDate ? s.date.toDate() : new Date(s.date)),
          ...allBonuses.map(b => b.date?.toDate ? b.date.toDate() : new Date(b.date))
        ];
        const periodStart = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
        const periodEnd = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();

        // Récupérer l'utilisateur actuel
        const currentUser = user.value;
        const archivedBy = currentUser?.uid || currentUser?.email || 'unknown';

        // Créer l'historique AVANT de supprimer les ventes et primes
        const historyData = {
          periodStart: toTimestamp(periodStart),
          periodEnd: toTimestamp(periodEnd),
          salesCount: allSales.length,
          bonusesCount: allBonuses.length,
          totalAmount,
          totalCommissions,
          totalBonuses: totalBonusesAmount,
          sales: salesData,
          bonuses: bonusesData,
          archivedAt: serverTimestamp(),
          archivedBy: archivedBy
        };

        const historyId = await create('salesHistory', historyData);
        lastHistoryId.value = historyId;
        localStorage.setItem('lastHistoryId', historyId);
      }

      // Maintenant supprimer toutes les ventes
      for (const sale of allSales) {
        await remove("sales", sale.id);
      }

      // Supprimer toutes les primes
      for (const bonus of allBonuses) {
        await remove("bonuses", bonus.id);
      }
      
      await alert("Ventes et primes réinitialisées avec succès. L'historique a été créé.", { type: "success" });
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      await alert("Erreur lors de la réinitialisation", { type: "danger" });
    }
  }
};

const restoreSales = async () => {
  if (!lastHistoryId.value) {
    await alert("Aucune sauvegarde disponible à restaurer.", { type: "warning" });
    return;
  }

  const result = await confirm(
    "Êtes-vous sûr de vouloir restaurer les ventes et primes depuis la dernière sauvegarde ?",
    {
      confirmText: "Restaurer",
      cancelText: "Annuler",
      type: "warning",
    }
  );

  if (result) {
    try {
      // Récupérer l'historique
      const allHistory = await getAll("salesHistory");
      const historyEntry = allHistory.find(h => h.id === lastHistoryId.value);
      
      if (!historyEntry) {
        await alert("Historique introuvable.", { type: "danger" });
        lastHistoryId.value = null;
        localStorage.removeItem('lastHistoryId');
        return;
      }

      // Restaurer les ventes
      if (historyEntry.sales && historyEntry.sales.length > 0) {
        for (const sale of historyEntry.sales) {
          await create("sales", {
            date: sale.date,
            employeeId: sale.employeeId,
            amount: parseFloat(sale.amount || 0),
            description: sale.description || ''
          });
        }
      }

      // Restaurer les primes
      if (historyEntry.bonuses && historyEntry.bonuses.length > 0) {
        for (const bonus of historyEntry.bonuses) {
          await create("bonuses", {
            date: bonus.date,
            employeeId: bonus.employeeId,
            amount: parseFloat(bonus.amount || 0),
            reason: bonus.reason || ''
          });
        }
      }

      // Supprimer l'historique utilisé pour la restauration
      await remove("salesHistory", lastHistoryId.value);
      lastHistoryId.value = null;
      localStorage.removeItem('lastHistoryId');

      await alert("Ventes et primes restaurées avec succès !", { type: "success" });
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      await alert("Erreur lors de la restauration", { type: "danger" });
    }
  }
};

const loadData = async () => {
  try {
    loading.value = true;
    const [salesData, bonusesData, employeesData, ranksData] = await Promise.all([
      getAll("sales"),
      getAll("bonuses"),
      getAllEmployees(),
      getAllRanks(),
    ]);

    sales.value = salesData.map((sale) => ({
      ...sale,
      date: sale.date?.toDate ? sale.date : new Date(sale.date),
    }));

    bonuses.value = bonusesData;
    employees.value = employeesData;
    ranks.value = ranksData;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    await alert("Erreur lors du chargement des données", { type: "danger" });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadData();

  // Real-time updates
  const db = getDb();
  onSnapshot(collection(db, "sales"), () => {
    loadData();
  });
  onSnapshot(collection(db, "bonuses"), () => {
    loadData();
  });
});
</script>

<style scoped>
.sales-dashboard {
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

/* Sales Overview Section */
.sales-overview-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.sales-header-block {
  margin-bottom: 1rem;
}

.sales-title-block {
  margin-bottom: 0.75rem;
}

.sales-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.sales-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.sales-kpis {
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

.sales-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary-sales {
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

.btn-primary-sales:hover {
  background: #a01a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(196, 30, 58, 0.3);
}

.btn-secondary-sales {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary-sales:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.btn-restore-sales {
  background: #3b82f6;
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

.btn-restore-sales:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

/* Main Content with Sidebar */
.sales-main-content {
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

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.btn-reset-filters {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
}

.btn-reset-filters:hover {
  background: #2a2d35;
  border-color: #3a3d45;
}

/* Employee Summary Card */
.employee-summary-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.employee-summary-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.employee-summary-loading,
.employee-summary-empty {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem 0;
}

.employee-summary-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.employee-summary-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.employee-summary-header {
  margin-bottom: 0.75rem;
}

.employee-summary-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.employee-summary-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.employee-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.employee-stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.employee-stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.employee-stat-red {
  color: #c41e3a;
}

.employee-stat-green {
  color: #16a34a;
}

/* Table Section */
.table-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  min-height: 400px;
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #3a3d45;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #4a4d55;
}

.sales-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
}

.sales-table thead {
  background: var(--bg-secondary);
}

.sales-table th {
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
  box-sizing: border-box;
}

.sales-table th:first-child {
  padding-left: 1rem;
}

.sales-table th:last-child {
  text-align: center;
  padding-right: 1rem;
}

.sales-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
  vertical-align: middle;
  line-height: 1.5;
  box-sizing: border-box;
}

.sales-table td:first-child {
  padding-left: 1rem;
}

.sales-table td:last-child {
  text-align: center;
  padding-right: 1rem;
}

.sales-table tbody tr:hover {
  background: var(--bg-secondary);
}

.date-cell {
  padding: 0.875rem 1rem;
}

.date-main {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.date-time {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

.employee-cell {
  padding: 0.875rem 1rem;
}

.employee-cell i {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-right: 0.5rem;
  display: inline-block;
  vertical-align: middle;
}

.type-cell {
  padding: 0.875rem 1rem;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.type-sale {
  background: rgba(196, 30, 58, 0.2);
  color: #ff6b7a;
}

.type-bonus {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.amount-cell {
  padding: 0.875rem 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.commission-cell {
  padding: 0.875rem 1rem;
  color: #16a34a;
  font-weight: 600;
  white-space: nowrap;
}

.actions-cell {
  padding: 0.875rem 1rem;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-icon-danger {
  color: #ff6b7a;
}

.btn-icon-danger:hover {
  background: rgba(196, 30, 58, 0.2);
  color: #ff8a95;
}

/* Loading and Empty States */
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #4a4d55;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #252831;
  border-top-color: #c41e3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .sales-main-content {
    grid-template-columns: 1fr;
  }

  .left-column {
    order: 2;
  }

  .table-section {
    order: 1;
  }
}

@media (max-width: 768px) {
  .sales-kpis {
    grid-template-columns: repeat(2, 1fr);
  }

  .sales-actions {
    flex-wrap: wrap;
  }
}
</style>