import { TopNav } from "@/components/top-nav"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { MenuCategoryTabs } from "@/components/menu/menu-category-tabs"
import { MenuItemsGrid } from "@/components/menu/menu-items-grid"
import { MenuProvider } from "@/contexts/menu-context"

export default function MenuPage() {
  return (
    <MenuProvider>
      <div className="min-h-screen bg-white">
        <TopNav />
        
        {/* Header - Compact on mobile */}
        <header className="bg-[#E78A00] text-white py-4 md:py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-2xl md:text-4xl font-bold">Our Menu</h1>
            <p className="text-sm md:text-base text-white/90 mt-1">Fresh ingredients, bold flavors</p>
          </div>
        </header>

        {/* Category Tabs - Sticky */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <MenuCategoryTabs />
          </div>
        </div>

        {/* Menu Items */}
        <main className="max-w-7xl mx-auto px-4 py-4 pb-32 md:pb-8">
          <MenuItemsGrid />
        </main>
        
        <FloatingCartButton />
      </div>
    </MenuProvider>
  )
}
