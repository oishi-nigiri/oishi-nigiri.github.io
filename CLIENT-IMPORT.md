# Import Client des Données

Cette fonctionnalité permet d'importer les données du backup directement depuis l'interface admin, sans avoir besoin de credentials Firebase spéciaux.

## 🚀 Fonctionnement

### Préparation des données
```bash
npm run prepare-client-data
```
Cette commande transforme le fichier `backup-2026-01-10.json` en un format adapté au client et le place dans `public/backup-data.json`.

### Interface d'import
1. Connectez-vous à l'interface admin
2. Allez dans l'onglet **"Import"**
3. Cliquez sur **"Lancer l'import"**
4. Suivez la progression en temps réel

## 📋 Fonctionnalités

### ✅ Avantages
- **Pas de credentials requis** : Utilise l'authentification normale de l'application
- **Interface utilisateur** : Import visuel avec progression
- **Gestion d'erreurs** : Détection et affichage des erreurs par collection
- **Sous-collections** : Support des sous-collections (ex: `salesHistory/sales`)
- **Timestamps préservés** : Conversion automatique des timestamps Firebase

### 📊 Suivi de progression
- Nombre de collections détectées
- Nombre total de documents
- Progression en temps réel
- Résultats détaillés par collection

### 🔧 Gestion des erreurs
- Erreurs affichées par collection
- Statistiques d'import partielles
- Possibilité de relancer l'import

## 🗂️ Collections supportées

Toutes les collections du backup sont automatiquement détectées et importées :

- `admins` - Administrateurs
- `employees` - Employés
- `ranks` - Grades
- `sales` - Ventes
- `salesHistory` - Historique des ventes (avec sous-collection `sales`)
- `menuConfig` - Configuration du menu
- `organigramme` - Organigramme
- `loginHistory` - Historique des connexions
- `bonuses` - Bonus
- `menuSemaine` - Menu de la semaine
- `menuCategories` - Catégories de menu

## 🔒 Sécurité

- **Authentification requise** : Seuls les admins peuvent accéder à l'import
- **Permissions Firestore** : Respecte les règles de sécurité existantes
- **Validation côté client** : Vérification des données avant import

## 🛠️ Dépannage

### Le fichier backup-data.json n'existe pas
```bash
npm run prepare-client-data
```

### Erreur lors de l'import
- Vérifiez que vous êtes connecté en tant qu'admin
- Vérifiez les permissions Firestore
- Consultez la console du navigateur pour les détails d'erreur

### Import partiellement réussi
- Les collections déjà importées ne seront pas réimportées
- Utilisez la console Firebase pour nettoyer si nécessaire
- Relancez l'import pour les collections restantes

## 📝 Format des données

Le fichier `public/backup-data.json` contient :

```json
{
  "version": "1.0",
  "createdAt": "2025-01-10T...",
  "collections": {
    "admins": [...],
    "employees": [...],
    "ranks": [...],
    // ... autres collections
  }
}
```

## 🔄 Workflow recommandé

1. **Préparer les données** : `npm run prepare-client-data`
2. **Tester l'import** : Via l'interface admin (environnement de test)
3. **Importer en production** : Via l'interface admin (environnement réel)
4. **Vérifier** : Contrôler les données dans Firebase Console

## ⚡ Performance

- **Import par batches** : Utilise les capacités Firestore pour des imports efficaces
- **Progression temps réel** : Mise à jour de l'interface pendant l'import
- **Gestion mémoire** : Traitement optimisé pour éviter les timeouts

## 🔄 Différences avec l'import Admin SDK

| Aspect | Import Client | Import Admin SDK |
|--------|---------------|------------------|
| Credentials | Non requis | Requis |
| Authentification | Via app | Via service account |
| Environnement | Production | Local/développement |
| Sécurité | Règles Firestore | Contournement |
| Interface | GUI complète | Terminal uniquement |
| Erreurs | Visuelles | Logs console |