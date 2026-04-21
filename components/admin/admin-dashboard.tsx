"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { OrdersManager } from "./orders-manager"
import { MenuManager } from "./menu-manager"
import { BranchManager } from "./branch-manager"
import { CouponManager } from "./coupon-manager"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { CustomersManager } from "./customers-manager"
import { InvoicesManager } from "./invoices-manager"
import { SettingsManager } from "./settings-manager"
import { IngredientManager } from "./ingredient-manager"
import { QRCodeGenerator } from "./qr-code-generator"
import { DealsPromotionsManager } from "./deals-promotions-manager"
import { CategoryManager } from "./category-manager"
import {
  Loader2,
  ShieldAlert,
  LayoutDashboard,
  ShoppingBag,
  Menu,
  Gift,
  Users,
  FileText,
  MapPin,
  BarChart3,
  Settings,
  Bell,
  User,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Utensils,
  QrCode,
  Ticket,
  FolderOpen,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const menuItems = [
  { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders Management", icon: ShoppingBag },
  { id: "menu", label: "Menu Management", icon: Menu },
  { id: "categories", label: "Menu Categories", icon: FolderOpen },
  { id: "ingredients", label: "Ingredients", icon: Utensils },
  { id: "qr-codes", label: "QR Code Generator", icon: QrCode },
  { id: "deals", label: "Offers & Promotions", icon: Gift },
  { id: "coupons", label: "Coupon Codes", icon: Ticket },
  { id: "customers", label: "Customers", icon: Users },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "branches", label: "Branches", icon: MapPin },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

export function AdminDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        router.push("/auth/login?redirect=/admin")
      } else if (user.role !== "admin") {
        router.push("/")
      }
    }
  }, [user, loading, router, mounted])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [activeSection])

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin dashboard.
            <Button
              variant="link"
              className="p-0 h-auto text-destructive-foreground underline ml-1"
              onClick={() => router.push("/auth/login?redirect=/admin")}
            >
              Login as admin
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <AnalyticsDashboard />
          </div>
        )
      case "orders":
        return <OrdersManager />
      case "menu":
        return <MenuManager />
      case "categories":
        return <CategoryManager />
      case "ingredients":
        return <IngredientManager />
      case "qr-codes":
        return <QRCodeGenerator />
      case "deals":
        return <DealsPromotionsManager />
      case "coupons":
        return <CouponManager />
      case "customers":
        return <CustomersManager />
      case "invoices":
        return <InvoicesManager />
      case "branches":
        return <BranchManager />
      case "analytics":
        return <AnalyticsDashboard />
      case "settings":
        return <SettingsManager />
      default:
        return <AnalyticsDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r transition-all duration-300 flex flex-col z-50",
          "fixed lg:relative inset-y-0 left-0",
          sidebarCollapsed ? "w-16" : "w-64",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          {!sidebarCollapsed && (
            <div>
              <h2 className="font-bold text-lg text-primary">Curry&Burger</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto hidden lg:flex"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-3", sidebarCollapsed && "justify-center px-2")}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </Button>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-xl font-semibold truncate max-w-[200px] md:max-w-none">
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
            </Button>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="hidden md:flex">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 md:px-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium">{user.name || "Admin"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveSection("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
