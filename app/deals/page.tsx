import { TopNav } from "@/components/top-nav"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { DealsContent } from "@/components/deals/deals-content"

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pb-20 md:pb-8">
        <div className="container px-4 py-8 mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Hot Deals</h1>
            <p className="text-lg text-muted-foreground">Save big on your favorite meals</p>
          </div>
          <DealsContent />
        </div>
      </main>
      <FloatingCartButton />
    </div>
  )
}
