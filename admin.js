const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const discordLoginBtn = document.getElementById('discord-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const menuItemsContainer = document.getElementById('menu-items-container');
const addItemBtn = document.getElementById('add-item-btn');
const itemModal = document.getElementById('item-modal');
const itemForm = document.getElementById('item-form');
const modalClose = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const modalTitle = document.getElementById('modal-title');
const loadingOverlay = document.getElementById('loading-overlay');
const usernameSpan = document.getElementById('username');
const userAvatarImg = document.getElementById('user-avatar');

const teamMembersContainer = document.getElementById('team-members-container');
const addMemberBtn = document.getElementById('add-member-btn');
const memberModal = document.getElementById('member-modal');
const memberForm = document.getElementById('member-form');
const memberModalClose = document.getElementById('member-modal-close');
const cancelMemberBtn = document.getElementById('cancel-member-btn');
const memberModalTitle = document.getElementById('member-modal-title');

const addBonusBtn = document.getElementById('add-bonus-btn');
const bonusModal = document.getElementById('bonus-modal');
const bonusForm = document.getElementById('bonus-form');
const bonusModalClose = document.getElementById('bonus-modal-close');
const cancelBonusBtn = document.getElementById('cancel-bonus-btn');

const categoriesContainer = document.getElementById('categories-container');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryModal = document.getElementById('category-modal');
const categoryForm = document.getElementById('category-form');
const categoryModalClose = document.getElementById('category-modal-close');
const cancelCategoryBtn = document.getElementById('cancel-category-btn');
const categoryModalTitle = document.getElementById('category-modal-title');
const addCategoryFromFormBtn = document.getElementById('add-category-from-form-btn');
const itemCategorySelect = document.getElementById('item-category');

let currentEditingId = null;
let currentEditingMemberId = null;
let currentEditingCategoryId = null;


document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

async function checkAuth() {
    const discordUser = localStorage.getItem('discord_user');
    const discordToken = localStorage.getItem('discord_token');
    
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            const userInfo = await getDiscordUserInfo(accessToken);
            if (userInfo) {
                localStorage.setItem('discord_user', JSON.stringify(userInfo));
                localStorage.setItem('discord_token', accessToken);
                const adminStatus = await checkAdminStatus(userInfo.id);
                
                if (adminStatus) {
                    localStorage.setItem('discordUser', JSON.stringify(userInfo));
                    localStorage.setItem('discordToken', accessToken);
                    localStorage.setItem('isAdmin', 'true');
                    showAdminPanel(userInfo);
                    loadMenuConfig();
                    loadCategories();
                    loadMenuItems();
                    loadTeamMembers();
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                } else {
                    showError('Vous n\'êtes pas autorisé à accéder au panel admin.');
                    showLoginScreen();
                    return;
                }
            }
        }
    }
    
    if (discordUser && discordToken) {
        const user = JSON.parse(discordUser);
        
        const adminStatus = await checkAdminStatus(user.id);
        
        if (adminStatus) {
            localStorage.setItem('discordUser', JSON.stringify(user));
            localStorage.setItem('discordToken', discordToken);
            localStorage.setItem('isAdmin', 'true');
            showAdminPanel(user);
            loadMenuConfig();
            loadCategories();
            loadMenuItems();
            loadTeamMembers();
        } else {
            showError('Vous n\'êtes pas autorisé à accéder au panel admin.');
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminPanel.style.display = 'none';
}

function showAdminPanel(user) {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'flex';
    
    if (user) {
        usernameSpan.textContent = user.username || 'Admin';
        if (user.avatar) {
            const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            userAvatarImg.src = avatarUrl;
        }
    }
    
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    const canManageAdmins = isSuperAdmin || hasPermission('admins');
    
    const adminTabBtn = document.querySelector('[data-tab="admins"]');
    const addAdminBtn = document.getElementById('add-admin-btn');
    if (adminTabBtn) {
        adminTabBtn.style.display = canManageAdmins ? '' : 'none';
    }
    if (addAdminBtn) {
        addAdminBtn.style.display = canManageAdmins ? '' : 'none';
    }
    
    const menuTabBtn = document.querySelector('[data-tab="menu"]');
    const addItemBtn = document.getElementById('add-item-btn');
    if (menuTabBtn) {
        menuTabBtn.style.display = hasPermission('menu') ? '' : 'none';
    }
    if (addItemBtn) {
        addItemBtn.style.display = hasPermission('menu') ? '' : 'none';
    }
    
    const teamTabBtn = document.querySelector('[data-tab="team"]');
    const addMemberBtn = document.getElementById('add-member-btn');
    if (teamTabBtn) {
        teamTabBtn.style.display = hasPermission('team') ? '' : 'none';
    }
    if (addMemberBtn) {
        addMemberBtn.style.display = hasPermission('team') ? '' : 'none';
    }
    
    const salesTabBtn = document.querySelector('[data-tab="sales"]');
    const addSaleBtn = document.getElementById('add-sale-btn');
    const resetSalesBtn = document.getElementById('reset-sales-btn');
    if (salesTabBtn) {
        salesTabBtn.style.display = hasPermission('sales') ? '' : 'none';
    }
    if (addSaleBtn) {
        addSaleBtn.style.display = hasPermission('sales') ? '' : 'none';
    }
    if (resetSalesBtn) {
        resetSalesBtn.style.display = hasPermission('resetSales') ? '' : 'none';
    }
    if (addBonusBtn) {
        addBonusBtn.style.display = hasPermission('bonuses') ? '' : 'none';
    }
    
    const bonusesSection = document.getElementById('bonuses-section');
    if (bonusesSection) {
        bonusesSection.style.display = (hasPermission('bonuses') || hasPermission('sales')) ? '' : 'none';
    }
    
    const historyTabBtn = document.querySelector('[data-tab="history"]');
    if (historyTabBtn) {
        historyTabBtn.style.display = hasPermission('sales') ? '' : 'none';
    }
    
    const employeesTabBtn = document.querySelector('[data-tab="employees"]');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    if (employeesTabBtn) {
        employeesTabBtn.style.display = hasPermission('employees') ? '' : 'none';
    }
    if (addEmployeeBtn) {
        addEmployeeBtn.style.display = hasPermission('employees') ? '' : 'none';
    }
    
    const ranksTabBtn = document.querySelector('[data-tab="ranks"]');
    const addRankBtn = document.getElementById('add-rank-btn');
    if (ranksTabBtn) {
        ranksTabBtn.style.display = hasPermission('ranks') ? '' : 'none';
    }
    if (addRankBtn) {
        addRankBtn.style.display = hasPermission('ranks') ? '' : 'none';
    }
    
    if (window.location.search || window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}


async function getDiscordUserInfo(accessToken) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des infos Discord:', error);
    }
    return null;
}

function isSuperAdmin(userId) {
    if (typeof DISCORD_CONFIG !== 'undefined' && DISCORD_CONFIG.adminManagerIds) {
        if (DISCORD_CONFIG.adminManagerIds.includes(userId)) {
            return true;
        }
    }
    
    if (typeof ADMIN_IDS !== 'undefined' && ADMIN_IDS.includes(userId)) {
        return true;
    }
    
    return false;
}

async function checkAdminStatus(userId) {
    if (!userId) return false;
    
    try {
        if (isSuperAdmin(userId)) {
            localStorage.setItem('adminPermissions', JSON.stringify({
                menu: true,
                team: true,
                sales: true,
                employees: true,
                ranks: true,
                admins: true
            }));
            localStorage.setItem('isSuperAdmin', 'true');
            return true;
        }
        
        const adminDoc = await db.collection('admins').doc(userId).get();
        if (adminDoc.exists && adminDoc.data().isAdmin === true) {
            const adminData = adminDoc.data();
            localStorage.setItem('adminPermissions', JSON.stringify(adminData.permissions || {}));
            localStorage.setItem('isSuperAdmin', 'false');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
        return false;
    }
}

function hasPermission(section) {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    if (isSuperAdmin) return true;
    
    const permissionsStr = localStorage.getItem('adminPermissions');
    if (!permissionsStr) return false;
    
    try {
        const permissions = JSON.parse(permissionsStr);
        return permissions[section] === true;
    } catch (error) {
        return false;
    }
}

function loginWithDiscord() {
    if (typeof DISCORD_CONFIG === 'undefined') {
        console.error('DISCORD_CONFIG n\'est pas défini. Vérifiez que config.js est chargé.');
        return;
    }
    const params = new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        redirect_uri: DISCORD_CONFIG.redirectUri,
        response_type: 'token',
        scope: DISCORD_CONFIG.scope
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

function logout() {
    localStorage.removeItem('discordUser');
    localStorage.removeItem('discordToken');
    localStorage.removeItem('discord_user');
    localStorage.removeItem('discord_token');
    localStorage.removeItem('isAdmin');
    showLoginScreen();
}

function setupEventListeners() {
    discordLoginBtn?.addEventListener('click', loginWithDiscord);
    logoutBtn?.addEventListener('click', logout);
    addItemBtn?.addEventListener('click', () => openItemModal());
    modalClose?.addEventListener('click', closeItemModal);
    cancelBtn?.addEventListener('click', closeItemModal);
    
    itemForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveMenuItem();
    });
    
    itemModal?.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            closeItemModal();
        }
    });

    addMemberBtn?.addEventListener('click', () => openMemberModal());
    memberModalClose?.addEventListener('click', closeMemberModal);
    cancelMemberBtn?.addEventListener('click', closeMemberModal);
    
    memberForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTeamMember();
    });

    memberModal?.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            closeMemberModal();
        }
    });


    const useImageModeCheckbox = document.getElementById('use-image-mode');
    const imageUrlGroup = document.getElementById('image-url-group');
    const saveMenuConfigBtn = document.getElementById('save-menu-config-btn');
    
    useImageModeCheckbox?.addEventListener('change', (e) => {
        if (imageUrlGroup) {
            imageUrlGroup.style.display = e.target.checked ? 'block' : 'none';
        }
    });
    
    saveMenuConfigBtn?.addEventListener('click', async () => {
        await saveMenuConfig();
    });
    

    loadMenuConfig();

}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 5000);
}

