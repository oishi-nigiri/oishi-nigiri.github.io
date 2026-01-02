function getRedirectUri() {
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    
    if (hostname.includes('github.io')) {
        const parts = hostname.split('.');
        if (parts.length === 3 && parts[0] !== 'www') {
            return `${origin}/discord-callback.html`;
        }
        
        const pathname = window.location.pathname;
        const pathParts = pathname.split('/').filter(p => p && !p.includes('.'));
        const repoName = pathParts[0] || '';
        const baseUrl = repoName ? `${origin}/${repoName}` : origin;
        return `${baseUrl}/discord-callback.html`;
    }
    
    return `${origin}/discord-callback.html`;
}

if (!window.DISCORD_CONFIG) {
    window.DISCORD_CONFIG = {
        clientId: '410510806153822208',
        redirectUri: getRedirectUri(),
        scope: 'identify',
        adminManagerIds: [
            '317665879443767306'
        ]
    };
}

const DISCORD_CONFIG = window.DISCORD_CONFIG;
const DISCORD_API = 'https://discord.com/api/v10';

