# 🚀 Guide de Configuration Initiale

## ✅ Oui, vous devez faire `npm install` !

C'est la première étape pour installer toutes les dépendances nécessaires.

## 📦 Installation

```bash
npm install
```

Cela installera :
- Vue.js 3
- Vue Router
- Firebase
- Vite (build tool)
- Toutes les dépendances de développement

## 📁 Organisation des Fichiers

### ✅ Fichiers Actifs (utilisés)

- `index.html` - Page principale (Vue.js)
- `admin.html` - Page admin (Vue.js)
- `src/` - Code source Vue.js
- `config.js` - Configuration Discord
- `security.js` - Sécurité
- `discord-callback.html` - Callback Discord
- `recrutement.html` - Page de recrutement
- `logo.png` - Logo
- `firestore.rules` - Règles Firestore
- `firestore.indexes.json` - Index Firestore

### 📦 Fichiers Archivés (dans `legacy/`)

Tous les anciens fichiers ont été déplacés dans le dossier `legacy/` :
- `index.html` (ancien)
- `admin.html` (ancien)
- `admin.js`
- `script.js`
- `auth.js`
- `firebase-config.js`
- `admin.css`
- `styles.css`

Ces fichiers ne sont plus utilisés mais sont conservés à titre de référence.

## 🎯 Prochaines Étapes

1. **Installer les dépendances :**
   ```bash
   npm install
   ```

2. **Tester en local :**
   ```bash
   npm run dev
   ```

3. **Build pour production :**
   ```bash
   npm run build
   ```

4. **Déployer sur GitHub Pages :**
   - Activer GitHub Pages dans Settings > Pages
   - Le workflow GitHub Actions se déclenchera automatiquement

## 📚 Documentation

- `README.md` - Vue d'ensemble
- `README-VUE.md` - Documentation Vue.js
- `README-GITHUB-PAGES.md` - Guide GitHub Pages
- `DEPLOY.md` - Instructions de déploiement

## ⚠️ Important

- Les fichiers dans `legacy/` ne sont plus utilisés
- Toute la logique a été migrée vers Vue.js
- Le site utilise maintenant Vue.js 3 avec Composition API




