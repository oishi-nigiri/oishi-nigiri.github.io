# Fichiers Legacy (Anciens)

Ce dossier contient les anciens fichiers qui ont été remplacés par la version Vue.js.

## 📁 Fichiers archivés

- **index.html** → Remplacé par `index-vue.html` (maintenant `index.html` dans dist/)
- **admin.html** → Remplacé par `admin-vue.html` (maintenant `admin.html` dans dist/)
- **admin.js** → Logique migrée vers les composants Vue dans `src/components/admin/`
- **script.js** → Logique migrée vers les composants Vue dans `src/components/`
- **auth.js** → Logique migrée vers `src/composables/useAuth.js`
- **firebase-config.js** → Logique migrée vers `src/composables/useFirebase.js`
- **admin.css** → Styles migrés vers les composants Vue avec `<style scoped>`
- **styles.css** → Styles migrés vers `src/style.css` et les composants Vue

## ⚠️ Note

Ces fichiers sont conservés à titre de référence. Ils ne sont plus utilisés dans la version Vue.js du site.

Si vous avez besoin de récupérer quelque chose de ces fichiers, vous pouvez les consulter ici.

## 🔄 Migration

Toute la fonctionnalité a été migrée vers Vue.js 3 avec :
- Composants modulaires
- Composition API
- Meilleure organisation du code
- Interface admin améliorée




