import { getDb } from './useFirebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
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

