# 📦 Script de Déploiement

## 🚀 Utilisation

```bash
npm run deploy
```

Ce script va :
1. ✅ Build votre projet (`npm run build`)
2. ✅ Déployer le dossier `dist/` sur GitHub Pages
3. ✅ **Ne pas modifier vos fichiers locaux** (tout reste intact)

## 📋 Prérequis

- Git initialisé et configuré
- Remote GitHub configuré (`git remote add origin ...`)
- Accès en écriture au repository GitHub

## 🔧 Comment ça fonctionne

Le script utilise `gh-pages` qui :
- Crée/met à jour la branche `gh-pages` sur GitHub
- Copie uniquement le contenu de `dist/` sur cette branche
- **Ne touche pas à vos fichiers locaux**
- Vous pouvez continuer à travailler normalement après le déploiement

## ⚙️ Configuration GitHub Pages

Après le premier déploiement :

1. Allez dans **Settings > Pages** de votre repo GitHub
2. **Source** : Sélectionnez la branche `gh-pages`
3. **Folder** : `/ (root)`
4. Cliquez sur **Save**

Votre site sera disponible sur :
- `https://votre-username.github.io/nom-du-repo/`

## 🔄 Workflow Recommandé

```bash
# 1. Faire vos modifications
# ... modifier le code ...

# 2. Tester en local
npm run dev

# 3. Build et déployer
npm run deploy

# 4. Continuer à travailler (vos fichiers sont intacts)
```

## ⚠️ Notes Importantes

- ✅ Vos fichiers locaux ne sont **jamais** modifiés
- ✅ Vous pouvez déployer autant de fois que vous voulez
- ✅ Le script build automatiquement avant de déployer
- ✅ La branche `gh-pages` est créée automatiquement si elle n'existe pas

## 🐛 Dépannage

### Erreur: "not a git repository"
```bash
git init
git remote add origin https://github.com/votre-username/nom-du-repo.git
```

### Erreur: "Permission denied"
Vérifiez vos permissions GitHub et votre authentification Git.

### Le site ne s'affiche pas
1. Vérifiez que GitHub Pages est activé dans Settings > Pages
2. Attendez quelques minutes (le déploiement peut prendre du temps)
3. Vérifiez l'onglet Actions pour voir si le déploiement a réussi




