"use client"

import Link from "next/link"
import { MapPin, Tag, Clock, Star } from "lucide-react"
import { Card } from "@/components/ui/card"

const actions = [
  {
    icon: MapPin,
    label: "Find Nearby",
    href: "/branches",
    color: "from-[#E78A00] to-[#C67500]",
  },
  {
    icon: Tag,
    label: "Hot Deals",
    href: "/deals",
    color: "from-[#7B1E2D] to-[#5A1620]",
  },
  {
    icon: Clock,
    label: "Track Order",
    href: "/orders",
    color: "from-[#00C897] to-[#00A67D]",
  },
  {
    icon: Star,
    label: "Rewards",
    href: "/profile",
    color: "from-[#E78A00] to-[#7B1E2D]",
  },
]

export function QuickActions() {
  return (
    <section className="container px-4 py-8 mx-auto -mt-8 relative z-10">
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link key={action.label} href={action.href}>
              <Card
                className="p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-[#E78A00]/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 mx-auto mb-2 md:mb-3 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center transition-transform hover:scale-110 duration-300`}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <p className="text-xs md:text-sm font-semibold text-foreground">{action.label}</p>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
