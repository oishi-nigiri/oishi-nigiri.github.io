# Importation du Backup Firebase

Ce guide explique comment importer les données du fichier `backup-2026-01-10.json` dans votre base de données Firebase.

## Prérequis

1. **Firebase Admin SDK** : Le script utilise Firebase Admin SDK pour accéder directement à Firestore.
2. **Variables d'environnement** : Vous devez configurer les variables d'environnement Firebase.

## Configuration des variables d'environnement

Vous devez créer un compte de service Firebase et configurer les variables suivantes :

### Création d'un compte de service

1. Allez dans la [Console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet "oishi-nigiri"
3. Cliquez sur l'icône "⚙️" (Paramètres) > "Paramètres du projet"
4. Allez dans l'onglet "Comptes de service"
5. Cliquez sur "Générer une nouvelle clé privée"
6. Téléchargez le fichier JSON

### Variables d'environnement à configurer

Extrayez les valeurs du fichier JSON téléchargé et configurez ces variables d'environnement :

```bash
FIREBASE_PRIVATE_KEY_ID=votre_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nvotre_clé_privée\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=votre_client_email
FIREBASE_CLIENT_ID=votre_client_id
FIREBASE_CLIENT_X509_CERT_URL=votre_client_x509_cert_url
```

**Important :** La clé privée doit être sur une seule ligne avec `\n` pour les sauts de ligne.

### Configuration sous Windows (PowerShell)

```powershell
$env:FIREBASE_PRIVATE_KEY_ID="votre_private_key_id"
$env:FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nvotre_clé_privée\n-----END PRIVATE KEY-----\n"
$env:FIREBASE_CLIENT_EMAIL="votre_client_email"
$env:FIREBASE_CLIENT_ID="votre_client_id"
$env:FIREBASE_CLIENT_X509_CERT_URL="votre_client_x509_cert_url"
```

### Configuration sous Linux/Mac

```bash
export FIREBASE_PRIVATE_KEY_ID="votre_private_key_id"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nvotre_clé_privée\n-----END PRIVATE KEY-----\n"
export FIREBASE_CLIENT_EMAIL="votre_client_email"
export FIREBASE_CLIENT_ID="votre_client_id"
export FIREBASE_CLIENT_X509_CERT_URL="votre_client_x509_cert_url"
```

## Installation des dépendances

```bash
npm install
```

Le script d'importation utilise `firebase-admin` qui a été ajouté comme dépendance de développement.

## Exécution de l'importation

Une fois les variables d'environnement configurées :

```bash
npm run import-backup
```

## Collections importées

Le script importe automatiquement toutes les collections suivantes depuis le backup :

- **admins** : Administrateurs du système
- **employees** : Employés du restaurant
- **ranks** : Rangs/grades des employés
- **sales** : Ventes
- **salesHistory** : Historique des ventes (avec sous-collection sales)
- **menuConfig** : Configuration du menu
- **organigramme** : Organigramme
- **loginHistory** : Historique des connexions

## Gestion des timestamps

Le script convertit automatiquement les objets timestamp du backup (avec `seconds` et `nanoseconds`) en objets `Timestamp` Firebase natifs.

## Gestion des sous-collections

Pour la collection `salesHistory`, le script importe également la sous-collection `sales` associée à chaque document.

## Sécurité

⚠️ **Attention :** Ce script contourne les règles de sécurité Firestore car il utilise Firebase Admin SDK. Assurez-vous de ne l'exécuter que dans un environnement sécurisé et de supprimer les variables d'environnement après usage.

## Dépannage

### Erreur "Invalid credentials"

Vérifiez que toutes les variables d'environnement sont correctement configurées et que la clé privée est bien formatée.

### Erreur "Quota exceeded"

Firestore limite les opérations par seconde. Le script utilise des batches de 500 opérations, mais si vous avez beaucoup de données, l'importation peut prendre du temps.

### Erreur "Collection not found"

Les collections sont créées automatiquement lors de l'importation des premiers documents.

## Vérification de l'importation

Après l'importation, vous pouvez vérifier les données dans la [Console Firebase](https://console.firebase.google.com/) > Firestore Database.