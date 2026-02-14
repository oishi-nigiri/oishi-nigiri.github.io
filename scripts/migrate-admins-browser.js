/**
 * Script de migration pour remplacer discordId par email dans les documents admins
 * À coller dans la console du navigateur sur votre site
 */

// Mapping Discord ID -> Email (à modifier avec les vrais emails)
const DISCORD_TO_EMAIL = {
  "317665879443767306": "zyrexiw.dev@gmail.com", // Remplacez par l'email réel
  // Ajoutez tous vos admins ici
  // "DISCORD_ID": "email@example.com",
};

async function migrateAdmins() {
  try {
    console.log("🚀 Début de la migration des administrateurs...");

    // Initialize Firebase if not already done
    if (!window.firebaseApp) {
      const { initializeApp } = await import(
        "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
      );
      const { getFirestore } = await import(
        "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"
      );

      const firebaseConfig = {
        apiKey: "AIzaSyBilKLe_JmQREulXmtZK5dBxNdTTzFhX3w",
        authDomain: "oishinigiri-app.firebaseapp.com",
        projectId: "oishinigiri-app",
        storageBucket: "oishinigiri-app.firebasestorage.app",
        messagingSenderId: "120740998032",
        appId: "1:120740998032:web:c500851136eb47b29ca115",
      };

      window.firebaseApp = initializeApp(firebaseConfig);
      window.firebaseDb = getFirestore(window.firebaseApp);
    }

    const db = window.firebaseDb;
    const { collection, getDocs, doc, setDoc, deleteDoc } = await import(
      "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"
    );

    const adminsRef = collection(db, "admins");
    const snapshot = await getDocs(adminsRef);

    if (snapshot.empty) {
      console.log("❌ Aucune collection admins trouvée");
      return;
    }

    console.log(`📋 Trouvé ${snapshot.size} documents administrateur`);

    for (const document of snapshot.docs) {
      const docId = document.id;
      const data = document.data();

      console.log(`\n🔄 Migration du document: ${docId}`);
      console.log("Données actuelles:", data);

      // Récupérer le Discord ID (discordId ou id)
      const discordId = data.discordId || data.id;

      if (!discordId) {
        console.log("❌ Aucun Discord ID trouvé dans ce document");
        continue;
      }

      // Trouver l'email correspondant
      const email = DISCORD_TO_EMAIL[discordId];

      if (!email) {
        console.log(`❌ Aucun email trouvé pour le Discord ID: ${discordId}`);
        console.log("Ajoutez cette entrée dans DISCORD_TO_EMAIL");
        continue;
      }

      // Créer un nouveau document avec l'email comme ID
      const newDocRef = doc(db, "admins", email);

      // Copier toutes les données, remplacer discordId par email comme ID
      const newData = {
        ...data,
        email: email, // Garder l'email comme champ aussi
        discordId: discordId, // Garder l'ancien Discord ID pour référence
        migratedAt: new Date().toISOString(),
      };

      // Supprimer l'ancien champ id s'il existe
      delete newData.id;

      await setDoc(newDocRef, newData);
      console.log(`✅ Nouveau document créé avec l'email: ${email}`);

      // Supprimer l'ancien document
      await deleteDoc(doc(db, "admins", docId));
      console.log(`🗑️ Ancien document supprimé: ${docId}`);

      console.log(`🎉 Migration réussie pour ${docId} -> ${email}`);
    }

    console.log("\n🎊 Migration terminée !");
    console.log(
      "Les documents utilisent maintenant l'email comme ID au lieu du Discord ID."
    );
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    console.error("Détails:", error.message);
  }
}

async function listCurrentAdmins() {
  try {
    console.log("📋 Liste des administrateurs actuels:");

    // Initialize Firebase if not already done
    if (!window.firebaseApp) {
      const { initializeApp } = await import(
        "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
      );
      const { getFirestore } = await import(
        "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"
      );

      const firebaseConfig = {
        apiKey: "AIzaSyBilKLe_JmQREulXmtZK5dBxNdTTzFhX3w",
        authDomain: "oishinigiri-app.firebaseapp.com",
        projectId: "oishinigiri-app",
        storageBucket: "oishinigiri-app.firebasestorage.app",
        messagingSenderId: "120740998032",
        appId: "1:120740998032:web:c500851136eb47b29ca115",
      };

      window.firebaseApp = initializeApp(firebaseConfig);
      window.firebaseDb = getFirestore(window.firebaseApp);
    }

    const db = window.firebaseDb;
    const { collection, getDocs } = await import(
      "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"
    );

    const adminsRef = collection(db, "admins");
    const snapshot = await getDocs(adminsRef);

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\nID Document: ${doc.id}`);
      console.log(`Username: ${data.username || "N/A"}`);
      console.log(`Discord ID: ${data.discordId || data.id || "N/A"}`);
      console.log(`Email: ${data.email || "N/A"}`);
      console.log(`Is Admin: ${data.isAdmin}`);
      console.log(`Permissions:`, data.permissions);
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération:", error);
  }
}

// Fonctions disponibles dans la console
window.migrateAdmins = migrateAdmins;
window.listCurrentAdmins = listCurrentAdmins;

console.log("🔧 Fonctions de migration disponibles:");
console.log("- listCurrentAdmins() : Lister les admins actuels");
console.log("- migrateAdmins() : Remplacer discordId par email");
