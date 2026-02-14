/**
 * Script de migration des administrateurs Discord vers Firebase
 * Remplace les IDs Discord par les emails dans la collection admins
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBilKLe_JmQREulXmtZK5dBxNdTTzFhX3w",
  authDomain: "oishinigiri-app.firebaseapp.com",
  projectId: "oishinigiri-app",
  storageBucket: "oishinigiri-app.firebasestorage.app",
  messagingSenderId: "120740998032",
  appId: "1:120740998032:web:c500851136eb47b29ca115",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mapping Discord ID -> Email (à remplir manuellement)
const DISCORD_TO_EMAIL = {
  "317665879443767306": "zyrexiw.dev@gmail.com", // Remplacez par l'email réel
  // Ajoutez ici tous les mappings Discord ID -> Email
  // "DISCORD_ID": "email@example.com",
};

async function migrateAdmins() {
  try {
    console.log("🚀 Début de la migration des administrateurs...");

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

      // Vérifier si c'est déjà un email (contient @)
      if (docId.includes("@")) {
        console.log("✅ Ce document utilise déjà un email comme ID, ignoré");
        continue;
      }

      // Trouver l'email correspondant
      const email = DISCORD_TO_EMAIL[docId];

      if (!email) {
        console.log(`❌ Aucun email trouvé pour le Discord ID: ${docId}`);
        console.log("Veuillez ajouter cette entrée dans DISCORD_TO_EMAIL");
        continue;
      }

      // Créer le nouveau document avec l'email comme ID
      const newDocRef = doc(db, "admins", email);

      // Copier toutes les données existantes
      const newData = {
        ...data,
        migratedFromDiscord: true,
        originalDiscordId: docId,
        migratedAt: new Date().toISOString(),
      };

      await setDoc(newDocRef, newData);
      console.log(`✅ Nouveau document créé avec l'email: ${email}`);

      // Supprimer l'ancien document
      await deleteDoc(doc(db, "admins", docId));
      console.log(`🗑️ Ancien document supprimé: ${docId}`);

      console.log(`🎉 Migration réussie pour ${docId} -> ${email}`);
    }

    console.log("\n🎊 Migration terminée !");
    console.log(
      "Vérifiez que tous les administrateurs peuvent se connecter avec leur email."
    );
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
  }
}

// Fonction pour lister tous les admins actuels
async function listCurrentAdmins() {
  try {
    console.log("📋 Liste des administrateurs actuels:");

    const adminsRef = collection(db, "admins");
    const snapshot = await getDocs(adminsRef);

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\nID: ${doc.id}`);
      console.log(`Username: ${data.username || "N/A"}`);
      console.log(`Discord ID: ${data.discordId || data.id || "N/A"}`);
      console.log(`Is Admin: ${data.isAdmin}`);
      console.log(`Permissions:`, data.permissions);
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des admins:", error);
  }
}

// Exécuter la migration
if (process.argv[2] === "--migrate") {
  migrateAdmins();
} else if (process.argv[2] === "--list") {
  listCurrentAdmins();
} else {
  console.log("Usage:");
  console.log(
    "  node migrate-admins.js --list     # Lister les admins actuels"
  );
  console.log("  node migrate-admins.js --migrate  # Migrer vers les emails");
  console.log(
    "\nAvant la migration, remplissez le mapping DISCORD_TO_EMAIL avec les vrais emails."
  );
}
