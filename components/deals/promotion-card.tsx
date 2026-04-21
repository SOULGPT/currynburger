"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tag } from "lucide-react"
import type { Promotion } from "@/types"
import { format } from "@/lib/date-utils"
import Link from "next/link"

interface PromotionCardProps {
  promotion: Promotion
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-[#E78A00]/20">
      <div className="relative overflow-hidden">
        <img
          src={promotion.imageUrl || "/placeholder.svg"}
          alt={promotion.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-[#E78A00] text-white text-sm font-bold px-3 py-1">
          <Tag className="w-3 h-3 mr-1" />
          {promotion.discount}
        </Badge>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 text-balance">{promotion.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 text-pretty">{promotion.description}</p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Calendar className="w-4 h-4" />
          <span>Valid until {promotion.validUntil && format(promotion.validUntil)}</span>
        </div>

        <Link href="/menu">
          <Button className="w-full bg-[#E78A00] hover:bg-[#C67500] text-white">Order Now</Button>
        </Link>
      </div>
    </Card>
  )
}
