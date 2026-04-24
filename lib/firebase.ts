// This prevents the "Failed to load firebase" error in v0 preview

type FirebaseApp = any
type Auth = any
type Firestore = any
type FirebaseStorage = any

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  // For Capacitor iOS, authDomain must be the hosted app URL (not fumiav2.firebaseapp.com)
  // so that signInWithRedirect can complete the OAuth callback properly.
  // Add curryandburger.vercel.app to Firebase Console → Auth → Authorized Domains.
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_HOSTING_URL || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

export const isFirebaseConfigured = (): boolean => {
  return !!(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId)
}

let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null
let _storage: FirebaseStorage | null = null
let _isInitialized = false
let _initPromise: Promise<boolean> | null = null
let _hasLoggedFailure = false

async function initFirebase(): Promise<boolean> {
  if (_isInitialized && _app && _db) {
    return true
  }

  if (typeof window === "undefined") return false
  if (!isFirebaseConfigured()) {
    if (!_hasLoggedFailure) {
      _hasLoggedFailure = true
    }
    return false
  }

  try {
    const { initializeApp, getApps, getApp } = await import("firebase/app")
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig)

    const { getFirestore } = await import("firebase/firestore")
    _db = getFirestore(_app)

    _isInitialized = true
    return true
  } catch (e) {
    if (!_hasLoggedFailure) {
      _hasLoggedFailure = true
    }
    return false
  }
}

export async function waitForFirebase(maxRetries = 3): Promise<boolean> {
  if (_isInitialized && _db) return true
  if (typeof window === "undefined") return false
  if (!isFirebaseConfigured()) return false
  if (_hasLoggedFailure) return false

  for (let i = 0; i < maxRetries; i++) {
    if (!_initPromise) {
      _initPromise = initFirebase()
    }

    const result = await _initPromise
    if (result && _db) return true

    // Reset and retry
    _initPromise = null
    await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)))
  }

  return false
}

// Auto-initialize on module load
if (typeof window !== "undefined" && isFirebaseConfigured()) {
  _initPromise = initFirebase()
}

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  await waitForFirebase()
  return _app
}

export async function getFirebaseAuth(): Promise<Auth | null> {
  if (_auth) return _auth
  const app = await getFirebaseApp()
  if (!app) return null

  try {
    const { getAuth } = await import("firebase/auth")
    _auth = getAuth(app)
    return _auth
  } catch {
    return null
  }
}

export async function getFirebaseDb(): Promise<Firestore | null> {
  const ready = await waitForFirebase()
  if (!ready) return null
  return _db
}

export async function getFirebaseStorage(): Promise<FirebaseStorage | null> {
  if (_storage) return _storage
  const app = await getFirebaseApp()
  if (!app) return null

  try {
    const { getStorage } = await import("firebase/storage")
    _storage = getStorage(app)
    return _storage
  } catch {
    return null
  }
}

export function getFirebaseDbSync(): Firestore | null {
  return _db
}

export function getFirebaseAuthSync(): Auth | null {
  return _auth
}

export const app = null
export const auth = null
export const db = null
export const storage = null

export const isFirebaseAvailable = (): boolean => {
  return !!_app && !!_db
}

export type FirebaseUser = {
  uid: string
  email: string | null
  displayName: string | null
}
