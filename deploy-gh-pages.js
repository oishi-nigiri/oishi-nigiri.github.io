import { execSync } from "child_process";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  cpSync,
  rmSync,
  readdirSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DIST_DIR = "dist";
const TEMP_DIR = ".deploy-temp";
const GITHUB_BRANCH = "gh-pages";

console.log("🚀 Déploiement vers GitHub Pages (branche gh-pages)...\n");

// Variable pour stocker la config originale
let originalConfig = null;
const viteConfigPath = join(__dirname, "vite.config.js");

try {
  // Étape 1: Modifier temporairement le base path dans vite.config.js pour la racine
  console.log("📝 Configuration du base path pour la racine...");
  if (existsSync(viteConfigPath)) {
    let viteConfig = readFileSync(viteConfigPath, "utf-8");

    // Sauvegarder la config originale
    originalConfig = viteConfig;

    // Modifier le base path pour la racine (/)
    viteConfig = viteConfig.replace(
      /base:\s*process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*['"][^'"]*['"]\s*:\s*['"][^'"]*['"]/,
      "base: process.env.NODE_ENV === 'production' ? '/' : '/'"
    );

    writeFileSync(viteConfigPath, viteConfig, "utf-8");
    console.log("✅ Base path configuré pour la racine\n");
  }

  // Étape 2: Build le projet
  console.log("🔨 Build du projet...");
  execSync("npm run build", { stdio: "inherit", cwd: __dirname });
  console.log("✅ Build terminé\n");

  // Étape 3: Préparation du déploiement avec dossier temporaire
  console.log("📦 Préparation du déploiement...");

  if (existsSync(TEMP_DIR)) {
    console.log("   Nettoyage du dossier temporaire...");
    rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  mkdirSync(TEMP_DIR, { recursive: true });

  // Cloner la branche gh-pages
  const repoUrl = execSync("git config --get remote.origin.url", {
    encoding: "utf-8",
  }).trim();
  console.log(`   Clonage de la branche ${GITHUB_BRANCH}...`);

  try {
    execSync(`git clone --depth 1 --branch ${GITHUB_BRANCH} ${repoUrl} .`, {
      stdio: "pipe",
      cwd: join(__dirname, TEMP_DIR),
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    console.log(`   ✅ Branche ${GITHUB_BRANCH} clonée avec succès`);
  } catch (cloneError) {
    console.log(
      `   ⚠️  Branche ${GITHUB_BRANCH} introuvable, création depuis la branche actuelle...`
    );
    // Cloner sans spécifier de branche puis créer gh-pages
    execSync(`git clone --depth 1 ${repoUrl} .`, {
      stdio: "pipe",
      cwd: join(__dirname, TEMP_DIR),
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    execSync(`git checkout -b ${GITHUB_BRANCH}`, {
      stdio: "pipe",
      cwd: join(__dirname, TEMP_DIR),
    });
    console.log(`   ✅ Branche ${GITHUB_BRANCH} créée`);
  }

  // Étape 4: Nettoyer le contenu du repo cloné (sauf .git)
  console.log("\n🧹 Nettoyage du contenu de la branche gh-pages...");
  const tempDirContents = readdirSync(join(__dirname, TEMP_DIR));

  for (const item of tempDirContents) {
    if (item !== ".git") {
      const itemPath = join(__dirname, TEMP_DIR, item);
      rmSync(itemPath, { recursive: true, force: true });
      console.log(`   Supprimé: ${item}`);
    }
  }
  console.log("✅ Contenu nettoyé\n");

  // Étape 5: Copier le contenu de dist vers le dossier temporaire
  console.log("📂 Copie du contenu compilé...");
  const distPath = join(__dirname, DIST_DIR);
  const tempPath = join(__dirname, TEMP_DIR);

  if (!existsSync(distPath)) {
    throw new Error(
      `Le dossier ${DIST_DIR} n'existe pas. Le build a peut-être échoué.`
    );
  }

  cpSync(distPath, tempPath, {
    recursive: true,
    force: true,
  });
  console.log("✅ Contenu copié\n");

  // Étape 5.5: Cache-busting pour éviter les problèmes de cache après déploiement
  console.log("💾 Ajout du cache-busting...");
  const cacheBuster = Date.now().toString();

  // Fonction pour appliquer le cache-busting à un fichier HTML
  const applyCacheBusting = (filePath) => {
    if (existsSync(filePath)) {
      let content = readFileSync(filePath, "utf-8");

      // Ajouter un paramètre de cache aux assets CSS et JS
      content = content.replace(
        /(href|src)="([^"]*\.(css|js))"/g,
        `$1="$2?v=${cacheBuster}"`
      );

      // Ajouter des meta tags pour forcer le reload (seulement si pas déjà présent)
      if (!content.includes('http-equiv="Cache-Control"')) {
        content = content.replace(
          "<head>",
          `<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n    <meta http-equiv="Pragma" content="no-cache">\n    <meta http-equiv="Expires" content="0">`
        );
      }

      writeFileSync(filePath, content);
      return true;
    }
    return false;
  };

  // Appliquer le cache-busting aux fichiers HTML principaux
  const htmlFiles = ["index.html", "recrutement.html", "admin.html"];
  let cacheBustedCount = 0;

  for (const htmlFile of htmlFiles) {
    const filePath = join(tempPath, htmlFile);
    if (applyCacheBusting(filePath)) {
      cacheBustedCount++;
      console.log(`   Cache-busting appliqué: ${htmlFile}`);
    }
  }

  if (cacheBustedCount > 0) {
    console.log(`✅ Cache-busting ajouté à ${cacheBustedCount} fichier(s)\n`);
  } else {
    console.log("ℹ️  Aucun fichier HTML trouvé pour le cache-busting\n");
  }

  // Garder le dossier legacy pour recrutement.html
  const legacyPath = join(tempPath, "legacy");
  if (existsSync(legacyPath)) {
    console.log("ℹ️  Dossier legacy conservé pour recrutement.html\n");
  }

  // Étape 6: Commit et push
  console.log("💾 Commit des changements...");

  // Configurer git
  try {
    execSync('git config user.name "Deploy Script"', {
      cwd: join(__dirname, TEMP_DIR),
    });
    execSync('git config user.email "deploy@noreply.github.com"', {
      cwd: join(__dirname, TEMP_DIR),
    });
  } catch (e) {
    // Ignorer si déjà configuré
  }

  execSync("git add .", {
    stdio: "inherit",
    cwd: join(__dirname, TEMP_DIR),
  });

  // Vérifier s'il y a des changements
  const hasChanges = execSync("git status --porcelain", {
    encoding: "utf-8",
    cwd: join(__dirname, TEMP_DIR),
  }).trim();

  if (hasChanges) {
    const commitMessage = `Deploy: Mise à jour du site - ${new Date().toISOString()}`;
    execSync(`git commit -m "${commitMessage}"`, {
      stdio: "inherit",
      cwd: join(__dirname, TEMP_DIR),
    });
    console.log("✅ Changements commités\n");

    // Push vers GitHub
    console.log("📤 Push vers GitHub...");
    execSync(`git push origin ${GITHUB_BRANCH}`, {
      stdio: "inherit",
      cwd: join(__dirname, TEMP_DIR),
    });
    console.log("✅ Push terminé\n");
  } else {
    console.log("⏭️  Aucun changement à commiter\n");
  }

  // Étape 7: Nettoyer
  console.log("🧹 Nettoyage...");
  rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log("✅ Nettoyage terminé\n");

  // Étape 8: Restaurer la configuration originale
  if (originalConfig) {
    console.log("↩️  Restauration de la configuration vite.config.js...");
    writeFileSync(viteConfigPath, originalConfig, "utf-8");
    console.log("✅ Configuration restaurée\n");
  }

  console.log("🎉 Déploiement réussi!");
  console.log(
    "   Votre site est disponible sur: https://oishi-nigiri.github.io/"
  );
} catch (error) {
  console.error("\n❌ Erreur lors du déploiement:", error.message);

  // Restaurer la configuration en cas d'erreur
  try {
    if (originalConfig) {
      writeFileSync(viteConfigPath, originalConfig, "utf-8");
      console.log("✅ Configuration restaurée après erreur");
    }
  } catch (restoreError) {
    console.error(
      "⚠️  Impossible de restaurer la configuration:",
      restoreError.message
    );
  }

  // Nettoyer le dossier temporaire en cas d'erreur
  try {
    if (existsSync(TEMP_DIR)) {
      rmSync(TEMP_DIR, { recursive: true, force: true });
      console.log("✅ Dossier temporaire nettoyé");
    }
  } catch (cleanupError) {
    console.error(
      "⚠️  Impossible de nettoyer le dossier temporaire:",
      cleanupError.message
    );
  }

  process.exit(1);
}
