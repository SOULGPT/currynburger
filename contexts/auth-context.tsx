"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { User } from "@/types"
import { isFirebaseConfigured, getFirebaseAuth, getFirebaseDb } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  firebaseUser: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isConfigured: boolean
  continueAsGuest: () => void
  isGuest: boolean
  authError: string | null
  clearAuthError: () => void
  isFirebaseWorking: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const GUEST_USER: User = {
  id: "guest-user",
  name: "Guest User",
  email: "guest@demo.com",
  role: "customer",
  loyaltyPoints: 100,
  addresses: [],
  favorites: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

/** Map a Firebase user + Firestore data to our User type */
function buildUser(fbUser: any, data: Record<string, any>): User {
  return {
    id: fbUser.uid,
    email: fbUser.email || "",
    name: data.name || fbUser.displayName || "User",
    role: data.role || "customer",
    loyaltyPoints: data.loyaltyPoints || 0,
    addresses: data.addresses || [],
    favorites: data.favorites || [],
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  }
}

/** Upsert user document in Firestore after any OAuth sign-in */
async function upsertUserDoc(fbUser: any, db: any, dynamic: any) {
  const { doc, getDoc, setDoc, serverTimestamp } = dynamic
  const userDoc = await getDoc(doc(db, "users", fbUser.uid))
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", fbUser.uid), {
      email: fbUser.email || "",
      name: fbUser.displayName || "User",
      role: "customer",
      loyaltyPoints: 50,
      addresses: [],
      favorites: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return {
      role: "customer",
      loyaltyPoints: 50,
      addresses: [],
      favorites: [],
    }
  }
  return userDoc.data()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [configured] = useState(() => isFirebaseConfigured())
  const [available, setAvailable] = useState(false)
  const redirectHandled = useRef(false)

  const clearAuthError = useCallback(() => setAuthError(null), [])

  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | null = null

    const init = async () => {
      if (typeof window === "undefined") {
        if (mounted) setLoading(false)
        return
      }

      // Check for guest user
      try {
        const savedGuest = localStorage.getItem("guestUser")
        if (savedGuest === "true" && mounted) {
          setUser(GUEST_USER)
          setIsGuest(true)
          setLoading(false)
          return
        }
      } catch {}

      if (!configured) {
        if (mounted) setLoading(false)
        return
      }

      try {
        const [auth, db] = await Promise.all([getFirebaseAuth(), getFirebaseDb()])

        if (!auth || !db) {
          if (mounted) setLoading(false)
          return
        }

        if (mounted) setAvailable(true)

        const {
          onAuthStateChanged,
          getRedirectResult,
          GoogleAuthProvider,
          OAuthProvider,
        } = await import("firebase/auth")
        const firestoreDynamic = await import("firebase/firestore")

        // --- Handle redirect result (Google / Apple sign-in callback) ---
        if (!redirectHandled.current) {
          redirectHandled.current = true
          try {
            const result = await getRedirectResult(auth)
            if (result?.user) {
              await upsertUserDoc(result.user, db, firestoreDynamic)
              // onAuthStateChanged below will fire and set the user
            }
          } catch (err: any) {
            // redirect result errors (e.g. popup_closed) — non-fatal
            if (
              err?.code !== "auth/popup-closed-by-user" &&
              err?.code !== "auth/cancelled-popup-request"
            ) {
              console.warn("[Auth] getRedirectResult error:", err?.code, err?.message)
            }
          }
        }

        // --- Subscribe to auth state ---
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (!mounted) return

          try {
            setFirebaseUser(fbUser)

            if (fbUser) {
              const data = await upsertUserDoc(fbUser, db, firestoreDynamic)
              setUser(buildUser(fbUser, data))
            } else {
              setUser(null)
            }
          } catch (error) {
            console.error("Auth state error:", error)
          } finally {
            if (mounted) setLoading(false)
          }
        })
      } catch (error) {
        console.error("Firebase init error:", error)
        if (mounted) setLoading(false)
      }
    }

    init()

    const timeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 5000)

    return () => {
      mounted = false
      clearTimeout(timeout)
      if (unsubscribe) unsubscribe()
    }
  }, [configured])

  const continueAsGuest = useCallback(() => {
    setUser(GUEST_USER)
    setIsGuest(true)
    setAuthError(null)
    try {
      localStorage.setItem("guestUser", "true")
    } catch {}
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null)
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      const auth = await getFirebaseAuth()
      if (!auth) throw new Error("Auth not available")
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      const msg = error.message || "Failed to sign in"
      setAuthError(msg)
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setAuthError(null)
    try {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")

      const [auth, db] = await Promise.all([getFirebaseAuth(), getFirebaseDb()])
      if (!auth || !db) throw new Error("Firebase not available")

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        name,
        role: "customer",
        loyaltyPoints: 50,
        addresses: [],
        favorites: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (error: any) {
      const msg = error.message || "Failed to sign up"
      setAuthError(msg)
      throw error
    }
  }, [])

  /**
   * Google Sign-In
   * Uses signInWithRedirect which works correctly in Capacitor WKWebView.
   * signInWithPopup is intentionally NOT used — it's blocked by iOS WKWebView.
   */
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    try {
      const { GoogleAuthProvider, signInWithRedirect } = await import("firebase/auth")
      const auth = await getFirebaseAuth()
      if (!auth) throw new Error("Firebase not available")

      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      provider.addScope("email")
      provider.addScope("profile")

      // signInWithRedirect navigates away and returns via getRedirectResult on next load
      await signInWithRedirect(auth, provider)
    } catch (error: any) {
      const code = error?.code || ""
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setAuthError("Sign-in cancelled")
      } else {
        setAuthError(error.message || "Failed to sign in with Google")
      }
      throw error
    }
  }, [])

  /**
   * Apple Sign-In
   * Uses signInWithRedirect which works correctly in Capacitor WKWebView.
   */
  const signInWithApple = useCallback(async () => {
    setAuthError(null)
    try {
      const { OAuthProvider, signInWithRedirect } = await import("firebase/auth")
      const auth = await getFirebaseAuth()
      if (!auth) throw new Error("Firebase not available")

      const provider = new OAuthProvider("apple.com")
      provider.addScope("email")
      provider.addScope("name")

      await signInWithRedirect(auth, provider)
    } catch (error: any) {
      const code = error?.code || ""
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setAuthError("Sign-in cancelled")
      } else {
        setAuthError(error.message || "Failed to sign in with Apple")
      }
      throw error
    }
  }, [])

  const signOutUser = useCallback(async () => {
    setAuthError(null)
    try {
      const { signOut: firebaseSignOut } = await import("firebase/auth")
      const auth = await getFirebaseAuth()
      if (auth) await firebaseSignOut(auth)
    } catch {}
    setUser(null)
    setFirebaseUser(null)
    setIsGuest(false)
    try {
      localStorage.removeItem("guestUser")
    } catch {}
  }, [])

  const refreshUser = useCallback(async () => {
    if (!firebaseUser || !configured) return
    try {
      const { doc, getDoc } = await import("firebase/firestore")
      const db = await getFirebaseDb()
      if (db) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          setUser(buildUser(firebaseUser, userDoc.data()))
        }
      }
    } catch {}
  }, [firebaseUser, configured])

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithApple,
        signOut: signOutUser,
        logout: signOutUser,
        refreshUser,
        isConfigured: configured,
        continueAsGuest,
        isGuest,
        authError,
        clearAuthError,
        isFirebaseWorking: available,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
