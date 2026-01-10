import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Validation du fichier backup...\n')

// Lire le fichier backup
const backupPath = path.join(__dirname, '..', 'backup-2026-01-10.json')
let backupData

try {
  backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
  console.log('✅ Fichier backup valide (JSON parsé avec succès)')
} catch (error) {
  console.error('❌ Erreur de parsing JSON:', error.message)
  process.exit(1)
}

// Fonction pour valider une collection
function validateCollection(name, data) {
  console.log(`\n📁 Validation de la collection '${name}':`)

  if (!Array.isArray(data)) {
    console.error(`  ❌ '${name}' n'est pas un tableau`)
    return false
  }

  console.log(`  ✅ ${data.length} documents trouvés`)

  // Validation spécifique par collection
  let isValid = true
  let warnings = 0

  switch (name) {
    case 'admins':
      data.forEach((admin, index) => {
        const requiredFields = ['id', 'isAdmin']
        const missing = requiredFields.filter(field => admin[field] === undefined)
        if (missing.length > 0) {
          console.error(`  ❌ Admin ${index + 1}: champs requis manquants: ${missing.join(', ')}`)
          isValid = false
        }
        // Vérifier que permissions existe
        if (!admin.permissions) {
          console.log(`  ⚠️ Admin ${index + 1}: pas de permissions définies`)
          warnings++
        }
      })
      break

    case 'employees':
      data.forEach((employee, index) => {
        const requiredFields = ['id', 'name']
        const missing = requiredFields.filter(field => !employee[field])
        if (missing.length > 0) {
          console.error(`  ❌ Employé ${index + 1}: champs requis manquants: ${missing.join(', ')}`)
          isValid = false
        }
      })
      break

    case 'ranks':
      data.forEach((rank, index) => {
        const requiredFields = ['id', 'name']
        const missing = requiredFields.filter(field => !rank[field])
        if (missing.length > 0) {
          console.error(`  ❌ Rang ${index + 1}: champs requis manquants: ${missing.join(', ')}`)
          isValid = false
        }
      })
      break

    case 'sales':
      data.forEach((sale, index) => {
        const requiredFields = ['id']
        const missing = requiredFields.filter(field => !sale[field])
        if (missing.length > 0) {
          console.error(`  ❌ Vente ${index + 1}: champs requis manquants: ${missing.join(', ')}`)
          isValid = false
        }
        // Vérifier qu'il y a soit amount soit total
        if (!sale.amount && !sale.total) {
          console.log(`  ⚠️ Vente ${index + 1}: ni 'amount' ni 'total' défini`)
          warnings++
        }
      })
      break

    case 'salesHistory':
      data.forEach((sale, index) => {
        const requiredFields = ['id']
        const missing = requiredFields.filter(field => !sale[field])
        if (missing.length > 0) {
          console.error(`  ❌ Historique vente ${index + 1}: champs requis manquants: ${missing.join(', ')}`)
          isValid = false
        }
      })
      break
  }

  if (isValid) {
    console.log(`  ✅ Structure de données valide`)
    if (warnings > 0) {
      console.log(`  ⚠️ ${warnings} avertissements`)
    }
  }

  return isValid
}

// Validation de la structure générale
console.log('\n📊 Analyse de la structure du backup:')
console.log(`  Collections trouvées: ${Object.keys(backupData).length}`)

const collections = Object.keys(backupData)
let totalDocuments = 0
let allValid = true

collections.forEach(collection => {
  const data = backupData[collection]
  totalDocuments += data.length

  const isValid = validateCollection(collection, data)
  if (!isValid) {
    allValid = false
  }
})

console.log(`\n📈 Statistiques:`)
console.log(`  - Collections: ${collections.length}`)
console.log(`  - Documents totaux: ${totalDocuments}`)
console.log(`  - Documents par collection:`)

collections.forEach(collection => {
  const count = backupData[collection].length
  console.log(`    • ${collection}: ${count} documents`)
})

// Validation des timestamps
console.log(`\n⏰ Validation des timestamps:`)
let timestampIssues = 0

collections.forEach(collection => {
  backupData[collection].forEach((doc, docIndex) => {
    const checkTimestamp = (field, value) => {
      if (value && (typeof value !== 'object' || !value.seconds)) {
        console.error(`  ❌ ${collection}[${docIndex}].${field}: format timestamp invalide`)
        timestampIssues++
      }
    }

    checkTimestamp('createdAt', doc.createdAt)
    checkTimestamp('updatedAt', doc.updatedAt)
    checkTimestamp('date', doc.date)
  })
})

if (timestampIssues === 0) {
  console.log(`  ✅ Tous les timestamps sont au bon format`)
} else {
  console.log(`  ❌ ${timestampIssues} problèmes de timestamp détectés`)
  allValid = false
}

// Résultat final
console.log(`\n${allValid ? '🎉' : '⚠️'} Validation ${allValid ? 'réussie' : 'échouée'}`)

if (allValid) {
  console.log(`\n🚀 Le fichier backup est prêt pour l'importation !`)
  console.log(`   Exécutez 'npm run import-backup' pour importer les données.`)
  console.log(`   (N'oubliez pas de configurer les variables d'environnement Firebase)`)
} else {
  console.log(`\n❌ Corrigez les erreurs avant d'importer les données.`)
  process.exit(1)
}