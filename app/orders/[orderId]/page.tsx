import { TopNav } from "@/components/top-nav"
import { BottomNav } from "@/components/bottom-nav"
import { OrderTracking } from "@/components/orders/order-tracking"

export default async function OrderTrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pb-20 md:pb-8">
        <OrderTracking orderId={orderId} />
      </main>
      <BottomNav />
    </div>
  )
}
