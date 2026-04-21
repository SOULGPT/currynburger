import { TopNav } from "@/components/top-nav"
import { OrdersList } from "@/components/orders/orders-list"

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pb-20 md:pb-8">
        <div className="container px-4 py-8 mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Orders</h1>
          <OrdersList />
        </div>
      </main>
    </div>
  )
}
