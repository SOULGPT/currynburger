import "server-only"
import { initializeApp, getApps, cert, getApp, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminDb: Firestore | null = null

function initializeFirebaseAdmin() {
  if (adminApp) return { adminApp, adminAuth, adminDb }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    return { adminApp: null, adminAuth: null, adminDb: null }
  }

  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }

    adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApp()
    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)

    return { adminApp, adminAuth, adminDb }
  } catch (error) {
    return { adminApp: null, adminAuth: null, adminDb: null }
  }
}

// Initialize on module load
const initialized = initializeFirebaseAdmin()
adminApp = initialized.adminApp
adminAuth = initialized.adminAuth
adminDb = initialized.adminDb

export { adminApp, adminAuth, adminDb }
