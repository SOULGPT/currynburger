import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage, getFirebaseApp, isFirebaseConfigured } from "./firebase"

// Safe exports that use lazy initialization
export { getFirebaseAuth, getFirebaseDb, getFirebaseStorage, getFirebaseApp, isFirebaseConfigured }

// Helper to get db with runtime check
export function getSafeDb() {
  const db = getFirebaseDb()
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your Firebase configuration.")
  }
  return db
}

// Helper to get auth with runtime check
export function getSafeAuth() {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Please check your Firebase configuration.")
  }
  return auth
}

// Helper to get storage with runtime check
export function getSafeStorage() {
  const storage = getFirebaseStorage()
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Please check your Firebase configuration.")
  }
  return storage
}

// Re-export for convenience
export const db = getFirebaseDb()
export const auth = getFirebaseAuth()
export const storage = getFirebaseStorage()
export const app = getFirebaseApp()
