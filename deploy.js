import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
// IMPORTANT: Modifiez cette variable selon votre nom d'utilisateur GitHub
const GITHUB_USERNAME = 'oishi-nigiri';
const GITHUB_REPO = `${GITHUB_USERNAME}/${GITHUB_USERNAME}.github.io`;
const DEPLOY_DIR = '.';
const DIST_DIR = 'dist';
const TEMP_DIR = '.deploy-temp';
const GITHUB_BRANCH = 'gh-pages'; // Branche standard pour GitHub Pages (peut être 'main', 'master', ou 'gh-pages')

console.log('🚀 Démarrage du déploiement...\n');

// Variable pour stocker la config originale (définie au début pour être accessible dans le catch)
let originalConfig = null;
const viteConfigPath = join(__dirname, 'vite.config.js');

try {
  // Étape 1: Modifier le base path dans vite.config.js pour /admin/
  console.log('📝 Modification du base path pour /admin/...');
  let viteConfig = readFileSync(viteConfigPath, 'utf-8');
  
  // Sauvegarder la config originale
  originalConfig = viteConfig;
  
  // Modifier le base path pour /admin/
  viteConfig = viteConfig.replace(
    /base:\s*process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*['"][^'"]*['"]\s*:\s*['"][^'"]*['"]/,
    "base: process.env.NODE_ENV === 'production' ? '/admin/' : '/'"
  );
  
  writeFileSync(viteConfigPath, viteConfig, 'utf-8');
  console.log('✅ Base path modifié\n');

  // Étape 2: Build le projet
  console.log('🔨 Build du projet...');
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Build terminé\n');

  // Étape 3: Cloner le repo dans un dossier temporaire (si pas déjà cloné)
  console.log('📦 Préparation du déploiement...');
  
  if (existsSync(TEMP_DIR)) {
    console.log('   Nettoyage du dossier temporaire...');
    rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  
  mkdirSync(TEMP_DIR, { recursive: true });
  
  // Cloner le repo
  const repoUrl = `https://github.com/${GITHUB_REPO}.git`;
  console.log(`   Clonage du repo ${repoUrl}...`);
  
  // Essayer de cloner avec différentes branches (gh-pages est la branche standard pour GitHub Pages)
  const branchesToTry = [GITHUB_BRANCH, 'gh-pages', 'main', 'master'];
  let branchToUse = null;
  let cloneSuccess = false;
  
  for (const branch of branchesToTry) {
    try {
      if (branch === GITHUB_BRANCH) {
        console.log(`   Tentative avec la branche configurée '${branch}'...`);
      } else {
        console.log(`   Tentative avec la branche '${branch}'...`);
      }
      execSync(`git clone --depth 1 --branch ${branch} ${repoUrl} .`, { 
        stdio: 'pipe', 
        cwd: join(__dirname, TEMP_DIR),
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
      });
      branchToUse = branch;
      cloneSuccess = true;
      console.log(`   ✅ Repo cloné avec succès (branche: ${branchToUse})`);
      break;
    } catch (cloneError) {
      // Continuer avec la branche suivante
      continue;
    }
  }
  
  // Si aucune branche n'a fonctionné, cloner sans spécifier de branche
  if (!cloneSuccess) {
    console.log(`   ⚠️  Aucune branche standard trouvée, clonage sans branche spécifique...`);
    try {
      execSync(`git clone --depth 1 ${repoUrl} .`, { 
        stdio: 'pipe', 
        cwd: join(__dirname, TEMP_DIR),
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
      });
      // Détecter la branche par défaut
      branchToUse = execSync('git rev-parse --abbrev-ref HEAD', { 
        encoding: 'utf-8', 
        cwd: join(__dirname, TEMP_DIR) 
      }).trim();
      console.log(`   ✅ Repo cloné avec succès (branche détectée: ${branchToUse})`);
    } catch (finalError) {
      throw new Error(`Impossible de cloner le repo. Vérifiez que le repo existe et que vous avez les permissions nécessaires.`);
    }
  }
  
  // Mettre à jour GITHUB_BRANCH pour le push
  const finalBranch = branchToUse;

  // Étape 4: Copier le contenu de dist dans le dossier admin (sans supprimer les autres fichiers)
  console.log(`\n📂 Copie des fichiers dans ${DEPLOY_DIR}/...`);
  
  const deployPath = join(__dirname, TEMP_DIR, DEPLOY_DIR);
  const distPath = join(__dirname, DIST_DIR);
  
  // Vérifier que dist existe
  if (!existsSync(distPath)) {
    throw new Error(`Le dossier ${DIST_DIR} n'existe pas. Exécutez d'abord "npm run build".`);
  }
  
  // Vérifier si le dossier admin existe et s'il contient un dépôt Git (sous-module)
  // Si c'est le cas, le supprimer complètement pour éviter les problèmes
  if (existsSync(deployPath)) {
    const adminGitPath = join(deployPath, '.git');
    if (existsSync(adminGitPath)) {
      console.log(`   ⚠️  Détection d'un dépôt Git dans ${DEPLOY_DIR}/, suppression...`);
      // Supprimer le dossier admin complètement s'il contient un .git
      rmSync(deployPath, { recursive: true, force: true });
      console.log(`   ✅ Dossier ${DEPLOY_DIR}/ supprimé (contenait un dépôt Git)`);
    } else {
      console.log(`   Dossier ${DEPLOY_DIR}/ existe déjà`);
      
      // Supprimer le dossier assets pour éviter l'accumulation d'anciens builds
      const assetsPath = join(deployPath, 'assets');
      if (existsSync(assetsPath)) {
        console.log(`   🗑️  Suppression des anciens fichiers de build dans assets/...`);
        rmSync(assetsPath, { recursive: true, force: true });
        console.log(`   ✅ Anciens fichiers de build supprimés`);
      }
      
      // Supprimer aussi les anciens fichiers index.html et autres fichiers à la racine de admin/
      // qui sont générés par le build (mais préserver les fichiers personnalisés si nécessaire)
      const adminIndexPath = join(deployPath, 'index.html');
      if (existsSync(adminIndexPath)) {
        // On garde index.html car il sera remplacé par la copie
      }
    }
  }
  
  // Créer le dossier admin s'il n'existe pas
  if (!existsSync(deployPath)) {
    mkdirSync(deployPath, { recursive: true });
    console.log(`   Dossier ${DEPLOY_DIR}/ créé`);
  }
  
  // Copier récursivement tous les fichiers de dist vers admin
  // Cela remplace tous les fichiers de build par les nouveaux
  cpSync(distPath, deployPath, { 
    recursive: true, 
    overwrite: true,
    force: true
  });
  
  // S'assurer qu'il n'y a pas de .git dans admin après la copie
  const adminGitPathAfter = join(deployPath, '.git');
  if (existsSync(adminGitPathAfter)) {
    console.log(`   ⚠️  Suppression du dossier .git dans ${DEPLOY_DIR}/...`);
    rmSync(adminGitPathAfter, { recursive: true, force: true });
    console.log(`   ✅ Dossier .git supprimé de ${DEPLOY_DIR}/`);
  }
  
  console.log('✅ Fichiers copiés (les fichiers existants non présents dans dist sont préservés)');
  
  // Copier le fichier 404.html à la racine du repo (nécessaire pour GitHub Pages)
  // GitHub Pages utilise 404.html à la racine pour gérer les erreurs 404
  // Le fichier 404.html doit être identique à index.html pour que Vue Router fonctionne
  const dist404Path = join(distPath, '404.html');
  const root404Path = join(__dirname, TEMP_DIR, '404.html');
  const adminIndexPath = join(deployPath, 'index.html');
  
  if (existsSync(adminIndexPath)) {
    // Copier index.html vers 404.html à la racine
    // Les chemins dans index.html sont déjà relatifs au base path /admin/
    // donc ils fonctionneront correctement
    let indexContent = readFileSync(adminIndexPath, 'utf-8');
    writeFileSync(root404Path, indexContent, 'utf-8');
    console.log('✅ Fichier 404.html créé à partir de index.html à la racine du repo');
  } else if (existsSync(dist404Path)) {
    cpSync(dist404Path, root404Path, { overwrite: true, force: true });
    console.log('✅ Fichier 404.html copié à la racine du repo');
  } else {
    console.log('⚠️  Fichier index.html non trouvé dans admin, 404.html ne sera pas créé');
  }
  console.log('');

  // Étape 5: Commit et push
  console.log('💾 Commit des changements...');
  
  // Configurer git si nécessaire
  try {
    execSync('git config user.name "Deploy Script"', { 
      cwd: join(__dirname, TEMP_DIR) 
    });
    execSync('git config user.email "deploy@noreply.github.com"', { 
      cwd: join(__dirname, TEMP_DIR) 
    });
  } catch (e) {
    // Ignorer si déjà configuré
  }
  
  // Supprimer admin de l'index Git s'il est traité comme un sous-module
  try {
    execSync('git rm --cached admin', { 
      stdio: 'pipe', 
      cwd: join(__dirname, TEMP_DIR) 
    });
    console.log('   ✅ Ancien dossier admin retiré de l\'index Git');
  } catch (e) {
    // Ignorer si admin n'était pas dans l'index ou n'était pas un sous-module
  }
  
  // Ajouter tous les changements (nouveaux fichiers, modifications et suppressions)
  execSync('git add -A', { 
    stdio: 'inherit', 
    cwd: join(__dirname, TEMP_DIR) 
  });
  
  // Vérifier s'il y a des changements à commiter
  let hasChanges = false;
  try {
    const status = execSync('git status --porcelain', { 
      encoding: 'utf-8', 
      cwd: join(__dirname, TEMP_DIR) 
    });
    
    if (status.trim()) {
      hasChanges = true;
      const commitMessage = `Deploy: Mise à jour de ${DEPLOY_DIR} - ${new Date().toISOString()}`;
      execSync(`git commit -m "${commitMessage}"`, { 
        stdio: 'inherit', 
        cwd: join(__dirname, TEMP_DIR) 
      });
      console.log('✅ Changements commités\n');
    } else {
      console.log('   Aucun changement à commiter\n');
    }
  } catch (error) {
    // Vérifier si c'est parce qu'il n'y a pas de changements
    try {
      execSync('git diff --quiet --exit-code', { 
        cwd: join(__dirname, TEMP_DIR) 
      });
      console.log('   Aucun changement détecté\n');
    } catch (diffError) {
      // Il y a des changements, essayer de commiter
      hasChanges = true;
      const commitMessage = `Deploy: Mise à jour de ${DEPLOY_DIR} - ${new Date().toISOString()}`;
      try {
        execSync(`git commit -m "${commitMessage}"`, { 
          stdio: 'inherit', 
          cwd: join(__dirname, TEMP_DIR) 
        });
        console.log('✅ Changements commités\n');
      } catch (commitError) {
        console.log('   Aucun changement à commiter\n');
        hasChanges = false;
      }
    }
  }
  
  // Push seulement s'il y a des changements
  if (hasChanges) {
    console.log('📤 Push vers GitHub...');
    execSync(`git push origin ${finalBranch} --force`, { 
      stdio: 'inherit', 
      cwd: join(__dirname, TEMP_DIR) 
    });
    console.log('✅ Push terminé\n');
  } else {
    console.log('⏭️  Aucun push nécessaire (pas de changements)\n');
  }

  // Étape 6: Nettoyer
  console.log('🧹 Nettoyage...');
  rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('✅ Nettoyage terminé\n');

  // Étape 7: Restaurer le vite.config.js original
  console.log('↩️  Restauration du vite.config.js original...');
  writeFileSync(viteConfigPath, originalConfig, 'utf-8');
  console.log('✅ Configuration restaurée\n');

  console.log('🎉 Déploiement réussi!');
  console.log(`   Votre site est disponible sur: https://depannup.github.io/${DEPLOY_DIR}/`);
  
} catch (error) {
  console.error('\n❌ Erreur lors du déploiement:', error.message);
  
  // Restaurer le vite.config.js en cas d'erreur
  try {
    if (originalConfig) {
      writeFileSync(viteConfigPath, originalConfig, 'utf-8');
      console.log('✅ Configuration restaurée après erreur');
    } else {
      // Si originalConfig n'est pas défini, essayer de lire le fichier actuel
      // et le restaurer à sa valeur par défaut
      try {
        let currentConfig = readFileSync(viteConfigPath, 'utf-8');
        // Restaurer le base path par défaut
        const restoredConfig = currentConfig.replace(
          /base:\s*process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*['"][^'"]*['"]\s*:\s*['"][^'"]*['"]/,
          "base: process.env.NODE_ENV === 'production' ? '/3jsite/' : '/'"
        );
        writeFileSync(viteConfigPath, restoredConfig, 'utf-8');
        console.log('✅ Configuration restaurée à la valeur par défaut');
      } catch (readError) {
        console.error('⚠️  Impossible de lire la configuration pour restauration');
      }
    }
  } catch (restoreError) {
    console.error('⚠️  Impossible de restaurer la configuration:', restoreError.message);
  }
  
  process.exit(1);
}



