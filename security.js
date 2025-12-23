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

// Protection de sécurité - Désactivée en développement pour faciliter le débogage
(function() {
    'use strict';

    // Permettre le débogage en développement (localhost)
    const isDevelopment = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('github.dev') ||
                         window.location.hostname.includes('vscode.dev');

    if (isDevelopment) {
        console.log('🔧 Mode développement détecté - Protections de sécurité désactivées pour faciliter le débogage');
        return;
    }

    // Protections activées seulement en production
    console.log('🔒 Protections de sécurité activées');

    // Désactiver le clic droit
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, false);

    // Désactiver certains raccourcis clavier (mais pas F12 pour permettre le débogage d'urgence)
    document.addEventListener('keydown', function(e) {
        // Garder F12 disponible pour le débogage d'urgence
        // if (e.keyCode === 123) {
        //     e.preventDefault();
        //     return false;
        // }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
    }, false);

    // Désactiver le drag & drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    }, false);

})();