function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
}

async function loadMenuItems() {
    showLoading(true);
    try {
        const menuSnapshot = await db.collection('menuSemaine').get();
        const categoriesSnapshot = await db.collection('menuCategories').orderBy('order', 'asc').get();
        
        menuItemsContainer.innerHTML = '';
        
        if (menuSnapshot.empty) {
            menuItemsContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-light); grid-column: 1 / -1;">Aucun plat dans la carte de la semaine. Ajoutez-en un pour commencer !</p>';
        } else {
            const itemsByCategory = {};
            const categoriesMap = {};
            
            categoriesSnapshot.forEach(doc => {
                const cat = doc.data();
                categoriesMap[cat.name] = cat.order || 999;
            });
            
            menuSnapshot.forEach(doc => {
                const item = { id: doc.id, ...doc.data() };
                const category = item.category || 'Sans catégorie';
                if (!itemsByCategory[category]) {
                    itemsByCategory[category] = [];
                }
                itemsByCategory[category].push(item);
            });
            
            const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
                const orderA = categoriesMap[a] !== undefined ? categoriesMap[a] : 999;
                const orderB = categoriesMap[b] !== undefined ? categoriesMap[b] : 999;
                if (orderA !== orderB) return orderA - orderB;
                return a.localeCompare(b);
            });
            
            sortedCategories.forEach(category => {
                const categorySection = document.createElement('div');
                categorySection.style.gridColumn = '1 / -1';
                categorySection.style.marginBottom = '2rem';
                categorySection.innerHTML = `
                    <h3 style="color: var(--color-secondary); font-size: 1.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-primary);">${category}</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                `;
                
                const itemsContainer = categorySection.querySelector('div');
                
                itemsByCategory[category].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                
                itemsByCategory[category].forEach(item => {
                    const itemCard = document.createElement('div');
                    itemCard.className = 'menu-item-card';
                    itemCard.innerHTML = `
                        <div class="item-card-header">
                            <div class="item-card-title">${item.name}</div>
                            <div class="item-card-price">${item.price}€</div>
                        </div>
                        <div class="item-card-description">${item.description}</div>
                        <div class="item-card-actions">
                            <button class="btn btn-secondary btn-sm edit-item-btn" data-id="${item.id}">Modifier</button>
                            <button class="btn btn-danger btn-sm delete-item-btn" data-id="${item.id}">Supprimer</button>
                        </div>
                    `;
                    itemsContainer.appendChild(itemCard);
                    
                    itemCard.querySelector('.edit-item-btn').addEventListener('click', () => editMenuItem(item));
                    itemCard.querySelector('.delete-item-btn').addEventListener('click', () => deleteMenuItem(item.id));
                });
                
                categorySection.appendChild(itemsContainer);
                menuItemsContainer.appendChild(categorySection);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
        
        if (error.code === 'failed-precondition' && error.message?.includes('index')) {
            const indexUrl = error.message.match(/https:\/\/[^\s]+/)?.[0];
            if (indexUrl) {
                alert(`Un index Firestore est requis. Cliquez sur OK pour ouvrir le lien de création d'index.\n\nOu consultez CREATION_INDEX_FIRESTORE.md pour plus d'informations.`);
                window.open(indexUrl, '_blank');
            } else {
                alert('Un index Firestore est requis pour cette requête. Consultez CREATION_INDEX_FIRESTORE.md pour créer l\'index.');
            }
        } else {
            alert('Erreur lors du chargement du menu. Vérifiez votre connexion Firebase.');
        }
    } finally {
        showLoading(false);
    }
}

function renderMenuItem(item) {
    const itemCard = document.createElement('div');
    itemCard.className = 'menu-item-card';
    itemCard.innerHTML = `
        <div class="item-card-header">
            <div class="item-card-title">
                ${item.emoji || '🍽️'} ${item.name}
            </div>
            <div class="item-card-price">${item.price}€</div>
        </div>
        <div class="item-card-category">${item.category}</div>
        <div class="item-card-description">${item.description}</div>
        <div class="item-card-actions">
            <button class="btn btn-secondary btn-sm edit-item-btn" data-id="${item.id}">Modifier</button>
            <button class="btn btn-danger btn-sm delete-item-btn" data-id="${item.id}">Supprimer</button>
        </div>
    `;
    
    menuItemsContainer.appendChild(itemCard);
    
    itemCard.querySelector('.edit-item-btn').addEventListener('click', () => editMenuItem(item));
    itemCard.querySelector('.delete-item-btn').addEventListener('click', () => deleteMenuItem(item.id));
}

async function openItemModal(item = null) {
    if (!hasPermission('menu')) {
        alert('Vous n\'avez pas la permission de modifier la carte.');
        return;
    }
    
    currentEditingId = item ? item.id : null;
    
    if (item) {
        modalTitle.textContent = 'Modifier un Plat';
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-description').value = item.description;
        document.getElementById('item-price').value = item.price;
    } else {
        modalTitle.textContent = 'Ajouter un Plat';
        itemForm.reset();
    }
    
    await populateCategorySelect();
    
    itemModal.classList.add('show');
}

function closeItemModal() {
    itemModal.classList.remove('show');
    currentEditingId = null;
    itemForm.reset();
}

async function saveMenuItem() {
    if (!hasPermission('menu')) {
        alert('Vous n\'avez pas la permission de modifier la carte.');
        return;
    }
    
    const name = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value;
    const description = document.getElementById('item-description').value.trim();
    const price = parseFloat(document.getElementById('item-price').value);
    
    if (!name || !category || !description || isNaN(price)) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    showLoading(true);
    
    try {
        const itemData = {
            name,
            category,
            description,
            price,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentEditingId) {
            await db.collection('menuSemaine').doc(currentEditingId).update(itemData);
        } else {
            itemData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('menuSemaine').doc().set(itemData);
        }
        
        closeItemModal();
        await populateCategorySelect();
        loadMenuItems();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du plat.');
    } finally {
        showLoading(false);
    }
}

function editMenuItem(item) {
    if (!hasPermission('menu')) {
        alert('Vous n\'avez pas la permission de modifier la carte.');
        return;
    }
    openItemModal(item);
}

