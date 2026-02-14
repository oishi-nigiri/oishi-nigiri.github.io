import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const filesToCopy = [
  { from: 'logo.png', to: 'dist/logo.png' },
  { from: 'config.js', to: 'dist/config.js' },
  { from: 'discord-callback.html', to: 'dist/discord-callback.html' },
  { from: 'recrutement.html', to: 'dist/recrutement.html' },
  { from: 'security.js', to: 'dist/security.js' }
]

// Fonction pour copier récursivement un dossier
function copyRecursive(src, dest) {
  if (!existsSync(src)) {
    console.warn(`⚠️  Dossier non trouvé: ${src}`)
    return
  }

  const stats = statSync(src)

  if (stats.isDirectory()) {
    // Créer le dossier de destination
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true })
    }

    // Copier tous les fichiers du dossier
    const files = readdirSync(src)
    files.forEach(file => {
      const srcPath = join(src, file)
      const destPath = join(dest, file)

      if (statSync(srcPath).isDirectory()) {
        copyRecursive(srcPath, destPath)
      } else {
        copyFileSync(srcPath, destPath)
        console.log(`✅ Copié: ${srcPath} → ${destPath}`)
      }
    })
  } else {
    // C'est un fichier, copier directement
    const toDir = dirname(dest)
    if (!existsSync(toDir)) {
      mkdirSync(toDir, { recursive: true })
    }
    copyFileSync(src, dest)
    console.log(`✅ Copié: ${src} → ${dest}`)
  }
}

console.log('📦 Copie des fichiers statiques...')

// Copier les fichiers individuels
filesToCopy.forEach(({ from, to }) => {
  const fromPath = join(process.cwd(), from)
  const toPath = join(process.cwd(), to)

  if (existsSync(fromPath)) {
    const toDir = dirname(toPath)
    if (!existsSync(toDir)) {
      mkdirSync(toDir, { recursive: true })
    }

    copyFileSync(fromPath, toPath)
    console.log(`✅ Copié: ${from} → ${to}`)
  } else {
    console.warn(`⚠️  Fichier non trouvé: ${from}`)
  }
})

console.log('\n✨ Copie terminée!')

