import type { LoyaltyTierInfo, CustomOption, FriesOption } from "@/types"

export const LOYALTY_TIERS: LoyaltyTierInfo[] = [
  {
    name: "Classic",
    minPoints: 0,
    benefits: ["Earn 1 point per €1", "Birthday surprise"],
    color: "#6B6B6B",
  },
  {
    name: "Gold",
    minPoints: 500,
    benefits: ["Earn 1.5 points per €1", "Priority support", "Exclusive deals"],
    color: "#E78A00",
  },
  {
    name: "Platinum",
    minPoints: 1500,
    benefits: ["Earn 2 points per €1", "Free delivery", "VIP events", "Special gifts"],
    color: "#7B1E2D",
  },
]

export const POINTS_PER_EURO = 1
export const REDEEM_RATE = 100 // 100 points = €1 discount

export const ORDER_STATUS_LABELS = {
  placed: "Order Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export const MENU_CATEGORIES = [
  "In evidenza",
  "Burger",
  "Wrap",
  "French Tacos",
  "Naan Combo",
  "Grigliate",
  "Chicken Combo",
  "Insalate",
  "Snaks",
  "Family Deal",
  "Dolci",
  "Bevande",
  "Patatine",
]

export const CUSTOMIZATION_OPTIONS: CustomOption[] = [
  { id: "extra-cheese", name: "Extra Cheese", priceEur: 1.5, category: "cheese" },
  { id: "spicy-sauce", name: "Spicy Sauce", priceEur: 0.5, category: "sauce" },
  { id: "double-patty", name: "Double Patty", priceEur: 3.0, category: "patty" },
  { id: "extra-mayo", name: "Extra Mayo", priceEur: 0.5, category: "sauce" },
  { id: "extra-ketchup", name: "Extra Ketchup", priceEur: 0.0, category: "sauce" },
  { id: "extra-mustard", name: "Extra Mustard", priceEur: 0.0, category: "sauce" },
  { id: "extra-pickles", name: "Extra Pickles", priceEur: 0.5, category: "veggie" },
  { id: "extra-onions", name: "Extra Onions", priceEur: 0.0, category: "veggie" },
  { id: "extra-lettuce", name: "Extra Lettuce", priceEur: 0.0, category: "veggie" },
  { id: "extra-tomato", name: "Extra Tomato", priceEur: 0.5, category: "veggie" },
  { id: "extra-jalapenos", name: "Extra Jalapeños", priceEur: 0.5, category: "veggie" },
  { id: "extra-bagels", name: "Extra Bagels", priceEur: 0.5, category: "extra" },
]

export const REMOVABLE_ITEMS = [
  { id: "lettuce", name: "Lettuce" },
  { id: "tomato", name: "Tomato" },
  { id: "onion", name: "Onion" },
  { id: "cheese", name: "Cheese" },
  { id: "mayo", name: "Mayo" },
  { id: "sauce", name: "Sauce" },
  { id: "pickles", name: "Pickles" },
]

export const FRIES_OPTIONS: FriesOption[] = [
  { size: "small", name: "Small Fries", extraPrice: 0 },
  { size: "medium", name: "Medium Fries", extraPrice: 0.5 },
  { size: "large", name: "Large Fries", extraPrice: 1.5 },
]

export const DRINKS_OPTIONS = [
  "Coca-Cola",
  "Coca-Cola Zero",
  "Fanta",
  "Sprite",
  "Pepsi",
  "Water",
  "Orange Juice",
  "Apple Juice",
  "Iced Tea",
]

export const DEFAULT_INGREDIENTS = {
  burger: ["lettuce", "tomato", "onion", "cheese", "sauce", "pickles"],
  wrap: ["lettuce", "tomato", "onion", "sauce"],
  tacos: ["lettuce", "tomato", "cheese", "sauce"],
  naan: ["onion", "sauce", "cheese"],
}

export const MAX_REMOVAL_DISCOUNT = 2.0

export const EXTRA_FRIES_PRICE = 2.5
export const EXTRA_DRINKS_PRICE = 2.0
