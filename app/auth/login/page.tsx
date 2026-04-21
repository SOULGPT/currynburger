"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const { signIn, signInWithGoogle, signInWithApple, continueAsGuest, isConfigured, user, authError, clearAuthError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const redirect = searchParams.get("redirect") || "/"

  useEffect(() => {
    if (user) {
      toast({
        title: "Welcome!",
        description: "You've successfully signed in",
      })
      router.push(redirect)
    }
  }, [user, router, redirect, toast])

  useEffect(() => {
    return () => clearAuthError()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearAuthError()

    try {
      await signIn(email, password)
    } catch (error: any) {
      // Error is handled in context
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    clearAuthError()
    try {
      await signInWithGoogle()
    } catch (error: any) {
      // Error is handled in context
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setAppleLoading(true)
    clearAuthError()
    try {
      await signInWithApple()
    } catch (error: any) {
      // Error is handled in context
    } finally {
      setAppleLoading(false)
    }
  }

  const handleGuestMode = () => {
    continueAsGuest()
    toast({
      title: "Welcome!",
      description: "You're now browsing as a guest",
    })
    router.push(redirect)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F3] via-[#FFF5E8] to-[#FFE8CC] dark:from-background dark:via-background dark:to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E78A00] to-[#7B1E2D] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">C&B</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">Sign in to your Curry&Burger account</p>
        </div>

        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearAuthError()
              }}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearAuthError()
              }}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white"
            disabled={loading || googleLoading || appleLoading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full bg-black text-white hover:bg-gray-900 border-none"
            onClick={handleAppleSignIn}
            disabled={loading || googleLoading || appleLoading}
          >
            {appleLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.1-44.6-35.9-2.8-74.3 22.7-93.1 22.7-18.9 0-46.5-20.9-82.8-20.9-53 0-96.1 40.5-108.6 81.8-15.6 51.6 11.8 114.8 45.3 162.9 16.6 24.2 36.3 52.4 65.1 51.6 27.6-.8 38.6-17.7 73.1-17.7 34.3 0 44 17.7 74.2 17.7 28.9 0 46.5-25.1 62.7-49.5 19.3-28.8 27.1-56.7 27.7-58.1-1.9-1.2-39.4-15.1-39.5-61.1zM218.6 110.1c15-18.2 25.1-43.5 22.4-68.8-22.1 1-49.3 14.8-64.7 33.3-13.6 16.3-25.2 42.1-22 66.8 24.6 2 49.3-13.1 64.3-31.3z" />
                </svg>
                Continue with Apple
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleGuestMode}
            disabled={loading || googleLoading || appleLoading}
          >
            Continue as Guest
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-[#E78A00] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
