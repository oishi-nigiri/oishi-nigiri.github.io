const firebaseConfig = {
    apiKey: "AIzaSyAXKz92oCBiOusUfyVfPMU1_1ALT7Xl5y8",
    authDomain: "depannage-3j-42a27.firebaseapp.com",
    projectId: "depannage-3j-42a27",
    storageBucket: "depannage-3j-42a27.firebasestorage.app",
    messagingSenderId: "512983254056",
    appId: "1:512983254056:web:0abeff1b009a4bc375a11d"
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

