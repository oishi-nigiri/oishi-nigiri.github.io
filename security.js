function escapeHtml(str) {
    if (typeof str !== 'string') {
        return String(str);
    }
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function sanitizeUrl(url) {
    if (typeof url !== 'string' || !url) {
        return null;
    }
    
    if (!/^https?:\/\//i.test(url)) {
        return null;
    }
    
    if (/^(javascript|data|vbscript):/i.test(url)) {
        return null;
    }
    
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('discordapp.com') || 
            urlObj.hostname.includes('discord.com') ||
            urlObj.hostname.includes('cdn.discordapp.com')) {
            return url;
        }
        return url;
    } catch (e) {
        return null;
    }
}

function validateDiscordUser(user) {
    if (!user || typeof user !== 'object') {
        return null;
    }
    
    if (!user.id || typeof user.id !== 'string') {
        return null;
    }
    
    if (!/^\d{17,19}$/.test(user.id)) {
        return null;
    }
    
    const safeUser = {
        id: user.id,
        username: escapeHtml(user.username || ''),
        discriminator: user.discordinator || '0',
        avatar: user.avatar || null,
        global_name: user.global_name ? escapeHtml(user.global_name) : null
    };
    
    return safeUser;
}

function validateDiscordToken(token) {
    if (typeof token !== 'string' || !token) {
        return false;
    }
    
    if (token.length < 30 || token.length > 200) {
        return false;
    }
    
    if (/[<>\"']/.test(token)) {
        return false;
    }
    
    return true;
}

// Protection de sécurité - Désactivée
(function() {
    'use strict';

    // Protections désactivées pour permettre l'inspection des éléments
    console.log('🔓 Protections de sécurité désactivées - Inspection des éléments autorisée');

    // Les protections suivantes ont été supprimées :
    // - Désactivation du clic droit
    // - Désactivation des raccourcis clavier (F12, Ctrl+Shift+I, etc.)
    // - Désactivation du drag & drop
    // - Détection d'ouverture des DevTools

})();

