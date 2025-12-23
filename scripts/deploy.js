import { execSync } from 'child_process'
import { existsSync, readFileSync, cpSync, rmSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 Déploiement sur GitHub Pages...\n')

// Vérifier que nous sommes dans un repo git
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ Erreur: Ce dossier n\'est pas un repository Git')
  console.error('   Initialisez Git avec: git init')
  process.exit(1)
}

// Vérifier qu'il y a des changements à committer
try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' })
  if (status.trim()) {
    console.log('⚠️  Vous avez des changements non commités.')
    console.log('   Le script va continuer, mais pensez à committer vos changements.\n')
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification du statut Git')
  process.exit(1)
}

// Build le projet
console.log('📦 Build du projet...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build terminé\n')
} catch (error) {
  console.error('❌ Erreur lors du build')
  process.exit(1)
}

// Vérifier que dist/ existe
if (!existsSync('dist')) {
  console.error('❌ Le dossier dist/ n\'existe pas. Le build a peut-être échoué.')
  process.exit(1)
}

// Obtenir la branche actuelle
let currentBranch = 'main'
try {
  currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim()
  if (!currentBranch) {
    currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
  }
} catch (error) {
  console.warn('⚠️  Impossible de détecter la branche actuelle, utilisation de "main"')
}

console.log(`📝 Branche actuelle: ${currentBranch}\n`)

// Créer une branche temporaire pour le déploiement
const deployBranch = 'gh-pages'
const tempBranch = 'temp-gh-pages-deploy'

console.log('🌿 Préparation de la branche de déploiement...')

try {
  // Sauvegarder l'état actuel
  const hasUncommitted = execSync('git status --porcelain', { encoding: 'utf-8' }).trim()
  
  // Créer ou récupérer la branche gh-pages
  try {
    execSync(`git checkout ${deployBranch}`, { stdio: 'ignore' })
    console.log(`✅ Branche ${deployBranch} trouvée`)
  } catch (error) {
    // Créer la branche depuis main/master
    try {
      execSync(`git checkout -b ${deployBranch}`, { stdio: 'ignore' })
      console.log(`✅ Branche ${deployBranch} créée`)
    } catch (e) {
      console.error('❌ Impossible de créer la branche gh-pages')
      process.exit(1)
    }
  }
  
  // Copier les fichiers de dist/ sans supprimer les fichiers existants
  console.log('📋 Copie des fichiers de dist/ (préservation des fichiers existants)...')
  const distPath = join(process.cwd(), 'dist')
  const currentPath = process.cwd()

  // Utiliser cpSync pour copier récursivement (Node.js 16+)
  try {
    // Copier tous les fichiers de dist vers le répertoire actuel
    cpSync(distPath, currentPath, {
      recursive: true,
      filter: (src) => !src.includes('.git')
    })
  } catch (error) {
    // Fallback pour Windows
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      execSync(`xcopy /E /I /Y /Q dist\\* .`, { stdio: 'ignore', shell: true })
    } else {
      execSync('cp -r dist/* .', { stdio: 'ignore', shell: true })
      execSync('cp -r dist/.* . 2>/dev/null || true', { stdio: 'ignore', shell: true })
    }
  }
  
  // Ajouter tous les fichiers
  execSync('git add -A', { stdio: 'ignore' })
  
  // Commit
  const commitMessage = `Deploy: ${new Date().toISOString()}`
  try {
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'ignore' })
    console.log('✅ Changements commités\n')
  } catch (error) {
    // Pas de changements à committer
    console.log('ℹ️  Aucun changement à committer\n')
  }
  
  // Push vers GitHub
  console.log('⬆️  Push vers GitHub...')
  try {
    execSync(`git push origin ${deployBranch} --force`, { stdio: 'inherit' })
    console.log('✅ Push réussi\n')
  } catch (error) {
    console.error('❌ Erreur lors du push')
    console.error('   Vérifiez votre connexion et vos permissions Git')
    process.exit(1)
  }
  
  // Revenir à la branche originale
  console.log(`🔄 Retour à la branche ${currentBranch}...`)
  execSync(`git checkout ${currentBranch}`, { stdio: 'ignore' })
  console.log(`✅ Retour à ${currentBranch}\n`)
  
} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message)
  // Essayer de revenir à la branche originale
  try {
    execSync(`git checkout ${currentBranch}`, { stdio: 'ignore' })
  } catch (e) {
    console.error('⚠️  Impossible de revenir à la branche originale')
  }
  process.exit(1)
}

console.log('✨ Déploiement terminé avec succès!')
console.log(`\n📌 Votre site sera disponible sur GitHub Pages dans quelques minutes.`)
console.log(`   Configurez GitHub Pages pour utiliser la branche "${deployBranch}" dans Settings > Pages`)