async function deleteMenuItem(itemId) {
    if (!hasPermission('menu')) {
        alert('Vous n\'avez pas la permission de supprimer des plats.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        await db.collection('menuSemaine').doc(itemId).delete();
        loadMenuItems();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du plat.');
    } finally {
        showLoading(false);
    }
}


async function loadTeamMembers() {
    if (!teamMembersContainer) return;
    
    showLoading(true);
    try {
        const membersSnapshot = await db.collection('organigramme').get();
        teamMembersContainer.innerHTML = '';
        
        if (membersSnapshot.empty) {
            teamMembersContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-light); grid-column: 1 / -1;">Aucun membre dans l\'organigramme. Ajoutez-en un pour commencer !</p>';
        } else {
            const members = [];
            membersSnapshot.forEach(doc => {
                members.push({ id: doc.id, ...doc.data() });
            });
            
            members.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            members.forEach(member => {
                renderTeamMember(member);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement de l\'organigramme:', error);
        alert('Erreur lors du chargement de l\'organigramme.');
    } finally {
        showLoading(false);
    }
}

function renderTeamMember(member) {
    const memberCard = document.createElement('div');
    memberCard.className = 'menu-item-card';
    memberCard.innerHTML = `
        <div class="item-card-header">
            <div class="item-card-title">
                ${member.photo ? `<img src="${member.photo}" alt="${member.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 0.5rem; vertical-align: middle;">` : '<i class="fas fa-user"></i>'} ${member.name}
            </div>
        </div>
        <div class="item-card-category">${member.role || 'Rôle non défini'}</div>
        ${member.description ? `<div class="item-card-description">${member.description}</div>` : ''}
        <div class="item-card-actions">
            <button class="btn btn-secondary btn-sm edit-member-btn" data-id="${member.id}">Modifier</button>
            <button class="btn btn-danger btn-sm delete-member-btn" data-id="${member.id}">Supprimer</button>
        </div>
    `;
    
    teamMembersContainer.appendChild(memberCard);
    
    memberCard.querySelector('.edit-member-btn').addEventListener('click', () => editTeamMember(member));
    memberCard.querySelector('.delete-member-btn').addEventListener('click', () => deleteTeamMember(member.id));
}

async function populateMemberRankSelect() {
    const select = document.getElementById('member-role');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Sélectionner un grade</option>';
    
    try {
        const ranks = await getAllRanks();
        ranks.forEach(rank => {
            const option = document.createElement('option');
            option.value = rank.name;
            option.textContent = rank.name;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des grades:', error);
    }
}

async function openMemberModal(member = null) {
    if (!hasPermission('team')) {
        alert('Vous n\'avez pas la permission de modifier l\'équipe.');
        return;
    }
    
    currentEditingMemberId = member ? member.id : null;
    
    await populateMemberRankSelect();
    
    if (member) {
        memberModalTitle.textContent = 'Modifier un Membre';
        document.getElementById('member-name').value = member.name || '';
        document.getElementById('member-role').value = member.role || '';
        document.getElementById('member-description').value = member.description || '';
        document.getElementById('member-photo').value = member.photo || '';
        document.getElementById('member-order').value = member.order || 0;
    } else {
        memberModalTitle.textContent = 'Ajouter un Membre';
        memberForm.reset();
        document.getElementById('member-order').value = 0;
    }
    
    memberModal.classList.add('show');
}

function closeMemberModal() {
    memberModal.classList.remove('show');
    currentEditingMemberId = null;
    memberForm.reset();
}

async function saveTeamMember() {
    if (!hasPermission('team')) {
        alert('Vous n\'avez pas la permission de modifier l\'équipe.');
        return;
    }
    
    showLoading(true);
    
    try {
        const name = document.getElementById('member-name').value.trim();
        const role = document.getElementById('member-role').value.trim();
        const description = document.getElementById('member-description').value.trim();
        const photo = document.getElementById('member-photo').value.trim();
        const order = parseInt(document.getElementById('member-order').value) || 0;
        
        if (!name || !role) {
            alert('Le nom et le rôle sont requis.');
            return;
        }
        
        const memberData = {
            name,
            role,
            description: description || null,
            photo: photo || null,
            order,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentEditingMemberId) {
            await db.collection('organigramme').doc(currentEditingMemberId).update(memberData);
        } else {
            memberData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('organigramme').doc().set(memberData);
        }
        
        closeMemberModal();
        loadTeamMembers();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du membre.');
    } finally {
        showLoading(false);
    }
}

function editTeamMember(member) {
    if (!hasPermission('team')) {
        alert('Vous n\'avez pas la permission de modifier l\'équipe.');
        return;
    }
    openMemberModal(member);
}

async function deleteTeamMember(memberId) {
    if (!hasPermission('team')) {
        alert('Vous n\'avez pas la permission de supprimer des membres.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        await db.collection('organigramme').doc(memberId).delete();
        loadTeamMembers();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du membre.');
    } finally {
        showLoading(false);
    }
}


function renderMenuItems() {
    if (!menuItemsEditor) return;
    
    menuItemsEditor.innerHTML = '';
    
    if (menuItems.length === 0) {
        menuItemsEditor.innerHTML = '<p style="text-align: center; color: var(--color-text-light);">Aucun item dans le menu. Ajoutez-en un pour commencer !</p>';
        return;
    }
    
    menuItems.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'menu-item-card';
        itemCard.innerHTML = `
            <div class="item-card-header">
                <div class="item-card-title">
                    ${item.number || 'Item ' + (index + 1)} - ${item.price}€
                </div>
            </div>
            <div class="item-card-description">${item.description || ''}</div>
            ${item.image ? `<img src="${item.image}" alt="${item.number}" style="max-width: 200px; max-height: 150px; border-radius: 5px; margin-top: 0.5rem;">` : ''}
            <div class="item-card-actions">
                <button class="btn btn-secondary btn-sm edit-menu-item-btn" data-index="${index}">Modifier</button>
                <button class="btn btn-danger btn-sm delete-menu-item-btn" data-index="${index}">Supprimer</button>
                ${index > 0 ? `<button class="btn btn-sm move-up-btn" data-index="${index}" style="background: #6c757d; color: white;">↑</button>` : ''}
                ${index < menuItems.length - 1 ? `<button class="btn btn-sm move-down-btn" data-index="${index}" style="background: #6c757d; color: white;">↓</button>` : ''}
            </div>
        `;
        
        menuItemsEditor.appendChild(itemCard);
        
        itemCard.querySelector('.edit-menu-item-btn').addEventListener('click', () => editMenuEditorItem(index));
        itemCard.querySelector('.delete-menu-item-btn').addEventListener('click', () => deleteMenuEditorItem(index));
        
        const moveUpBtn = itemCard.querySelector('.move-up-btn');
        if (moveUpBtn) {
            moveUpBtn.addEventListener('click', () => moveMenuItem(index, -1));
        }
        
        const moveDownBtn = itemCard.querySelector('.move-down-btn');
        if (moveDownBtn) {
            moveDownBtn.addEventListener('click', () => moveMenuItem(index, 1));
        }
    });
}

function openMenuItemModal(item = null, index = null) {
    currentEditingMenuItemId = index;
    
    if (item !== null && index !== null) {
        menuItemModalTitle.textContent = 'Modifier un Item';
        document.getElementById('menu-item-number').value = item.number || '';
        document.getElementById('menu-item-price').value = item.price || '';
        document.getElementById('menu-item-description').value = item.description || '';
        document.getElementById('menu-item-image').value = item.image || '';
        document.getElementById('icon-vegetarian').checked = item.icons?.includes('vegetarian') || false;
        document.getElementById('icon-fish').checked = item.icons?.includes('fish') || false;
        document.getElementById('icon-rice').checked = item.icons?.includes('rice') || false;
        document.getElementById('icon-spicy').checked = item.icons?.includes('spicy') || false;
    } else {
        menuItemModalTitle.textContent = 'Ajouter un Item';
        menuItemForm.reset();
    }
    
    menuItemModal.classList.add('show');
}

function closeMenuItemModal() {
    menuItemModal.classList.remove('show');
    currentEditingMenuItemId = null;
    menuItemForm.reset();
    const imageFileInput = document.getElementById('menu-item-image-file');
    if (imageFileInput) imageFileInput.value = '';
}

async function saveMenuEditorItem() {
    const number = document.getElementById('menu-item-number').value.trim();
    const price = parseFloat(document.getElementById('menu-item-price').value);
    const description = document.getElementById('menu-item-description').value.trim();
    const image = document.getElementById('menu-item-image').value.trim();
    
    const icons = [];
    if (document.getElementById('icon-vegetarian').checked) icons.push('vegetarian');
    if (document.getElementById('icon-fish').checked) icons.push('fish');
    if (document.getElementById('icon-rice').checked) icons.push('rice');
    if (document.getElementById('icon-spicy').checked) icons.push('spicy');
    
    if (!number || !price || !description) {
        alert('Le numéro, le prix et la description sont requis.');
        return;
    }
    
    const item = {
        number,
        price,
        description,
        image: image || null,
        icons: icons.length > 0 ? icons : null
    };
    
    if (currentEditingMenuItemId !== null) {
        menuItems[currentEditingMenuItemId] = item;
    } else {
        menuItems.push(item);
    }
    
    closeMenuItemModal();
    renderMenuItems();
}

function editMenuEditorItem(index) {
    openMenuItemModal(menuItems[index], index);
}

function deleteMenuEditorItem(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet item ?')) {
        menuItems.splice(index, 1);
        renderMenuItems();
    }
}

function moveMenuItem(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < menuItems.length) {
        [menuItems[index], menuItems[newIndex]] = [menuItems[newIndex], menuItems[index]];
        renderMenuItems();
    }
}

function previewMenu() {
    const title = menuTitleInput.value.trim() || 'Menu';
    const footer = menuFooterInput.value.trim();
    
    menuPreviewContent.innerHTML = renderMenuHTML(title, footer);
    menuPreviewModal.classList.add('show');
}

function renderMenuHTML(title, footer) {
    const iconsMap = {
        vegetarian: '🌿',
        fish: '🐟',
        rice: '🍚',
        spicy: '🌶️'
    };
    
    let html = `
        <div class="menu-preview" style="background: white; padding: 2rem; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #8B4513; font-size: 2.5rem; margin-bottom: 2rem; text-align: left;">${title}</h1>
            <div class="menu-items-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
    `;
    
    menuItems.forEach(item => {
        const iconsHtml = item.icons ? item.icons.map(icon => iconsMap[icon] || '').join(' ') : '';
        
        html += `
            <div class="menu-item-preview" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white;">
                <div style="padding: 1rem; background: #f8f8f8; border-bottom: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: bold; font-size: 1.2rem;">${item.number}</span>
                        <span style="font-weight: bold; font-size: 1.2rem; color: #c41e3a;">${item.price.toFixed(2)}€</span>
                    </div>
                    ${iconsHtml ? `<div style="font-size: 1.2rem;">${iconsHtml}</div>` : ''}
                </div>
                ${item.image ? `<img src="${item.image}" alt="${item.number}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
                <div style="padding: 1rem;">
                    <p style="margin: 0; line-height: 1.6; color: #333;">${item.description}</p>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
    `;
    
    if (footer) {
        html += `
            <div style="background: #FF8C00; color: white; padding: 1.5rem; border-radius: 8px; margin-top: 2rem;">
                <p style="margin: 0; line-height: 1.8; white-space: pre-line;">${footer}</p>
            </div>
        `;
    }
    
    html += `</div>`;
    
    return html;
}

async function saveMenu() {
    showLoading(true);
    
    try {
        const title = menuTitleInput.value.trim() || 'Menu';
        const footer = menuFooterInput.value.trim();
        
        const menuData = {
            title,
            footer: footer || null,
            items: menuItems,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentMenuId) {
            await db.collection('menus').doc(currentMenuId).update(menuData);
        } else {
            menuData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('menus').add(menuData);
            currentMenuId = docRef.id;
        }
        
        alert('Menu enregistré avec succès !');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du menu.');
    } finally {
        showLoading(false);
    }
}

async function exportMenuToPNG() {
    if (menuItems.length === 0) {
        alert('Ajoutez au moins un item au menu avant d\'exporter.');
        return;
    }
    
    showLoading(true);
    
    try {
        const title = menuTitleInput.value.trim() || 'Menu';
        const footer = menuFooterInput.value.trim();
        
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '800px';
        tempDiv.innerHTML = renderMenuHTML(title, footer);
        document.body.appendChild(tempDiv);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const menuElement = tempDiv.querySelector('.menu-preview');
        
        if (typeof html2canvas === 'undefined') {
            alert('La bibliothèque html2canvas n\'est pas chargée. Vérifiez votre connexion internet.');
            document.body.removeChild(tempDiv);
            return;
        }
        
        const canvas = await html2canvas(menuElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
        });
        
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        document.body.removeChild(tempDiv);
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        alert('Erreur lors de l\'export du menu. Vérifiez que html2canvas est bien chargé.');
    } finally {
        showLoading(false);
    }
}


let currentEditingSaleId = null;
let currentEditingEmployeeId = null;
let currentEditingRankId = null;
let currentEditingAdminId = null;
let currentEditingBonusId = null;

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addSaleBtn = document.getElementById('add-sale-btn');
const saleModal = document.getElementById('sale-modal');
const saleForm = document.getElementById('sale-form');
const saleModalClose = document.getElementById('sale-modal-close');
const cancelSaleBtn = document.getElementById('cancel-sale-btn');
const addEmployeeBtn = document.getElementById('add-employee-btn');
const employeeModal = document.getElementById('employee-modal');
const employeeForm = document.getElementById('employee-form');
const employeeModalClose = document.getElementById('employee-modal-close');
const cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
const addRankBtn = document.getElementById('add-rank-btn');
const rankModal = document.getElementById('rank-modal');
const rankForm = document.getElementById('rank-form');
const rankModalClose = document.getElementById('rank-modal-close');
const cancelRankBtn = document.getElementById('cancel-rank-btn');
const addAdminBtn = document.getElementById('add-admin-btn');
const adminModal = document.getElementById('admin-modal');
const adminForm = document.getElementById('admin-form');
const adminModalClose = document.getElementById('admin-modal-close');
const cancelAdminBtn = document.getElementById('cancel-admin-btn');

if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            if (targetTab === 'admins') {
                const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
                if (!isSuperAdmin && !hasPermission('admins')) {
                    alert('Vous n\'avez pas la permission d\'accéder à cette section.');
                    return;
                }
            } else if (targetTab === 'menu' && !hasPermission('menu')) {
                alert('Vous n\'avez pas la permission d\'accéder à cette section.');
                return;
            } else if (targetTab === 'team' && !hasPermission('team')) {
                alert('Vous n\'avez pas la permission d\'accéder à cette section.');
                return;
            } else if (targetTab === 'sales' && !hasPermission('sales')) {
                alert('Vous n\'avez pas la permission d\'accéder à cette section.');
                return;
            } else if (targetTab === 'history' && !hasPermission('sales')) {
                alert('Vous n\'avez pas la permission d\'accéder à cette section.');
                return;
            } else if (targetTab === 'employees' && !hasPermission('employees')) {
                alert('Vous n\'avez pas la permission d\'accéder à cette section.');
                return;
            } else if (targetTab === 'ranks' && !hasPermission('ranks')) {
                alert('Vous n\'avez pas la permission d\'accéder à cette section.');
                return;
            }
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            if (targetTab === 'sales') {
                loadSales();
                loadEmployeeSales();
                loadBonusesTable();
            } else if (targetTab === 'history') {
                loadHistory();
            } else if (targetTab === 'employees') {
                loadEmployees();
            } else if (targetTab === 'ranks') {
                loadRanks();
            } else if (targetTab === 'admins') {
                loadAdmins();
            }
        });
    });
}


async function loadSales() {
    showLoading(true);
    try {
        const salesSnapshot = await db.collection('sales').orderBy('date', 'desc').get();
        const bonusesSnapshot = await db.collection('bonuses').get();
        const employees = await getAllEmployees();
        const sales = [];
        let totalSales = 0;
        let totalCommissions = 0;
        let totalBonuses = 0;
        
        salesSnapshot.forEach(doc => {
            const data = doc.data();
            sales.push({
                id: doc.id,
                ...data,
                date: data.date?.toDate() || new Date()
            });
            totalSales += parseFloat(data.amount || 0);
        });
        
        for (const sale of sales) {
            const employee = await getEmployeeById(sale.employeeId);
            if (employee) {
                const rank = await getRankById(employee.rankId);
                if (rank) {
                    totalCommissions += parseFloat(sale.amount) * parseFloat(rank.percentage) / 100;
                }
            }
        }
        
        bonusesSnapshot.forEach(doc => {
            const bonus = doc.data();
            totalBonuses += parseFloat(bonus.amount || 0);
        });
        
        const totalBenefits = totalSales - totalCommissions - totalBonuses;
        
        const totalSalesEl = document.getElementById('total-sales');
        const salesCountEl = document.getElementById('sales-count');
        const avgSaleEl = document.getElementById('avg-sale');
        const totalCommissionsEl = document.getElementById('total-commissions');
        const totalBonusesEl = document.getElementById('total-bonuses');
        const totalBenefitsEl = document.getElementById('total-benefits');
        
        if (totalSalesEl) totalSalesEl.textContent = `${totalSales.toFixed(2)} €`;
        if (salesCountEl) salesCountEl.textContent = sales.length;
        if (avgSaleEl) avgSaleEl.textContent = sales.length > 0 
            ? `${(totalSales / sales.length).toFixed(2)} €` 
            : '0 €';
        if (totalCommissionsEl) totalCommissionsEl.textContent = `${totalCommissions.toFixed(2)} €`;
        if (totalBonusesEl) totalBonusesEl.textContent = `${totalBonuses.toFixed(2)} €`;
        if (totalBenefitsEl) {
            totalBenefitsEl.textContent = `${totalBenefits.toFixed(2)} €`;
            if (totalBenefits < 0) {
                totalBenefitsEl.parentElement.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            }
        }
        
        const tbody = document.getElementById('sales-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Aucune vente enregistrée</td></tr>';
            return;
        }
        
        for (const sale of sales) {
            const employee = await getEmployeeById(sale.employeeId);
            const employeeName = employee ? employee.name : 'Employé supprimé';
            const rank = employee ? await getRankById(employee.rankId) : null;
            const commission = rank ? (parseFloat(sale.amount) * parseFloat(rank.percentage) / 100) : 0;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(sale.date)}</td>
                <td>${employeeName}</td>
                <td><strong>${parseFloat(sale.amount).toFixed(2)} €</strong></td>
                <td>${commission.toFixed(2)} € <small style="color: var(--color-text-light);">(salaire)</small></td>
                <td class="table-actions">
                    <button class="btn-icon" onclick="editSale('${sale.id}')" title="Modifier">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon danger" onclick="deleteSale('${sale.id}')" title="Supprimer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des ventes:', error);
        alert('Erreur lors du chargement des ventes.');
    } finally {
        showLoading(false);
    }
}

async function loadEmployeeSales() {
    try {
        const employees = await getAllEmployees();
        const salesSnapshot = await db.collection('sales').get();
        const sales = [];
        
        salesSnapshot.forEach(doc => {
            const data = doc.data();
            sales.push({
                id: doc.id,
                ...data,
                date: data.date?.toDate() || new Date()
            });
        });
        
        const container = document.getElementById('employee-sales-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (employees.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucun employé enregistré</p></div>';
            return;
        }
        
        const bonusesSnapshot = await db.collection('bonuses').get();
        const bonuses = [];
        bonusesSnapshot.forEach(doc => {
            bonuses.push({ id: doc.id, ...doc.data() });
        });
        
        for (const employee of employees) {
            const employeeSales = sales.filter(s => s.employeeId === employee.id);
            const employeeBonuses = bonuses.filter(b => b.employeeId === employee.id);
            const rank = await getRankById(employee.rankId);
            let totalAmount = 0;
            let totalCommission = 0;
            let totalBonus = 0;
            
            employeeSales.forEach(sale => {
                totalAmount += parseFloat(sale.amount || 0);
                if (rank) {
                    totalCommission += parseFloat(sale.amount || 0) * parseFloat(rank.percentage || 0) / 100;
                }
            });
            
            employeeBonuses.forEach(bonus => {
                totalBonus += parseFloat(bonus.amount || 0);
            });
            
            const card = document.createElement('div');
            card.className = 'employee-sales-card';
            card.innerHTML = `
                <div class="employee-sales-header">
                    <div>
                        <div class="employee-sales-name">${employee.name}</div>
                        <div class="employee-sales-commission">${employeeSales.length} vente(s), ${employeeBonuses.length} prime(s)</div>
                    </div>
                    <div>
                        <div class="employee-sales-total">CA: ${totalAmount.toFixed(2)} €</div>
                        <div class="employee-sales-commission">Salaire: ${totalCommission.toFixed(2)} €</div>
                        ${totalBonus > 0 ? `
                            <div class="employee-sales-commission" style="color: #ffc107;">Prime: ${totalBonus.toFixed(2)} €</div>
                            <div class="employee-sales-commission" style="font-weight: 600; margin-top: 0.5rem;">Total: ${(totalCommission + totalBonus).toFixed(2)} €</div>
                        ` : ''}
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Salaire</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employeeSales.length === 0 
                                ? '<tr><td colspan="4" class="empty-state">Aucune vente</td></tr>'
                                : employeeSales.map(sale => {
                                    const commission = rank ? (parseFloat(sale.amount) * parseFloat(rank.percentage) / 100) : 0;
                                    return `
                                        <tr>
                                            <td>${formatDate(sale.date)}</td>
                                            <td>${parseFloat(sale.amount).toFixed(2)} €</td>
                                            <td>${commission.toFixed(2)} € <small style="color: var(--color-text-light);">(salaire)</small></td>
                                            <td class="table-actions">
                                                <button class="btn-icon" onclick="editSale('${sale.id}')" title="Modifier">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button class="btn-icon danger" onclick="deleteSale('${sale.id}')" title="Supprimer">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path d="M3 6h18"></path>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')
                            }
                        </tbody>
                    </table>
                </div>
            `;
            container.appendChild(card);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des ventes par employé:', error);
    }
}

function openSaleModal(sale = null) {
    if (!hasPermission('sales')) {
        alert('Vous n\'avez pas la permission de modifier les ventes.');
        return;
    }
    
    currentEditingSaleId = sale ? sale.id : null;
    const titleEl = document.getElementById('sale-modal-title');
    if (titleEl) {
        titleEl.textContent = sale ? 'Modifier une Vente' : 'Ajouter une Vente';
    }
    
    populateEmployeeSelect('sale-employee');
    
    if (sale) {
        document.getElementById('sale-date').value = formatDateTimeLocal(sale.date);
        document.getElementById('sale-employee').value = sale.employeeId;
        document.getElementById('sale-amount').value = sale.amount;
        document.getElementById('sale-description').value = sale.description || '';
    } else {
        if (saleForm) saleForm.reset();
        const dateInput = document.getElementById('sale-date');
        if (dateInput) dateInput.value = formatDateTimeLocal(new Date());
    }
    
    if (saleModal) saleModal.classList.add('show');
}

function closeSaleModal() {
    if (saleModal) saleModal.classList.remove('show');
    currentEditingSaleId = null;
    if (saleForm) saleForm.reset();
}

async function saveSale() {
    if (!hasPermission('sales')) {
        alert('Vous n\'avez pas la permission de modifier les ventes.');
        return;
    }
    
    const dateInput = document.getElementById('sale-date');
    const employeeSelect = document.getElementById('sale-employee');
    const amountInput = document.getElementById('sale-amount');
    const descriptionInput = document.getElementById('sale-description');
    
    if (!dateInput || !employeeSelect || !amountInput) return;
    
    const date = dateInput.value;
    const employeeId = employeeSelect.value;
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput ? descriptionInput.value : '';
    
    if (!date || !employeeId || isNaN(amount) || amount <= 0) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    showLoading(true);
    try {
        const saleData = {
            date: firebase.firestore.Timestamp.fromDate(new Date(date)),
            employeeId,
            amount,
            description: description.trim() || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentEditingSaleId) {
            await db.collection('sales').doc(currentEditingSaleId).update(saleData);
        } else {
            await db.collection('sales').add(saleData);
        }
        
        closeSaleModal();
        loadSales();
        loadEmployeeSales();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde de la vente.');
    } finally {
        showLoading(false);
    }
}

async function deleteSale(saleId) {
    if (!hasPermission('sales')) {
        alert('Vous n\'avez pas la permission de supprimer des ventes.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
        return;
    }
    
    showLoading(true);
    try {
        await db.collection('sales').doc(saleId).delete();
        loadSales();
        loadEmployeeSales();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la vente.');
    } finally {
        showLoading(false);
    }
}

function editSale(saleId) {
    if (!hasPermission('sales')) {
        alert('Vous n\'avez pas la permission de modifier les ventes.');
        return;
    }
    db.collection('sales').doc(saleId).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            openSaleModal({
                id: doc.id,
                ...data,
                date: data.date?.toDate() || new Date()
            });
        }
    });
}


async function loadBonusesTable() {
    if (!hasPermission('bonuses') && !hasPermission('sales')) {
        return;
    }
    
    try {
        const bonusesSnapshot = await db.collection('bonuses').orderBy('date', 'desc').get();
        const tbody = document.getElementById('bonuses-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (bonusesSnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Aucune prime enregistrée</td></tr>';
            return;
        }
        
        for (const doc of bonusesSnapshot.docs) {
            const bonus = { id: doc.id, ...doc.data() };
            const employee = await getEmployeeById(bonus.employeeId);
            const employeeName = employee ? employee.name : 'Employé supprimé';
            const bonusDate = bonus.date?.toDate() || new Date();
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(bonusDate)}</td>
                <td>${employeeName}</td>
                <td><strong style="color: #ffc107;">${parseFloat(bonus.amount).toFixed(2)} €</strong></td>
                <td>${bonus.description || '-'}</td>
                <td class="table-actions">
                    ${hasPermission('bonuses') ? `
                        <button class="btn-icon" onclick="editBonus('${bonus.id}')" title="Modifier">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon danger" onclick="deleteBonus('${bonus.id}')" title="Supprimer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    ` : '<span style="color: var(--color-text-light);">-</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des primes:', error);
    }
}

function editBonus(bonusId) {
    if (!hasPermission('bonuses')) {
        alert('Vous n\'avez pas la permission de modifier les primes.');
        return;
    }
    
    db.collection('bonuses').doc(bonusId).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            openBonusModal({
                id: doc.id,
                ...data,
                date: data.date?.toDate() || new Date()
            });
        }
    });
}

