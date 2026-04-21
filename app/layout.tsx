import type React from "react"
import type { Metadata, Viewport } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { BottomNav } from "@/components/bottom-nav"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Curry&Burger - Taste the Fusion!",
  description: "Delicious fusion of curry and burger. Order now for pickup or delivery!",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Curry&Burger",
  },
  openGraph: {
    type: "website",
    title: "Curry&Burger - Taste the Fusion!",
    description: "Delicious fusion of curry and burger. Order now for pickup or delivery!",
    siteName: "Curry&Burger",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Curry&Burger Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Curry&Burger - Taste the Fusion!",
    description: "Delicious fusion of curry and burger. Order now for pickup or delivery!",
    images: ["/icon-512.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#E07B39",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body className="font-sans bg-white text-foreground min-h-screen">
        <AuthProvider>
          <CartProvider>
            {children}
            <BottomNav />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
