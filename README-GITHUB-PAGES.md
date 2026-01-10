# Déploiement sur GitHub Pages - Guide Complet

## 🎯 Configuration pour GitHub Pages

Le projet est maintenant entièrement configuré pour fonctionner sur GitHub Pages avec Vue.js.

## ✅ Ce qui a été configuré

1. **Router en Hash Mode** : Utilise `#/` pour les routes (fonctionne toujours sur GitHub Pages)
2. **Base Path automatique** : Détecte automatiquement le nom du repo
3. **GitHub Actions** : Déploiement automatique à chaque push
4. **Copie des assets** : Script pour copier les fichiers statiques après le build

## 🚀 Déploiement Automatique

### Étape 1 : Activer GitHub Pages

1. Allez dans votre repo GitHub
2. Settings > Pages
3. Source : sélectionnez **"GitHub Actions"**
4. Cliquez sur Save

### Étape 2 : Push votre code

```bash
git add .
git commit -m "Configuration GitHub Pages"
git push origin main
```

Le workflow GitHub Actions se déclenchera automatiquement et déploiera votre site.

### Étape 3 : Vérifier le déploiement

1. Allez dans l'onglet **Actions** de votre repo
2. Vous verrez le workflow "Deploy to GitHub Pages"
3. Une fois terminé, votre site sera disponible sur :
   - `https://votre-username.github.io/nom-du-repo/`

## 📁 Structure après Build

```
dist/
├── index.html          # Page principale
├── admin.html          # Page admin
├── logo.png            # Logo (copié automatiquement)
├── config.js           # Configuration (copié automatiquement)
├── discord-callback.html
├── recrutement.html
├── security.js
└── assets/             # Assets Vue.js (JS, CSS)
```

## 🔧 Configuration du Base Path

Le base path est automatiquement détecté dans `vite.config.js` :

- **Repo user/organization** (`username.github.io`) : Base path = `/`
- **Repo projet** (`username.github.io/repo-name`) : Base path = `/repo-name/`

Vous pouvez modifier le nom du repo dans `vite.config.js` ligne 13 si nécessaire.

## 📝 Fichiers Importants

### Fichiers copiés automatiquement après build :
- `logo.png` → `dist/logo.png`
- `config.js` → `dist/config.js`
- `discord-callback.html` → `dist/discord-callback.html`
- `recrutement.html` → `dist/recrutement.html`
- `security.js` → `dist/security.js`

### Fichiers générés par Vite :
- `index.html` (depuis `index-vue.html`)
- `admin.html` (depuis `admin-vue.html`)
- `assets/*` (JS, CSS compilés)

## 🐛 Dépannage

### Les assets ne se chargent pas

Vérifiez que :
1. Le base path est correct dans `vite.config.js`
2. Les fichiers statiques sont bien copiés (vérifiez le dossier `dist/`)
3. Les chemins dans les composants utilisent des chemins relatifs ou le base path

### Le router ne fonctionne pas

Le hash mode (`#/`) devrait fonctionner. Si vous avez des problèmes :
1. Vérifiez que `createWebHashHistory()` est utilisé dans `src/router.js`
2. Les liens doivent utiliser `#/` au lieu de `/`

### Le build échoue

1. Vérifiez que Node.js 20+ est installé
2. Installez les dépendances : `npm install`
3. Vérifiez les erreurs dans la console

### Discord OAuth ne fonctionne pas

1. Mettez à jour l'URL de redirection dans Discord Developer Portal
2. Utilisez l'URL complète de votre site GitHub Pages
3. Vérifiez que `config.js` est bien copié dans `dist/`

## 🔄 Workflow de Développement

### En local

```bash
npm run dev
```

Le site sera sur `http://localhost:3000`

### Build local

```bash
npm run build
```

Les fichiers seront dans `dist/`

### Preview du build

```bash
npm run preview
```

## 📚 Ressources

- [Documentation GitHub Pages](https://docs.github.com/en/pages)
- [Documentation Vue Router](https://router.vuejs.org/)
- [Documentation Vite](https://vitejs.dev/)

## ✨ Notes

- Le hash mode (`#/`) fonctionne toujours, même avec un sous-dossier
- Les fichiers statiques sont copiés automatiquement après le build
- Le workflow GitHub Actions gère tout automatiquement
- Pas besoin de configurer manuellement le base path si vous utilisez le workflow




