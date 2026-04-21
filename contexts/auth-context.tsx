"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [configured] = useState(() => isFirebaseConfigured())
  const [available, setAvailable] = useState(false)

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
        // Get Firebase instances
        const [auth, db] = await Promise.all([getFirebaseAuth(), getFirebaseDb()])

        if (!auth || !db) {
          if (mounted) setLoading(false)
          return
        }

        if (mounted) setAvailable(true)

        // Dynamic import for auth listener
        const { onAuthStateChanged } = await import("firebase/auth")
        const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore")

        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (!mounted) return

          try {
            setFirebaseUser(fbUser)

            if (fbUser) {
              const userDoc = await getDoc(doc(db, "users", fbUser.uid))

              if (userDoc.exists()) {
                const data = userDoc.data()
                setUser({
                  id: fbUser.uid,
                  email: fbUser.email || "",
                  name: data.name || fbUser.displayName || "User",
                  role: data.role || "customer",
                  loyaltyPoints: data.loyaltyPoints || 0,
                  addresses: data.addresses || [],
                  favorites: data.favorites || [],
                  createdAt: data.createdAt?.toDate() || new Date(),
                  updatedAt: data.updatedAt?.toDate() || new Date(),
                })
              } else {
                await setDoc(doc(db, "users", fbUser.uid), {
                  email: fbUser.email,
                  name: fbUser.displayName || "User",
                  role: "customer",
                  loyaltyPoints: 50,
                  addresses: [],
                  favorites: [],
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                })

                setUser({
                  id: fbUser.uid,
                  email: fbUser.email || "",
                  name: fbUser.displayName || "User",
                  role: "customer",
                  loyaltyPoints: 50,
                  addresses: [],
                  favorites: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
              }
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

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false)
    }, 3000)

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

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth")
      const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore")

      const [auth, db] = await Promise.all([getFirebaseAuth(), getFirebaseDb()])
      if (!auth || !db) throw new Error("Firebase not available")

      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })

      const result = await signInWithPopup(auth, provider)

      const userDoc = await getDoc(doc(db, "users", result.user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email,
          name: result.user.displayName || "User",
          role: "customer",
          loyaltyPoints: 50,
          addresses: [],
          favorites: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in cancelled")
      } else if (error.code === "auth/popup-blocked") {
        setAuthError("Pop-up blocked. Please allow pop-ups.")
      } else {
        setAuthError(error.message || "Failed to sign in with Google")
      }
      throw error
    }
  }, [])

  const signInWithApple = useCallback(async () => {
    setAuthError(null)
    try {
      const { OAuthProvider, signInWithPopup } = await import("firebase/auth")
      const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore")

      const [auth, db] = await Promise.all([getFirebaseAuth(), getFirebaseDb()])
      if (!auth || !db) throw new Error("Firebase not available")

      const provider = new OAuthProvider("apple.com")
      provider.addScope("email")
      provider.addScope("name")

      const result = await signInWithPopup(auth, provider)

      const userDoc = await getDoc(doc(db, "users", result.user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email || "",
          name: result.user.displayName || "User",
          role: "customer",
          loyaltyPoints: 50,
          addresses: [],
          favorites: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in cancelled")
      } else if (error.code === "auth/popup-blocked") {
        setAuthError("Pop-up blocked. Please allow pop-ups.")
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
          const data = userDoc.data()
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: data.name || "User",
            role: data.role || "customer",
            loyaltyPoints: data.loyaltyPoints || 0,
            addresses: data.addresses || [],
            favorites: data.favorites || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          })
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
