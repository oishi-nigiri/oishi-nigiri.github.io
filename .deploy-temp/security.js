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

(function() {
    'use strict';
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
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
    
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
            }
        } else {
            if (devtools.open) {
                devtools.open = false;
            }
        }
    }, 500);
    
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
})();