function openBonusModal(bonus = null) {
    if (!hasPermission('bonuses')) {
        alert('Vous n\'avez pas la permission de gérer les primes.');
        return;
    }
    
    currentEditingBonusId = bonus ? bonus.id : null;
    const titleEl = document.getElementById('bonus-modal-title');
    if (titleEl) {
        titleEl.textContent = bonus ? 'Modifier une Prime' : 'Ajouter une Prime';
    }
    
    populateEmployeeSelect('bonus-employee');
    
    if (bonus) {
        document.getElementById('bonus-employee').value = bonus.employeeId || '';
        document.getElementById('bonus-amount').value = bonus.amount || '';
        document.getElementById('bonus-date').value = bonus.date ? formatDateInput(bonus.date) : '';
        document.getElementById('bonus-description').value = bonus.description || '';
    } else {
        if (bonusForm) bonusForm.reset();
        const dateInput = document.getElementById('bonus-date');
        if (dateInput) dateInput.value = formatDateInput(new Date());
    }
    
    if (bonusModal) bonusModal.classList.add('show');
}

function closeBonusModal() {
    if (bonusModal) bonusModal.classList.remove('show');
    currentEditingBonusId = null;
    if (bonusForm) bonusForm.reset();
}

function formatDateInput(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function saveBonus() {
    if (!hasPermission('bonuses')) {
        alert('Vous n\'avez pas la permission de gérer les primes.');
        return;
    }
    
    const employeeSelect = document.getElementById('bonus-employee');
    const amountInput = document.getElementById('bonus-amount');
    const dateInput = document.getElementById('bonus-date');
    const descriptionInput = document.getElementById('bonus-description');
    
    if (!employeeSelect || !amountInput || !dateInput) return;
    
    const employeeId = employeeSelect.value;
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    
    if (!employeeId || isNaN(amount) || amount <= 0 || !date) {
        alert('Veuillez remplir tous les champs obligatoires avec des valeurs valides.');
        return;
    }
    
    showLoading(true);
    try {
        const bonusData = {
            employeeId,
            amount,
            date: firebase.firestore.Timestamp.fromDate(new Date(date)),
            description: description || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentEditingBonusId) {
            await db.collection('bonuses').doc(currentEditingBonusId).update(bonusData);
        } else {
            await db.collection('bonuses').add(bonusData);
        }
        
        closeBonusModal();
        loadSales();
        loadEmployeeSales();
        loadBonusesTable();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde de la prime.');
    } finally {
        showLoading(false);
    }
}

async function deleteBonus(bonusId) {
    if (!hasPermission('bonuses')) {
        alert('Vous n\'avez pas la permission de supprimer des primes.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette prime ?')) {
        return;
    }
    
    showLoading(true);
    try {
        await db.collection('bonuses').doc(bonusId).delete();
        loadSales();
        loadEmployeeSales();
        loadBonusesTable();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la prime.');
    } finally {
        showLoading(false);
    }
}


async function loadEmployees() {
    showLoading(true);
    try {
        const employeesSnapshot = await db.collection('employees').orderBy('name').get();
        const container = document.getElementById('employees-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (employeesSnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>Aucun employé enregistré</p></div>';
            return;
        }
        
        for (const doc of employeesSnapshot.docs) {
            const employee = { id: doc.id, ...doc.data() };
            const rank = await getRankById(employee.rankId);
            
            const card = document.createElement('div');
            card.className = 'menu-item-card';
            card.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">${employee.name}</div>
                    <div class="item-card-actions">
                        <button class="btn-icon" onclick="editEmployee('${employee.id}')" title="Modifier">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon danger" onclick="deleteEmployee('${employee.id}')" title="Supprimer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <div><strong>Grade:</strong> ${rank ? rank.name : 'Aucun'}</div>
                </div>
            `;
            container.appendChild(card);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
        alert('Erreur lors du chargement des employés.');
    } finally {
        showLoading(false);
    }
}

function openEmployeeModal(employee = null) {
    if (!hasPermission('employees')) {
        alert('Vous n\'avez pas la permission de modifier les employés.');
        return;
    }
    
    currentEditingEmployeeId = employee ? employee.id : null;
    const titleEl = document.getElementById('employee-modal-title');
    if (titleEl) {
        titleEl.textContent = employee ? 'Modifier un Employé' : 'Ajouter un Employé';
    }
    
    populateRankSelect('employee-rank');
    
    if (employee) {
        document.getElementById('employee-name').value = employee.name || '';
        document.getElementById('employee-rank').value = employee.rankId || '';
    } else {
        if (employeeForm) employeeForm.reset();
    }
    
    if (employeeModal) employeeModal.classList.add('show');
}

function closeEmployeeModal() {
    if (employeeModal) employeeModal.classList.remove('show');
    currentEditingEmployeeId = null;
    if (employeeForm) employeeForm.reset();
}

async function saveEmployee() {
    if (!hasPermission('employees')) {
        alert('Vous n\'avez pas la permission de modifier les employés.');
        return;
    }
    
    const nameInput = document.getElementById('employee-name');
    const rankSelect = document.getElementById('employee-rank');
    
    if (!nameInput || !rankSelect) return;
    
    const name = nameInput.value.trim();
    const rankId = rankSelect.value;
    
    if (!name || !rankId) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    showLoading(true);
    try {
        const employeeData = {
            name,
            rankId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentEditingEmployeeId) {
            await db.collection('employees').doc(currentEditingEmployeeId).update(employeeData);
        } else {
            await db.collection('employees').add(employeeData);
        }
        
        closeEmployeeModal();
        loadEmployees();
        const salesTab = document.getElementById('tab-sales');
        if (salesTab && salesTab.classList.contains('active')) {
            loadSales();
            loadEmployeeSales();
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde de l\'employé.');
    } finally {
        showLoading(false);
    }
}

async function deleteEmployee(employeeId) {
    if (!hasPermission('employees')) {
        alert('Vous n\'avez pas la permission de supprimer des employés.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
        return;
    }
    
    showLoading(true);
    try {
        await db.collection('employees').doc(employeeId).delete();
        loadEmployees();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'employé.');
    } finally {
        showLoading(false);
    }
}

function editEmployee(employeeId) {
    if (!hasPermission('employees')) {
        alert('Vous n\'avez pas la permission de modifier les employés.');
        return;
    }
    db.collection('employees').doc(employeeId).get().then(doc => {
        if (doc.exists) {
            openEmployeeModal({ id: doc.id, ...doc.data() });
        }
    });
}


async function loadRanks() {
    showLoading(true);
    try {
        const ranksSnapshot = await db.collection('ranks').orderBy('name').get();
        const container = document.getElementById('ranks-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (ranksSnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>Aucun grade enregistré</p></div>';
            return;
        }
        
        ranksSnapshot.forEach(doc => {
            const rank = { id: doc.id, ...doc.data() };
            const card = document.createElement('div');
            card.className = 'menu-item-card';
            card.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">${rank.name}</div>
                    <div class="item-card-actions">
                        <button class="btn-icon" onclick="editRank('${rank.id}')" title="Modifier">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon danger" onclick="deleteRank('${rank.id}')" title="Supprimer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <div><strong>Commission:</strong> <span class="badge">${parseFloat(rank.percentage).toFixed(2)}%</span></div>
                    ${rank.description ? `<div style="margin-top: 0.5rem; color: var(--color-text-light);">${rank.description}</div>` : ''}
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des grades:', error);
        alert('Erreur lors du chargement des grades.');
    } finally {
        showLoading(false);
    }
}

function openRankModal(rank = null) {
    if (!hasPermission('ranks')) {
        alert('Vous n\'avez pas la permission de modifier les grades.');
        return;
    }
    
    currentEditingRankId = rank ? rank.id : null;
    const titleEl = document.getElementById('rank-modal-title');
    if (titleEl) {
        titleEl.textContent = rank ? 'Modifier un Grade' : 'Créer un Grade';
    }
    
    if (rank) {
        document.getElementById('rank-name').value = rank.name || '';
        document.getElementById('rank-percentage').value = rank.percentage || '';
        document.getElementById('rank-description').value = rank.description || '';
    } else {
        if (rankForm) rankForm.reset();
    }
    
    if (rankModal) rankModal.classList.add('show');
}

function closeRankModal() {
    if (rankModal) rankModal.classList.remove('show');
    currentEditingRankId = null;
    if (rankForm) rankForm.reset();
}

async function saveRank() {
    if (!hasPermission('ranks')) {
        alert('Vous n\'avez pas la permission de modifier les grades.');
        return;
    }
    
    const nameInput = document.getElementById('rank-name');
    const percentageInput = document.getElementById('rank-percentage');
    const descriptionInput = document.getElementById('rank-description');
    
    if (!nameInput || !percentageInput) return;
    
    const name = nameInput.value.trim();
    const percentage = parseFloat(percentageInput.value);
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    
    if (!name || isNaN(percentage) || percentage < 0 || percentage > 100) {
        alert('Veuillez remplir tous les champs obligatoires avec des valeurs valides.');
        return;
    }
    
    showLoading(true);
    try {
        const rankData = {
            name,
            percentage,
            description: description || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentEditingRankId) {
            await db.collection('ranks').doc(currentEditingRankId).update(rankData);
        } else {
            await db.collection('ranks').add(rankData);
        }
        
        closeRankModal();
        loadRanks();
        const employeesTab = document.getElementById('tab-employees');
        if (employeesTab && employeesTab.classList.contains('active')) {
            loadEmployees();
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du grade.');
    } finally {
        showLoading(false);
    }
}

async function deleteRank(rankId) {
    if (!hasPermission('ranks')) {
        alert('Vous n\'avez pas la permission de supprimer des grades.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce grade ? Les employés avec ce grade devront être réassignés.')) {
        return;
    }
    
    showLoading(true);
    try {
        await db.collection('ranks').doc(rankId).delete();
        loadRanks();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du grade.');
    } finally {
        showLoading(false);
    }
}

function editRank(rankId) {
    if (!hasPermission('ranks')) {
        alert('Vous n\'avez pas la permission de modifier les grades.');
        return;
    }
    db.collection('ranks').doc(rankId).get().then(doc => {
        if (doc.exists) {
            openRankModal({ id: doc.id, ...doc.data() });
        }
    });
}


async function loadAdmins() {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    const canManageAdmins = isSuperAdmin || hasPermission('admins');
    
    if (!canManageAdmins) {
        const container = document.getElementById('admins-container');
        if (container) {
            container.innerHTML = '<div class="empty-state"><p>Vous n\'avez pas les permissions pour gérer les administrateurs.</p></div>';
        }
        return;
    }
    
    showLoading(true);
    try {
        const adminsSnapshot = await db.collection('admins').get();
        const container = document.getElementById('admins-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (adminsSnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>Aucun administrateur enregistré</p></div>';
            return;
        }
        
        adminsSnapshot.forEach(doc => {
            const admin = { id: doc.id, ...doc.data() };
            const permissions = admin.permissions || {};
            
            const card = document.createElement('div');
            card.className = 'menu-item-card';
            card.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">${admin.username || admin.discordId || 'Admin'}</div>
                    <div class="item-card-actions">
                        <button class="btn-icon" onclick="editAdmin('${admin.id}')" title="Modifier">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon danger" onclick="deleteAdmin('${admin.id}')" title="Supprimer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <div><strong>Discord ID:</strong> ${admin.discordId}</div>
                    <div style="margin-top: 0.5rem;">
                        <strong>Permissions:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                            ${permissions.menu ? '<span class="badge">Carte</span>' : ''}
                            ${permissions.team ? '<span class="badge">Équipe</span>' : ''}
                            ${permissions.sales ? '<span class="badge">Ventes</span>' : ''}
                            ${permissions.resetSales ? '<span class="badge">Réinit. Ventes</span>' : ''}
                            ${permissions.bonuses ? '<span class="badge">Primes</span>' : ''}
                            ${permissions.employees ? '<span class="badge">Employés</span>' : ''}
                            ${permissions.ranks ? '<span class="badge">Grades</span>' : ''}
                            ${permissions.admins ? '<span class="badge success">Admins</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des admins:', error);
        alert('Erreur lors du chargement des administrateurs.');
    } finally {
        showLoading(false);
    }
}

function openAdminModal(admin = null) {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    const canManageAdmins = isSuperAdmin || hasPermission('admins');
    
    if (!canManageAdmins) {
        alert('Vous n\'avez pas la permission de gérer les administrateurs.');
        return;
    }
    
    currentEditingAdminId = admin ? admin.id : null;
    const titleEl = document.getElementById('admin-modal-title');
    if (titleEl) {
        titleEl.textContent = admin ? 'Modifier un Administrateur' : 'Ajouter un Administrateur';
    }
    
    if (admin) {
        document.getElementById('admin-discord-id').value = admin.discordId || '';
        document.getElementById('admin-username').value = admin.username || '';
        const permissions = admin.permissions || {};
        document.getElementById('perm-menu').checked = permissions.menu === true;
        document.getElementById('perm-team').checked = permissions.team === true;
        document.getElementById('perm-sales').checked = permissions.sales === true;
        document.getElementById('perm-resetSales').checked = permissions.resetSales === true;
        document.getElementById('perm-bonuses').checked = permissions.bonuses === true;
        document.getElementById('perm-employees').checked = permissions.employees === true;
        document.getElementById('perm-ranks').checked = permissions.ranks === true;
        document.getElementById('perm-admins').checked = permissions.admins === true;
        document.getElementById('perm-admins').disabled = false;
    } else {
        if (adminForm) adminForm.reset();
        document.getElementById('perm-menu').checked = true;
        document.getElementById('perm-team').checked = true;
        document.getElementById('perm-sales').checked = true;
        document.getElementById('perm-resetSales').checked = false;
        document.getElementById('perm-bonuses').checked = false;
        document.getElementById('perm-employees').checked = true;
        document.getElementById('perm-ranks').checked = true;
        document.getElementById('perm-admins').checked = false;
        document.getElementById('perm-admins').disabled = false;
    }
    
    if (adminModal) adminModal.classList.add('show');
}

function closeAdminModal() {
    if (adminModal) adminModal.classList.remove('show');
    currentEditingAdminId = null;
    if (adminForm) adminForm.reset();
}

async function saveAdmin() {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    const canManageAdmins = isSuperAdmin || hasPermission('admins');
    
    if (!canManageAdmins) {
        alert('Vous n\'avez pas la permission de gérer les administrateurs.');
        return;
    }
    
    const discordIdInput = document.getElementById('admin-discord-id');
    const usernameInput = document.getElementById('admin-username');
    
    if (!discordIdInput) return;
    
    const discordId = discordIdInput.value.trim();
    const username = usernameInput ? usernameInput.value.trim() : '';
    const permissions = {
        menu: document.getElementById('perm-menu').checked,
        team: document.getElementById('perm-team').checked,
        sales: document.getElementById('perm-sales').checked,
        resetSales: document.getElementById('perm-resetSales').checked,
        bonuses: document.getElementById('perm-bonuses').checked,
        employees: document.getElementById('perm-employees').checked,
        ranks: document.getElementById('perm-ranks').checked,
        admins: document.getElementById('perm-admins').checked
    };
    
    if (!discordId) {
        alert('Veuillez entrer un ID Discord.');
        return;
    }
    
    showLoading(true);
    try {
        const adminData = {
            discordId,
            username: username || null,
            isAdmin: true,
            permissions,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentEditingAdminId) {
            await db.collection('admins').doc(currentEditingAdminId).update(adminData);
        } else {
            await db.collection('admins').doc(discordId).set(adminData);
        }
        
        closeAdminModal();
        loadAdmins();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde de l\'administrateur.');
    } finally {
        showLoading(false);
    }
}

async function deleteAdmin(adminId) {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    const canManageAdmins = isSuperAdmin || hasPermission('admins');
    
    if (!canManageAdmins) {
        alert('Vous n\'avez pas la permission de supprimer des administrateurs.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
        return;
    }
    
    showLoading(true);
    try {
        await db.collection('admins').doc(adminId).delete();
        loadAdmins();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'administrateur.');
    } finally {
        showLoading(false);
    }
}

function editAdmin(adminId) {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    const canManageAdmins = isSuperAdmin || hasPermission('admins');
    
    if (!canManageAdmins) {
        alert('Vous n\'avez pas la permission de modifier des administrateurs.');
        return;
    }
    
    db.collection('admins').doc(adminId).get().then(doc => {
        if (doc.exists) {
            openAdminModal({ id: doc.id, ...doc.data() });
        }
    });
}


async function getAllEmployees() {
    const snapshot = await db.collection('employees').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getEmployeeById(employeeId) {
    if (!employeeId) return null;
    const doc = await db.collection('employees').doc(employeeId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function getRankById(rankId) {
    if (!rankId) return null;
    const doc = await db.collection('ranks').doc(rankId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function getAllRanks() {
    const snapshot = await db.collection('ranks').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function populateEmployeeSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Sélectionner un employé</option>';
    
    const employees = await getAllEmployees();
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        select.appendChild(option);
    });
    
    if (currentValue) {
        select.value = currentValue;
    }
}

async function populateRankSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Sélectionner un grade</option>';
    
    const ranks = await getAllRanks();
    ranks.forEach(rank => {
        const option = document.createElement('option');
        option.value = rank.id;
        option.textContent = `${rank.name} (${parseFloat(rank.percentage).toFixed(2)}%)`;
        select.appendChild(option);
    });
    
    if (currentValue) {
        select.value = currentValue;
    }
}

function formatDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
    return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTimeLocal(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}


async function resetSales() {
    if (!hasPermission('resetSales')) {
        alert('Vous n\'avez pas la permission de réinitialiser les ventes.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser les ventes ? Toutes les ventes actuelles seront archivées dans l\'historique.')) {
        return;
    }
    
    showLoading(true);
    try {
        const salesSnapshot = await db.collection('sales').get();
        
        if (salesSnapshot.empty) {
            alert('Aucune vente à archiver.');
            showLoading(false);
            return;
        }
        
        const sales = [];
        let totalAmount = 0;
        let totalCommissions = 0;
        
        salesSnapshot.forEach(doc => {
            const data = doc.data();
            sales.push({
                id: doc.id,
                ...data,
                date: data.date?.toDate() || new Date()
            });
            totalAmount += parseFloat(data.amount || 0);
        });
        
        for (const sale of sales) {
            const employee = await getEmployeeById(sale.employeeId);
            if (employee) {
                const rank = await getRankById(employee.rankId);
                if (rank) {
                    totalCommissions += parseFloat(sale.amount) * parseFloat(rank.percentage) / 100;
                }
            }
        }
        
        const historyData = {
            periodStart: firebase.firestore.Timestamp.fromDate(new Date()),
            periodEnd: firebase.firestore.Timestamp.fromDate(new Date()),
            salesCount: sales.length,
            totalAmount,
            totalCommissions,
            sales: sales.map(sale => ({
                date: sale.date,
                employeeId: sale.employeeId,
                amount: sale.amount,
                description: sale.description || ''
            })),
            archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
            archivedBy: JSON.parse(localStorage.getItem('discord_user') || '{}').id || 'unknown'
        };
        
        await db.collection('salesHistory').add(historyData);
        
        const batch = db.batch();
        salesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        alert(`Réinitialisation réussie ! ${sales.length} vente(s) archivée(s).`);
        
        loadSales();
        loadEmployeeSales();
        
    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        alert('Erreur lors de la réinitialisation des ventes.');
    } finally {
        showLoading(false);
    }
}

async function loadHistory() {
    showLoading(true);
    try {
        const historySnapshot = await db.collection('salesHistory').orderBy('archivedAt', 'desc').get();
        const container = document.getElementById('history-periods-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (historySnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>Aucun historique disponible</p></div>';
            return;
        }
        
        historySnapshot.forEach(doc => {
            const period = { id: doc.id, ...doc.data() };
            const archivedDate = period.archivedAt?.toDate() || new Date();
            const periodStart = period.periodStart?.toDate() || archivedDate;
            const periodEnd = period.periodEnd?.toDate() || archivedDate;
            
            const card = document.createElement('div');
            card.className = 'menu-item-card';
            card.innerHTML = `
                <div class="item-card-header">
                    <div class="item-card-title">Période archivée</div>
                    <div class="item-card-actions">
                        <button class="btn-icon" onclick="viewHistoryDetails('${period.id}')" title="Voir les détails">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <div><strong>Date d'archivage:</strong> ${formatDate(archivedDate)}</div>
                    <div style="margin-top: 0.5rem;"><strong>Période:</strong> ${formatDate(periodStart)} - ${formatDate(periodEnd)}</div>
                    <div style="margin-top: 0.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <div>
                            <div style="color: var(--color-text-light); font-size: 0.9rem;">Nombre de ventes</div>
                            <div style="font-weight: 600; font-size: 1.1rem;">${period.salesCount || 0}</div>
                        </div>
                        <div>
                            <div style="color: var(--color-text-light); font-size: 0.9rem;">Chiffre d'Affaires</div>
                            <div style="font-weight: 600; font-size: 1.1rem; color: var(--color-primary);">${parseFloat(period.totalAmount || 0).toFixed(2)} €</div>
                        </div>
                        <div>
                            <div style="color: var(--color-text-light); font-size: 0.9rem;">Commissions</div>
                            <div style="font-weight: 600; font-size: 1.1rem; color: var(--color-success);">${parseFloat(period.totalCommissions || 0).toFixed(2)} €</div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        alert('Erreur lors du chargement de l\'historique.');
    } finally {
        showLoading(false);
    }
}

function viewHistoryDetails(historyId) {
    db.collection('salesHistory').doc(historyId).get().then(doc => {
        if (doc.exists) {
            const period = { id: doc.id, ...doc.data() };
            showHistoryDetailsModal(period);
        }
    });
}

async function showHistoryDetailsModal(period) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2>Détails de la Période Archivée</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <div style="margin-bottom: 1.5rem;">
                    <div><strong>Date d'archivage:</strong> ${formatDate(period.archivedAt?.toDate() || new Date())}</div>
                    <div style="margin-top: 0.5rem;"><strong>Nombre de ventes:</strong> ${period.salesCount || 0}</div>
                    <div style="margin-top: 0.5rem;"><strong>Chiffre d'Affaires:</strong> ${parseFloat(period.totalAmount || 0).toFixed(2)} €</div>
                    <div style="margin-top: 0.5rem;"><strong>Commissions:</strong> ${parseFloat(period.totalCommissions || 0).toFixed(2)} €</div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Employé</th>
                                <th>Montant</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody id="history-details-tbody">
                            <tr><td colspan="4" class="empty-state">Chargement...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const tbody = modal.querySelector('#history-details-tbody');
    if (tbody && period.sales) {
        tbody.innerHTML = '';
        for (const sale of period.sales) {
            const employee = await getEmployeeById(sale.employeeId);
            const employeeName = employee ? employee.name : 'Employé supprimé';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(sale.date)}</td>
                <td>${employeeName}</td>
                <td>${parseFloat(sale.amount || 0).toFixed(2)} €</td>
                <td>${sale.description || '-'}</td>
            `;
            tbody.appendChild(tr);
        }
    } else if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Aucune vente dans cette période</td></tr>';
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}


async function loadMenuConfig() {
    try {
        const configDoc = await db.collection('menuConfig').doc('display').get();
        const useImageModeCheckbox = document.getElementById('use-image-mode');
        const imageUrlInput = document.getElementById('menu-image-url');
        const imageUrlGroup = document.getElementById('image-url-group');
        
        if (configDoc.exists) {
            const config = configDoc.data();
            if (useImageModeCheckbox) {
                useImageModeCheckbox.checked = config.useImageMode || false;
            }
            if (imageUrlInput) {
                imageUrlInput.value = config.imageUrl || '';
            }
            if (imageUrlGroup) {
                imageUrlGroup.style.display = (config.useImageMode || false) ? 'block' : 'none';
            }
        } else {
            if (useImageModeCheckbox) {
                useImageModeCheckbox.checked = false;
            }
            if (imageUrlInput) {
                imageUrlInput.value = '';
            }
            if (imageUrlGroup) {
                imageUrlGroup.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration du menu:', error);
    }
}

async function saveMenuConfig() {
    if (!hasPermission('menu')) {
        alert('Vous n\'avez pas la permission de modifier la carte.');
        return;
    }
    
    const useImageModeCheckbox = document.getElementById('use-image-mode');
    const imageUrlInput = document.getElementById('menu-image-url');
    
    if (!useImageModeCheckbox || !imageUrlInput) {
        return;
    }
    
    const useImageMode = useImageModeCheckbox.checked;
    const imageUrl = imageUrlInput.value.trim();
    
    if (useImageMode && !imageUrl) {
        alert('Veuillez entrer une URL d\'image lorsque le mode image est activé.');
        return;
    }
    
    showLoading(true);
    
    try {
        const configData = {
            useImageMode,
            imageUrl: useImageMode ? imageUrl : null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('menuConfig').doc('display').set(configData, { merge: true });
        alert('Configuration enregistrée avec succès !');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
        alert('Erreur lors de la sauvegarde de la configuration.');
    } finally {
        showLoading(false);
    }
}

async function loadCategories() {
    if (!categoriesContainer) return;
    
    try {
        const categoriesSnapshot = await db.collection('menuCategories').orderBy('order', 'asc').get();
        categoriesContainer.innerHTML = '';
        
        if (categoriesSnapshot.empty) {
            categoriesContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-light); grid-column: 1 / -1;">Aucune catégorie. Créez-en une pour commencer !</p>';
        } else {
            categoriesSnapshot.forEach(doc => {
                const category = { id: doc.id, ...doc.data() };
                renderCategory(category);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
    }
}

function renderCategory(category) {
    const categoryCard = document.createElement('div');
    categoryCard.className = 'menu-item-card';
    categoryCard.innerHTML = `
        <div class="item-card-header">
            <div class="item-card-title">${category.name}</div>
        </div>
        <div class="item-card-description">Ordre: ${category.order || 0}</div>
        <div class="item-card-actions">
            <button class="btn btn-secondary btn-sm edit-category-btn" data-id="${category.id}">Modifier</button>
            <button class="btn btn-danger btn-sm delete-category-btn" data-id="${category.id}">Supprimer</button>
        </div>
    `;
    
    categoriesContainer.appendChild(categoryCard);
    
    categoryCard.querySelector('.edit-category-btn').addEventListener('click', () => editCategory(category));
    categoryCard.querySelector('.delete-category-btn').addEventListener('click', () => deleteCategory(category.id));
}

function openCategoryModal(category = null) {
    if (!hasPermission('menu')) {
        alert('Vous n\'avez pas la permission de modifier la carte.');
        return;
    }
    
    currentEditingCategoryId = category ? category.id : null;
    
    if (category) {
        categoryModalTitle.textContent = 'Modifier une Catégorie';
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-order').value = category.order || 0;
    } else {
        categoryModalTitle.textContent = 'Ajouter une Catégorie';
        categoryForm.reset();
        document.getElementById('category-order').value = 0;
    }
    
    categoryModal.classList.add('show');
}

function closeCategoryModal() {
    categoryModal.classList.remove('show');
    currentEditingCategoryId = null;
    categoryForm.reset();
}

async function saveCategory() {
    if (!hasPermission('menu')) {
        alert('Vous n\'avez pas la permission de modifier la carte.');
        return;
    }
    
    const name = document.getElementById('category-name').value.trim();
    const order = parseInt(document.getElementById('category-order').value) || 0;
    
    if (!name) {
        alert('Veuillez entrer un nom de catégorie.');
        return;
    }
    
    showLoading(true);
    
    try {
        const categoryData = {
            name,
            order,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentEditingCategoryId) {
            await db.collection('menuCategories').doc(currentEditingCategoryId).update(categoryData);
        } else {
            categoryData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('menuCategories').doc().set(categoryData);
        }
        
        closeCategoryModal();
        loadCategories();
        await populateCategorySelect();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde de la catégorie.');
    } finally {
        showLoading(false);
    }
}

function editCategory(category) {
    openCategoryModal(category);
}

async function deleteCategory(categoryId) {
    if (!hasPermission('menu')) {
        alert('Vous n\'avez pas la permission de modifier la carte.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Les plats associés ne seront pas supprimés mais perdront leur catégorie.')) {
        return;
    }
    
    showLoading(true);
    
    try {
        await db.collection('menuCategories').doc(categoryId).delete();
        loadCategories();
        await populateCategorySelect();
        loadMenuItems();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la catégorie.');
    } finally {
        showLoading(false);
    }
}

async function populateCategorySelect() {
    if (!itemCategorySelect) return;
    
    const currentValue = itemCategorySelect.value;
    itemCategorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
    
    try {
        const categoriesSnapshot = await db.collection('menuCategories').orderBy('order', 'asc').get();
        categoriesSnapshot.forEach(doc => {
            const category = doc.data();
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            itemCategorySelect.appendChild(option);
        });
        
        if (currentValue) {
            itemCategorySelect.value = currentValue;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
    }
}

const resetSalesBtn = document.getElementById('reset-sales-btn');
if (resetSalesBtn) resetSalesBtn.addEventListener('click', resetSales);

if (addSaleBtn) addSaleBtn.addEventListener('click', () => openSaleModal());
if (saleModalClose) saleModalClose.addEventListener('click', closeSaleModal);
if (cancelSaleBtn) cancelSaleBtn.addEventListener('click', closeSaleModal);
if (saleForm) saleForm.addEventListener('submit', (e) => { e.preventDefault(); saveSale(); });

if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
if (employeeModalClose) employeeModalClose.addEventListener('click', closeEmployeeModal);
if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', closeEmployeeModal);
if (employeeForm) employeeForm.addEventListener('submit', (e) => { e.preventDefault(); saveEmployee(); });

if (addRankBtn) addRankBtn.addEventListener('click', () => openRankModal());
if (rankModalClose) rankModalClose.addEventListener('click', closeRankModal);
if (cancelRankBtn) cancelRankBtn.addEventListener('click', closeRankModal);
if (rankForm) rankForm.addEventListener('submit', (e) => { e.preventDefault(); saveRank(); });

if (addAdminBtn) addAdminBtn.addEventListener('click', () => openAdminModal());
if (adminModalClose) adminModalClose.addEventListener('click', closeAdminModal);
if (cancelAdminBtn) cancelAdminBtn.addEventListener('click', closeAdminModal);
if (adminForm) adminForm.addEventListener('submit', (e) => { e.preventDefault(); saveAdmin(); });

if (addBonusBtn) addBonusBtn.addEventListener('click', () => openBonusModal());
if (bonusModalClose) bonusModalClose.addEventListener('click', closeBonusModal);
if (cancelBonusBtn) cancelBonusBtn.addEventListener('click', closeBonusModal);
if (bonusForm) bonusForm.addEventListener('submit', (e) => { e.preventDefault(); saveBonus(); });

if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => openCategoryModal());
if (addCategoryFromFormBtn) addCategoryFromFormBtn.addEventListener('click', () => {
    closeItemModal();
    openCategoryModal();
});
if (categoryModalClose) categoryModalClose.addEventListener('click', closeCategoryModal);
if (cancelCategoryBtn) cancelCategoryBtn.addEventListener('click', closeCategoryModal);
if (categoryForm) categoryForm.addEventListener('submit', (e) => { e.preventDefault(); saveCategory(); });

[saleModal, employeeModal, rankModal, adminModal, bonusModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal === saleModal) closeSaleModal();
                if (modal === employeeModal) closeEmployeeModal();
                if (modal === rankModal) closeRankModal();
                if (modal === adminModal) closeAdminModal();
                if (modal === bonusModal) closeBonusModal();
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.info-tooltip[data-tooltip*="|"]').forEach(tooltip => {
        const tooltipText = tooltip.getAttribute('data-tooltip');
        tooltip.setAttribute('data-tooltip', tooltipText.replace(/\|/g, '\n'));
    });
});
