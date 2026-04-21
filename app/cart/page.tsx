import { TopNav } from "@/components/top-nav"
import { CartContent } from "@/components/cart/cart-content"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pb-20 md:pb-8">
        <div className="container px-4 py-8 mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">Your Cart</h1>
          <CartContent />
        </div>
      </main>
    </div>
  )
}
