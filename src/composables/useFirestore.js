import { getDb } from './useFirebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

export function useFirestore() {
  const db = getDb()

  // Helpers pour les dates
  const formatDate = (date) => {
    if (!date) return '-'
    const d = date.toDate ? date.toDate() : new Date(date)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  const formatDateInput = (date) => {
    if (!date) return ''
    const d = date.toDate ? date.toDate() : new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateTimeLocal = (date) => {
    if (!date) return ''
    const d = date.toDate ? date.toDate() : new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Helpers pour convertir les timestamps
  const toTimestamp = (date) => {
    if (date instanceof Date) {
      return Timestamp.fromDate(date)
    }
    if (typeof date === 'string') {
      return Timestamp.fromDate(new Date(date))
    }
    return Timestamp.now()
  }

  // Fonctions génériques
  const getAll = async (collectionName, orderByField = null) => {
    try {
      let q = collection(db, collectionName)
      if (orderByField) {
        q = query(q, orderBy(orderByField))
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error(`Erreur lors du chargement de ${collectionName}:`, error)
      return []
    }
  }

  const getById = async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${collectionName}/${id}:`, error)
      return null
    }
  }

  const create = async (collectionName, data) => {
    try {
      const dataWithTimestamp = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp)
      return docRef.id
    } catch (error) {
      console.error(`Erreur lors de la création dans ${collectionName}:`, error)
      throw error
    }
  }

  const update = async (collectionName, id, data) => {
    try {
      const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp()
      }
      await updateDoc(doc(db, collectionName, id), dataWithTimestamp)
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${collectionName}/${id}:`, error)
      throw error
    }
  }

  const remove = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id))
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${collectionName}/${id}:`, error)
      throw error
    }
  }

  // Fonction pour supprimer toutes les données d'une collection
  const clearCollection = async (collectionName) => {
    try {
      console.log(`🗑️  Suppression des données existantes dans ${collectionName}...`)

      // Récupérer tous les documents de la collection
      const querySnapshot = await getDocs(collection(db, collectionName))

      if (querySnapshot.empty) {
        console.log(`ℹ️  Aucune donnée à supprimer dans ${collectionName}`)
        return 0
      }

      // Supprimer tous les documents par batches de 10 (limite Firestore)
      const batchSize = 10
      let deletedCount = 0
      const batches = []

      querySnapshot.forEach((doc) => {
        const batchIndex = Math.floor(deletedCount / batchSize)
        if (!batches[batchIndex]) {
          batches[batchIndex] = writeBatch(db)
        }

        batches[batchIndex].delete(doc.ref)
        deletedCount++

        // Committer le batch tous les 10 documents
        if (deletedCount % batchSize === 0) {
          const currentBatchIndex = batchIndex
          batches[currentBatchIndex].commit()
        }
      })

      // Committer le dernier batch s'il reste des documents
      if (batches.length > 0 && deletedCount % batchSize !== 0) {
        await batches[batches.length - 1].commit()
      }

      console.log(`✅ ${deletedCount} documents supprimés dans ${collectionName}`)
      return deletedCount
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de ${collectionName}:`, error)
      throw error
    }
  }

  // Fonction d'import des données backup
  const importBackupData = async (onProgress = null) => {
    try {
      console.log('🚀 Début de l\'import des données backup...')

      // Charger les données du backup
      const response = await fetch('/backup-data.json')
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const backupData = await response.json()
      console.log(`📦 Données chargées: ${backupData.collections ? Object.keys(backupData.collections).length : 0} collections`)

      if (!backupData.collections) {
        throw new Error('Format de données invalide')
      }

      const results = {
        totalCollections: 0,
        totalDocuments: 0,
        importedCollections: 0,
        importedDocuments: 0,
        clearedCollections: 0,
        clearedDocuments: 0,
        errors: []
      }

      // Convertir les objets timestamp en Timestamp Firebase
      const convertTimestamp = (timestampObj) => {
        if (!timestampObj || !timestampObj.seconds) return serverTimestamp()
        return new Timestamp(timestampObj.seconds, timestampObj.nanoseconds || 0)
      }

      // Importer chaque collection
      for (const [collectionName, documents] of Object.entries(backupData.collections)) {
        results.totalCollections++
        const collectionDocs = documents.length

        console.log(`📁 Import de ${collectionName} (${collectionDocs} documents)...`)
        onProgress?.(`Nettoyage de ${collectionName}...`)

        let importedCount = 0

        try {
          // Étape 1: Supprimer toutes les données existantes
          const clearedCount = await clearCollection(collectionName)
          results.clearedCollections++
          results.clearedDocuments += clearedCount

          // Étape 2: Importer les nouvelles données
          onProgress?.(`Import de ${collectionName}...`)
          if (collectionName === 'salesHistory') {
            // Gestion spéciale pour salesHistory avec sous-collection
            for (const doc of documents) {
              const docData = { ...doc }

              // Convertir les timestamps
              if (docData.createdAt) docData.createdAt = convertTimestamp(docData.createdAt)
              if (docData.updatedAt) docData.updatedAt = convertTimestamp(docData.updatedAt)
              if (docData.date) docData.date = convertTimestamp(docData.date)

              // Créer le document principal
              const docRef = await addDoc(collection(db, collectionName), docData)

              // Importer la sous-collection sales si elle existe
              if (doc.sales && Array.isArray(doc.sales)) {
                for (const sale of doc.sales) {
                  const saleData = { ...sale }
                  if (saleData.createdAt) saleData.createdAt = convertTimestamp(saleData.createdAt)
                  if (saleData.updatedAt) saleData.updatedAt = convertTimestamp(saleData.updatedAt)

                  await addDoc(collection(db, `${collectionName}/${docRef.id}/sales`), saleData)
                }
              }

              importedCount++
            }
          } else {
            // Import normal pour les autres collections
            for (const doc of documents) {
              const docData = { ...doc }

              // Convertir les timestamps
              if (docData.createdAt) docData.createdAt = convertTimestamp(docData.createdAt)
              if (docData.updatedAt) docData.updatedAt = convertTimestamp(docData.updatedAt)
              if (docData.date) docData.date = convertTimestamp(docData.date)

              await addDoc(collection(db, collectionName), docData)
              importedCount++
            }
          }

          results.importedCollections++
          results.importedDocuments += importedCount
          results.totalDocuments += collectionDocs

          console.log(`✅ ${collectionName}: ${importedCount}/${collectionDocs} documents importés`)

        } catch (error) {
          console.error(`❌ Erreur lors de l'import de ${collectionName}:`, error)
          results.errors.push({
            collection: collectionName,
            error: error.message,
            imported: importedCount,
            total: collectionDocs
          })
        }
      }

      console.log('🎉 Import terminé!')
      console.log(`📊 Résultats: ${results.importedDocuments}/${results.totalDocuments} documents importés dans ${results.importedCollections}/${results.totalCollections} collections`)

      return results

    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error)
      throw error
    }
  }

  // Fonctions spécifiques
  const getAllEmployees = async () => {
    return getAll('employees', 'name')
  }

  const getEmployeeById = async (employeeId) => {
    if (!employeeId) return null
    return getById('employees', employeeId)
  }

  const getAllRanks = async () => {
    return getAll('ranks', 'name')
  }

  const getRankById = async (rankId) => {
    if (!rankId) return null
    return getById('ranks', rankId)
  }

  return {
    db,
    formatDate,
    formatDateInput,
    formatDateTimeLocal,
    toTimestamp,
    getAll,
    getById,
    create,
    update,
    remove,
    importBackupData,
    getAllEmployees,
    getEmployeeById,
    getAllRanks,
    getRankById,
    onSnapshot,
    collection: (name) => collection(db, name),
    query,
    orderBy,
    Timestamp,
    serverTimestamp
  }
}

