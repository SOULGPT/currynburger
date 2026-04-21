import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function MenuItemsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
