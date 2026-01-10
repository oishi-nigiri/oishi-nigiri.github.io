import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration Firebase
const serviceAccount = {
  type: "service_account",
  project_id: "oishi-nigiri",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
}

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const db = admin.firestore()

// Fonction pour convertir les timestamps du backup
function convertTimestamp(timestampObj) {
  if (!timestampObj || !timestampObj.seconds) return null
  return new admin.firestore.Timestamp(timestampObj.seconds, timestampObj.nanoseconds || 0)
}

// Fonction pour importer une collection
async function importCollection(collectionName, data) {
  console.log(`\n📁 Importation de la collection '${collectionName}' (${data.length} documents)...`)

  const batch = db.batch()
  let batchCount = 0
  const BATCH_SIZE = 500 // Firestore limite à 500 opérations par batch

  for (let i = 0; i < data.length; i++) {
    const item = data[i]

    // Convertir les timestamps
    if (item.createdAt) {
      item.createdAt = convertTimestamp(item.createdAt)
    }
    if (item.updatedAt) {
      item.updatedAt = convertTimestamp(item.updatedAt)
    }
    if (item.date) {
      item.date = convertTimestamp(item.date)
    }

    // Gérer les sous-collections pour salesHistory
    if (collectionName === 'salesHistory') {
      const docRef = db.collection(collectionName).doc()
      batch.set(docRef, item)

      // Importer la sous-collection 'sales' si elle existe
      if (item.sales && Array.isArray(item.sales)) {
        for (const sale of item.sales) {
          const saleRef = docRef.collection('sales').doc()
          if (sale.createdAt) {
            sale.createdAt = convertTimestamp(sale.createdAt)
          }
          if (sale.updatedAt) {
            sale.updatedAt = convertTimestamp(sale.updatedAt)
          }
          batch.set(saleRef, sale)
        }
      }
    } else {
      const docRef = db.collection(collectionName).doc()
      batch.set(docRef, item)
    }

    batchCount++

    // Commit le batch tous les BATCH_SIZE documents
    if (batchCount >= BATCH_SIZE || i === data.length - 1) {
      try {
        await batch.commit()
        console.log(`  ✅ Batch ${Math.ceil((i + 1) / BATCH_SIZE)} commité (${batchCount} documents)`)
        batchCount = 0
        // Nouveau batch
        if (i < data.length - 1) {
          // On continue
        }
      } catch (error) {
        console.error(`  ❌ Erreur lors du commit du batch:`, error)
        throw error
      }
    }
  }

  console.log(`✅ Collection '${collectionName}' importée avec succès (${data.length} documents)`)
}

// Fonction principale
async function importBackup() {
  try {
    console.log('🚀 Début de l\'importation du backup...\n')

    // Lire le fichier backup
    const backupPath = path.join(__dirname, '..', 'backup-2026-01-10.json')
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

    console.log('📊 Collections trouvées dans le backup:')
    Object.keys(backupData).forEach(collection => {
      console.log(`  - ${collection}: ${backupData[collection].length} documents`)
    })

    // Importer chaque collection
    const collections = Object.keys(backupData)

    for (const collectionName of collections) {
      const data = backupData[collectionName]
      await importCollection(collectionName, data)
    }

    console.log('\n🎉 Importation terminée avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error)
    process.exit(1)
  }
}

// Vérifier les variables d'environnement
const requiredEnvVars = [
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_X509_CERT_URL'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes pour Firebase Admin:')
  missingVars.forEach(varName => console.error(`  - ${varName}`))
  console.log('\n📝 Vous devez configurer ces variables d\'environnement.')
  console.log('   Vous pouvez les trouver dans la console Firebase > Paramètres du projet > Comptes de service')
  process.exit(1)
}

// Lancer l'importation
importBackup()