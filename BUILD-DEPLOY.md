# Build et Déploiement

Ce document explique les différents scripts disponibles pour compiler et déployer votre application.

## 🚀 Scripts disponibles

### `npm run dev`
Lance le serveur de développement Vite avec rechargement automatique.
```bash
npm run dev
```

### `npm run build`
Build standard qui génère les fichiers dans le dossier `dist/`.
```bash
npm run build
```

### `npm run build-isolated`
**NOUVEAU** - Build isolé qui ne touche pas vos fichiers locaux.

- Compile dans un répertoire temporaire
- Installe les dépendances séparément
- Copie le résultat final vers `dist/` sans modifier vos fichiers sources
- Parfait pour faire des modifications locales après le build

```bash
npm run build-isolated
```

### `npm run deploy`
**MODIFIÉ** - Déploiement sur GitHub Pages avec compilation isolée.

- Compile dans un répertoire temporaire (pas de modification des fichiers locaux)
- Installe les dépendances dans l'environnement temporaire
- Déploie uniquement les fichiers compilés
- Vous pouvez continuer à modifier vos fichiers locaux pendant/après le déploiement

```bash
npm run deploy
```

### `npm run preview`
Prévisualise le build localement.
```bash
npm run preview
```

## 🔧 Différences avec l'ancien système

### Avant (build local)
- `npm run build` générait des fichiers dans `dist/`
- Le déploiement copiait `dist/` vers la branche Git
- Risque de conflits avec les fichiers locaux

### Maintenant (build isolé)
- **Build isolé** : Compilation dans un répertoire temporaire
- **Aucun fichier local modifié** : Vos fichiers sources restent intacts
- **Modifications possibles** : Vous pouvez éditer vos fichiers pendant le déploiement
- **Sécurité** : Le build est fait dans un environnement propre

## 📁 Structure des répertoires

```
/your-project/
├── src/                 # Vos fichiers sources (intacts)
├── dist/               # Résultat du build (écrasé à chaque build)
├── scripts/            # Scripts de build et déploiement
├── package.json        # Configuration
└── ...autres fichiers  # Tous vos fichiers restent modifiables
```

## 🔄 Workflow recommandé

1. **Développement** : `npm run dev`
2. **Test du build** : `npm run build-isolated`
3. **Déploiement** : `npm run deploy`
4. **Modification** : Continuez à éditer vos fichiers locaux

## ⚠️ Points importants

- **Fichiers locaux préservés** : Le déploiement ne touche jamais vos fichiers sources
- **Modifications possibles** : Vous pouvez modifier vos fichiers pendant le déploiement
- **Environnement propre** : Chaque build utilise un environnement temporaire isolé
- **Git safe** : Aucun risque de commit accidentel de fichiers générés

## 🐛 Dépannage

### Le build échoue
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Vérifiez que vos fichiers sources sont valides

### Le déploiement échoue
- Vérifiez votre connexion Git
- Vérifiez que vous avez les permissions pour pousser sur le repo
- Vérifiez que GitHub Pages est configuré pour utiliser la branche `gh-pages`

### Fichiers locaux modifiés accidentellement
- Utilisez `git checkout .` pour restaurer les fichiers trackés
- Utilisez `git clean -fd` pour supprimer les fichiers non trackés

## 📊 Avantages du build isolé

| Aspect | Avant | Maintenant |
|--------|-------|------------|
| Fichiers locaux | Modifiés | ✅ Préservés |
| Modifications pendant build | ❌ Bloquées | ✅ Possibles |
| Environnement | Local | ✅ Temporaire isolé |
| Risques de conflits | Élevés | ✅ Nuls |
| Sécurité | Moyenne | ✅ Élevée |