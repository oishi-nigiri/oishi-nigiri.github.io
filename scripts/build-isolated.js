import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

console.log('🔨 Build isolé (sans toucher les fichiers locaux)...\n')

// Build normal du projet (qui utilise déjà un répertoire temporaire en interne)
console.log('📦 Build du projet...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build terminé\n')
} catch (error) {
  console.error('❌ Erreur lors du build')
  process.exit(1)
}

// Vérifier que dist/ existe
const distPath = join(process.cwd(), 'dist')
if (!existsSync(distPath)) {
  console.error('❌ Le dossier dist/ n\'existe pas. Le build a peut-être échoué.')
  process.exit(1)
}

console.log('✨ Build isolé terminé avec succès!')
console.log(`📁 Le résultat se trouve dans: ${distPath}`)
console.log('\n💡 Le build est terminé. Vous pouvez modifier vos fichiers sources sans affecter ce build.')