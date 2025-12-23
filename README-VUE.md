# Migration vers Vue.js - Oishi Nigiri

Ce projet a été migré vers **Vue.js 3** avec Composition API pour une meilleure structure, performance et maintenabilité.

## 🚀 Installation

```bash
npm install
```

## 📦 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── admin/          # Composants admin
│   │   ├── tabs/       # Onglets admin
│   │   └── modals/     # Modales admin
│   ├── Navbar.vue
│   ├── HeroSection.vue
│   ├── WeeklyMenuSection.vue
│   ├── AboutSection.vue
│   ├── TeamSection.vue
│   └── Footer.vue
├── pages/              # Pages principales
│   ├── Home.vue
│   └── Admin.vue
├── composables/        # Logique réutilisable
│   ├── useFirebase.js
│   └── useAuth.js
├── router.js           # Configuration du router
├── App.vue
├── main.js
└── style.css
```

## 🛠️ Développement

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

## 🏗️ Build pour Production

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`

## 🌐 Déploiement sur GitHub Pages

Le projet est configuré pour GitHub Pages avec déploiement automatique via GitHub Actions.

### Configuration automatique

1. Activez GitHub Pages dans Settings > Pages (Source: GitHub Actions)
2. Le workflow se déclenche automatiquement à chaque push
3. Le site sera disponible sur `https://votre-username.github.io/nom-du-repo/`

Voir `DEPLOY.md` pour plus de détails.

## ✨ Améliorations Apportées

### 1. **Architecture Moderne**
- Vue.js 3 avec Composition API
- Structure modulaire et composants réutilisables
- Séparation claire des responsabilités

### 2. **Interface Admin Améliorée**
- Design moderne et épuré
- Animations fluides
- Meilleure organisation des sections
- Responsive design amélioré

### 3. **Performance**
- Code splitting automatique
- Lazy loading des composants
- Optimisations Vue.js natives

### 4. **Maintenabilité**
- Code plus lisible et organisé
- Composables pour la logique réutilisable
- TypeScript-ready (peut être ajouté facilement)

## 📝 Migration depuis l'ancien système

Les anciens fichiers (`index.html`, `admin.html`, etc.) sont toujours présents pour référence.

Pour utiliser la nouvelle version Vue.js :
1. Utilisez `index-vue.html` et `admin-vue.html` comme point de départ
2. Ou renommez-les pour remplacer les anciens fichiers
3. Assurez-vous que `config.js` est présent

## 🔧 Configuration

Le fichier `config.js` doit contenir la configuration Discord :

```javascript
window.DISCORD_CONFIG = {
  clientId: '...',
  redirectUri: '...',
  scope: 'identify',
  adminManagerIds: ['...']
}
```

## 📚 Technologies Utilisées

- **Vue.js 3** - Framework JavaScript
- **Vue Router** - Routing
- **Firebase/Firestore** - Base de données
- **Vite** - Build tool moderne
- **Font Awesome** - Icônes

## 🎨 Design

L'interface admin a été repensée avec :
- Couleurs cohérentes avec le thème du site
- Animations subtiles
- Cards avec effets hover
- Modales modernes
- Navigation par onglets améliorée

## 📄 Notes

- Les fichiers originaux sont conservés pour référence
- La migration est progressive et peut être testée en parallèle
- Toutes les fonctionnalités existantes sont préservées

