# 🍱 Oishi Nigiri - Site Web

Site web du restaurant Oishi Nigiri, développé avec Vue.js 3.

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

### Build pour Production

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`

## 📚 Documentation

- **[README-VUE.md](README-VUE.md)** - Documentation Vue.js et structure du projet
- **[README-GITHUB-PAGES.md](README-GITHUB-PAGES.md)** - Guide de déploiement sur GitHub Pages
- **[DEPLOY.md](DEPLOY.md)** - Instructions de déploiement détaillées

## 🗂️ Structure du Projet

```
├── src/                    # Code source Vue.js
│   ├── components/         # Composants réutilisables
│   ├── pages/              # Pages principales
│   ├── composables/        # Logique réutilisable
│   └── router.js           # Configuration du router
├── legacy/                 # Anciens fichiers (non utilisés)
├── scripts/                # Scripts utilitaires
├── public/                 # Fichiers publics
├── index.html              # Page principale (Vue.js)
├── admin.html              # Page admin (Vue.js)
├── config.js               # Configuration Discord
├── logo.png                # Logo du restaurant
└── package.json            # Dépendances npm
```

## ✨ Technologies

- **Vue.js 3** - Framework JavaScript
- **Vue Router** - Routing
- **Firebase/Firestore** - Base de données
- **Vite** - Build tool
- **Font Awesome** - Icônes

## 🌐 Déploiement

Le projet est configuré pour GitHub Pages avec déploiement automatique.

Voir [README-GITHUB-PAGES.md](README-GITHUB-PAGES.md) pour plus de détails.

## 📝 Notes

- Les anciens fichiers sont dans le dossier `legacy/`
- Le router utilise le hash mode (`#/`) pour la compatibilité GitHub Pages
- Les fichiers statiques sont copiés automatiquement après le build




