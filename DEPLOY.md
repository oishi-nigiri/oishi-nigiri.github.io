# Déploiement sur GitHub Pages

Ce guide explique comment déployer le site Oishi Nigiri sur GitHub Pages.

## 🚀 Déploiement Automatique (Recommandé)

Le projet est configuré avec GitHub Actions pour un déploiement automatique.

### Configuration

1. **Activer GitHub Pages dans les paramètres du repo :**
   - Allez dans Settings > Pages
   - Source: sélectionnez "GitHub Actions"

2. **Le workflow se déclenche automatiquement :**
   - À chaque push sur `main` ou `master`
   - Le site sera disponible sur `https://votre-username.github.io/nom-du-repo/`

### Workflow GitHub Actions

Le fichier `.github/workflows/deploy.yml` est déjà configuré et :
- Installe les dépendances
- Build le projet Vue.js
- Déploie automatiquement sur GitHub Pages

## 📦 Déploiement Manuel

Si vous préférez déployer manuellement :

```bash
# 1. Installer les dépendances
npm install

# 2. Build le projet
npm run build

# 3. Copier les fichiers du dossier dist/ vers la racine du repo
# (ou vers la branche gh-pages selon votre configuration)
```

## ⚙️ Configuration du Base Path

Le projet utilise le **hash mode** pour le router Vue, ce qui fonctionne toujours sur GitHub Pages, même avec un sous-dossier.

Si votre repo s'appelle `oishi-nigiri.github.io` (repo user/organization), le site sera à la racine :
- `https://votre-username.github.io/`

Si votre repo a un autre nom, le site sera dans un sous-dossier :
- `https://votre-username.github.io/nom-du-repo/`

Le router Vue s'adapte automatiquement grâce au hash mode (`#/`).

## 🔧 Variables d'Environnement

Si vous devez changer le base path, modifiez la variable `GITHUB_REPO` dans `vite.config.js` ou définissez-la dans votre workflow GitHub Actions.

## 📝 Notes Importantes

1. **Fichiers statiques** : Les fichiers comme `logo.png` et `config.js` doivent être copiés dans le dossier `dist/` après le build.

2. **Config.js** : Assurez-vous que `config.js` est accessible depuis le site déployé.

3. **Firebase** : Vérifiez que votre configuration Firebase fonctionne avec le domaine GitHub Pages.

4. **Discord OAuth** : Mettez à jour l'URL de redirection Discord dans `config.js` pour pointer vers votre site GitHub Pages.

## 🐛 Dépannage

### Les assets ne se chargent pas

Vérifiez que les chemins dans `vite.config.js` sont corrects et que le base path est bien configuré.

### Le router ne fonctionne pas

Le hash mode devrait fonctionner. Si vous avez des problèmes, vérifiez que vous utilisez bien `createWebHashHistory()` dans `src/router.js`.

### Le build échoue

Assurez-vous que toutes les dépendances sont installées :
```bash
npm install
```




