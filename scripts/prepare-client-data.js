import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔄 Préparation des données pour le client...\n')

// Lire le fichier backup
const backupPath = path.join(__dirname, '..', 'backup-2026-01-10.json')
const clientDataPath = path.join(__dirname, '..', 'public', 'backup-data.json')

let backupData
try {
  backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
  console.log('✅ Backup chargé')
} catch (error) {
  console.error('❌ Erreur lors du chargement du backup:', error.message)
  process.exit(1)
}

// Fonction pour convertir les timestamps du backup en objets Timestamp pour le client
function convertTimestampForClient(timestampObj) {
  if (!timestampObj || !timestampObj.seconds) return null
  return {
    seconds: timestampObj.seconds,
    nanoseconds: timestampObj.nanoseconds || 0
  }
}

// Transformer les données pour le client
const clientData = {
  version: '1.0',
  createdAt: new Date().toISOString(),
  collections: {}
}

console.log('📋 Transformation des données...')

for (const [collectionName, documents] of Object.entries(backupData)) {
  console.log(`  - Traitement de ${collectionName} (${documents.length} documents)`)

  clientData.collections[collectionName] = documents.map(doc => {
    const transformedDoc = { ...doc }

    // Convertir les timestamps
    if (transformedDoc.createdAt) {
      transformedDoc.createdAt = convertTimestampForClient(transformedDoc.createdAt)
    }
    if (transformedDoc.updatedAt) {
      transformedDoc.updatedAt = convertTimestampForClient(transformedDoc.updatedAt)
    }
    if (transformedDoc.date) {
      transformedDoc.date = convertTimestampForClient(transformedDoc.date)
    }

    // Pour salesHistory, traiter les sous-documents sales
    if (collectionName === 'salesHistory' && transformedDoc.sales && Array.isArray(transformedDoc.sales)) {
      transformedDoc.sales = transformedDoc.sales.map(sale => {
        if (sale.createdAt) {
          sale.createdAt = convertTimestampForClient(sale.createdAt)
        }
        if (sale.updatedAt) {
          sale.updatedAt = convertTimestampForClient(sale.updatedAt)
        }
        return sale
      })
    }

    return transformedDoc
  })
}

// Statistiques
console.log('\n📊 Statistiques des données client :')
let totalDocs = 0
for (const [collectionName, documents] of Object.entries(clientData.collections)) {
  console.log(`  - ${collectionName}: ${documents.length} documents`)
  totalDocs += documents.length
}
console.log(`  Total: ${totalDocs} documents`)

// Écrire le fichier pour le client
try {
  fs.writeFileSync(clientDataPath, JSON.stringify(clientData, null, 2))
  console.log(`\n✅ Fichier client créé: ${clientDataPath}`)
} catch (error) {
  console.error('❌ Erreur lors de l\'écriture du fichier client:', error.message)
  process.exit(1)
}

console.log('\n🎉 Préparation terminée !')
console.log('💡 Vous pouvez maintenant utiliser l\'interface admin pour importer ces données.')