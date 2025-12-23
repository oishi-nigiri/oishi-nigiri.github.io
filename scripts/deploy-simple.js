import { execSync } from 'child_process'
import { existsSync } from 'fs'

console.log('🚀 Déploiement sur GitHub Pages...\n')

// Vérifier que nous sommes dans un repo git
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ Erreur: Ce dossier n\'est pas un repository Git')
  console.error('   Initialisez Git avec: git init')
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
  console.error('❌ Le dossier dist/ n\'existe pas.')
  process.exit(1)
}

// Utiliser gh-pages pour déployer (ne modifie pas les fichiers locaux)
console.log('📦 Vérification de gh-pages...')
try {
  // Vérifier si gh-pages est installé
  execSync('npm list gh-pages', { stdio: 'ignore' })
} catch (error) {
  console.log('📥 Installation de gh-pages...')
  try {
    execSync('npm install --save-dev gh-pages', { stdio: 'inherit' })
  } catch (e) {
    console.error('❌ Impossible d\'installer gh-pages')
    process.exit(1)
  }
}

console.log('⬆️  Déploiement sur GitHub Pages...')
console.log('   (Les fichiers locaux ne seront pas modifiés)\n')

try {
  // Utiliser gh-pages pour déployer
  // -d dist : déploie le dossier dist/
  // -b gh-pages : utilise la branche gh-pages
  execSync('npx gh-pages -d dist -b gh-pages', { stdio: 'inherit' })
  
  console.log('\n✅ Déploiement terminé avec succès!')
  console.log('\n📌 Prochaines étapes:')
  console.log('   1. Allez dans Settings > Pages de votre repo GitHub')
  console.log('   2. Sélectionnez la branche "gh-pages" comme source')
  console.log('   3. Votre site sera disponible dans quelques minutes')
  console.log(`\n   URL: https://votre-username.github.io/nom-du-repo/`)
  
} catch (error) {
  console.error('\n❌ Erreur lors du déploiement')
  console.error('   Vérifiez:')
  console.error('   - Votre connexion internet')
  console.error('   - Vos permissions Git (git remote -v)')
  console.error('   - Que vous avez bien commité vos changements')
  process.exit(1)
}

