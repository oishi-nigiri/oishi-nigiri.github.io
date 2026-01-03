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

// Protection de sécurité - Activée
(function() {
    'use strict';

    console.log('🔒 Protections de sécurité activées - Inspection des éléments bloquée');

    // Désactivation du clic droit
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Désactivation des raccourcis clavier (F12, Ctrl+Shift+I, Ctrl+U, etc.)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U') ||
            (e.ctrlKey && e.shiftKey && e.key === 'K')) {
            e.preventDefault();
            alert('Inspection des éléments désactivée');
        }
    });

    // Désactivation du drag & drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    // Détection basique d'ouverture des DevTools (non fiable à 100%)
    let devtoolsOpen = false;
    const threshold = 160;
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                alert('DevTools détectés ! Fermez-les pour continuer.');
            }
        } else {
            devtoolsOpen = false;
        }
    }, 500);

})();

