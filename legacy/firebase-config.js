const firebaseConfig = {
    apiKey: "AIzaSyA__e798LgpiDfoBZXE7mynRxAajhQZT8o",
    authDomain: "oishi-nigiri.firebaseapp.com",
    projectId: "oishi-nigiri",
    storageBucket: "oishi-nigiri.firebasestorage.app",
    messagingSenderId: "235045203402",
    appId: "1:235045203402:web:442b84e7b4720f33d1f333"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


const db = firebase.firestore();


const ADMIN_IDS = [
    "317665879443767306" 
];


async function isAdmin(discordUserId) {
    const adminDoc = await db.collection('admins').doc(discordUserId).get();
    if (adminDoc.exists) {
        return adminDoc.data().isAdmin === true;
    }

    return ADMIN_IDS.includes(discordUserId);
}


function getDiscordTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}


async function exchangeDiscordCode(code) {
    try {
        const response = await fetch('/api/discord-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.access_token;
        }
    } catch (error) {
        console.error('Erreur lors de l\'échange du code Discord:', error);
    }
    return null;
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

