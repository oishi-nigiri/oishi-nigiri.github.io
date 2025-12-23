class DiscordAuth {
    constructor() {
        this.tokenKey = 'discord_token';
        this.userKey = 'discord_user';
    }
    
    getLoginUrl() {
        if (typeof DISCORD_CONFIG === 'undefined') {
            console.error('DISCORD_CONFIG n\'est pas défini');
            return '#';
        }
        const params = new URLSearchParams({
            client_id: DISCORD_CONFIG.clientId,
            redirect_uri: DISCORD_CONFIG.redirectUri,
            response_type: 'token',
            scope: DISCORD_CONFIG.scope
        });
        return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    }
    
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }
    
    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }
    
    isLoggedIn() {
        return this.getToken() !== null && this.getUser() !== null;
    }
    
    async isAuthorized() {
        const user = this.getUser();
        if (!user) return false;
        
        const userId = String(user.id);
        
        if (DISCORD_CONFIG.adminManagerIds && DISCORD_CONFIG.adminManagerIds.includes(userId)) {
            return true;
        }
        
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const doc = await db.collection('admins').doc(userId).get();
                if (doc.exists) {
                    const data = doc.data();
                    return data.isAdmin === true;
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification Firestore:', error);
        }
        
        return false;
    }
    
    isAuthorizedSync() {
        const user = this.getUser();
        if (!user) return false;
        
        return DISCORD_CONFIG.adminManagerIds && DISCORD_CONFIG.adminManagerIds.includes(user.id);
    }
    
    getAvatarUrl(user) {
        if (!user || !user.id) {
            return 'https://cdn.discordapp.com/embed/avatars/0.png';
        }
        
        const userId = String(user.id);
        if (!/^\d{17,19}$/.test(userId)) {
            return 'https://cdn.discordapp.com/embed/avatars/0.png';
        }
        
        if (user.avatar && typeof user.avatar === 'string') {
            if (!/^[a-zA-Z0-9_-]+$/.test(user.avatar)) {
                return `https://cdn.discordapp.com/embed/avatars/${(parseInt(userId) >> 22) % 6}.png`;
            }
            return `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png`;
        }
        return `https://cdn.discordapp.com/embed/avatars/${(parseInt(userId) >> 22) % 6}.png`;
    }
    
    getUsername(user) {
        if (user.discriminator && user.discriminator !== '0') {
            return `${user.username}#${user.discriminator}`;
        }
        return user.global_name || user.username;
    }
    
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        window.location.reload();
    }
}

const discordAuth = new DiscordAuth();

async function updateAuthUI() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    
    if (discordAuth.isLoggedIn()) {
        const user = discordAuth.getUser();
        if (!user) {
            authContainer.innerHTML = '';
            return;
        }
        
        const isAdmin = await discordAuth.isAuthorized();
        
        const safeUsername = escapeHtml(discordAuth.getUsername(user));
        const avatarUrl = discordAuth.getAvatarUrl(user);
        const safeAvatarUrl = sanitizeUrl(avatarUrl) || 'https://cdn.discordapp.com/embed/avatars/0.png';
        
        authContainer.innerHTML = '';
        const userProfile = document.createElement('div');
        userProfile.className = 'user-profile';
        
        const avatarImg = document.createElement('img');
        avatarImg.src = safeAvatarUrl;
        avatarImg.alt = 'Avatar';
        avatarImg.className = 'user-avatar-small';
        userProfile.appendChild(avatarImg);
        
        const userNameSpan = document.createElement('span');
        userNameSpan.className = 'user-name';
        userNameSpan.textContent = safeUsername;
        userProfile.appendChild(userNameSpan);
        
        if (isAdmin) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'admin-btn';
            adminLink.textContent = 'Admin';
            userProfile.appendChild(adminLink);
        }
        
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn-small';
        logoutBtn.textContent = 'Déconnexion';
        logoutBtn.addEventListener('click', () => discordAuth.logout());
        userProfile.appendChild(logoutBtn);
        
        authContainer.appendChild(userProfile);
    } else {
        authContainer.innerHTML = `
            <button class="discord-login-btn-small" onclick="loginWithDiscord()">
                <svg width="16" height="16" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 49.9718 48.5383C51.038 50.6034 52.2584 52.5699 53.5959 54.435C53.6519 54.5139 53.7526 54.5477 53.845 54.5195C59.6464 52.7249 65.529 50.0174 71.6019 45.5576C71.6551 45.5182 71.6887 45.459 71.6943 45.3942C73.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
                </svg>
                Se connecter
            </button>
        `;
    }
}

function loginWithDiscord() {
    window.location.href = discordAuth.getLoginUrl();
}

document.addEventListener('DOMContentLoaded', () => {
    const checkConfig = setInterval(() => {
        if (typeof DISCORD_CONFIG !== 'undefined') {
            clearInterval(checkConfig);
            setTimeout(() => {
                updateAuthUI();
            }, 500);
        }
    }, 100);
    
    setTimeout(() => {
        clearInterval(checkConfig);
        if (typeof DISCORD_CONFIG !== 'undefined') {
            setTimeout(() => {
                updateAuthUI();
            }, 500);
        }
    }, 2000);
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && typeof DISCORD_CONFIG !== 'undefined') {
        updateAuthUI();
    }
});

