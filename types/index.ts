export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "customer" | "admin" | "staff"
  loyaltyPoints: number
  addresses: Address[]
  favorites: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  label: string
  street: string
  city: string
  postalCode: string
  lat?: number
  lng?: number
  isDefault: boolean
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  lat: number
  lng: number
  openHours: {
    [key: string]: { open: string; close: string }
  }
  isActive: boolean
}

export interface MenuCategory {
  id: string
  name: string
  description?: string
  order: number
  imageUrl?: string
  published?: boolean
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description?: string
  priceEur: number
  imageUrl: string
  available: boolean
  published?: boolean
  orderCount?: number
  notes?: string
  customizable?: boolean // New field
  ingredients?: string[] // Array of ingredient IDs
  allowedRemovals?: string[] // Ingredients that can be removed for free
  customOptions?: CustomOption[] // Available extras with prices
  customizations?: Customization[]
  preparationTime?: number
  calories?: number
  allergens?: string[]
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  spicyLevel?: number
}

export interface CustomOption {
  id: string
  name: string
  priceEur: number
  category: "extra" | "sauce" | "patty" | "cheese" | "veggie"
}

export interface Customization {
  id: string
  name: string
  options: CustomizationOption[]
  required: boolean
  maxSelections: number
}

export interface CustomizationOption {
  id: string
  name: string
  priceEur: number
}

export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  customizations: SelectedCustomization[]
  ingredientCustomizations?: IngredientCustomization[] // New field
  spiceLevel?: "no-spicy" | "mild" | "regular" | "extra" // Spice level for Indian/Pakistani dishes
  note?: string // Added note field for customer instructions
  isDeal?: boolean
  dealId?: string
  dealTitle?: string
  dealSelections?: DealSelection[]
  removedItems?: string[]
  totalPrice: number
}

export interface DealSelection {
  category: string
  itemName: string
  size?: string
  extras?: string[]
  extraPrice: number
}

export interface SelectedCustomization {
  customizationId: string
  customizationName: string
  options: CustomizationOption[]
}

export interface Order {
  id: string
  userId: string
  branchId: string
  items: CartItem[]
  totalEur: number
  status: OrderStatus
  type: "pickup" | "delivery" | "dinein" // Added "dinein" type
  tableNumber?: string // Added table number for dine-in orders
  address?: Address | null
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod?: string
  couponCode?: string | null
  discount?: number
  loyaltyPointsUsed?: number
  loyaltyPointsEarned?: number
  note?: string // Added note field for order-level instructions
  estimatedTime?: Date
  courierLocation?: { lat: number; lng: number }
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = "placed" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled"

export interface Promotion {
  id: string
  title: string
  description: string
  imageUrl: string
  discount: string
  validUntil: Date
  validFrom?: Date
  active: boolean
  priority?: number
  items?: PromotionItem[]
}

export interface PromotionItem {
  id: string
  menuItemId?: string // Link to actual menu item
  name: string
  category: string
  quantity: number
  imageUrl?: string
  required: boolean // Is this item required or optional?
  includedInPrice: boolean // Is this included in deal price or extra?
  extraPrice?: number // Extra price if not included
}

export interface Coupon {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  validFrom: Date
  validTo: Date
  active: boolean
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount?: number
  usagePerCustomer: "single" | "unlimited" // Can customer use this coupon once or multiple times
  usedBy?: string[] // Array of user IDs who have used this coupon
}

export interface Deal {
  id: string
  title: string
  description: string
  imageUrl: string
  priceEur: number
  originalPriceEur: number
  discount: string
  validUntil: Date
  validFrom?: Date
  active: boolean
  items: DealItem[]
  category: string
  priority?: number
  requiresMainItem?: boolean
  requiresFries?: boolean
  requiresDrink?: boolean
  friesOptions?: FriesOption[]
  drinksOptions?: string[]
  minusPriceOnRemoved?: number // Max discount when removing items (default €2)
}

export interface DealItem {
  id: string
  menuItemId?: string // Link to actual menu item from menu_items collection
  name: string
  category: string
  quantity: number // How many of this item
  imageUrl?: string
  required: boolean // Is this item required or can be skipped?
  includedInPrice: boolean // Is this included in the deal price or costs extra?
  extraPrice?: number // Extra price if not included in deal
  isCombo: boolean // Is this part of a combo selection?
  options?: DealItemOption[] // Options to choose from (e.g., choose burger type)
}

export interface DealItemOption {
  id: string
  menuItemId?: string // Link to actual menu item
  name: string
  priceEur: number // Additional price for this option
  imageUrl?: string
}

export type LoyaltyTier = "Classic" | "Gold" | "Platinum"

export interface LoyaltyTierInfo {
  name: LoyaltyTier
  minPoints: number
  benefits: string[]
  color: string
}

export interface Ingredient {
  id: string
  name: string
  imageUrl?: string
  priceAdjustment: number
  category: IngredientCategory
  default: boolean
  optional: boolean
  restaurantId: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type IngredientCategory = "Sauce" | "Cheese" | "Veggie" | "Patty" | "Bread" | "Drink" | "Side" | "Other"

export interface MealTemplate {
  id: string
  name: string
  mainItemId: string
  sideCategory?: string
  drinkCategory?: string
  includedDefaults: string[] // ingredient IDs
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

export interface IngredientCustomization {
  ingredientId: string
  ingredientName: string
  quantity: number
  priceAdjustment: number
}

export interface FriesOption {
  size: "small" | "medium" | "large"
  name: string
  extraPrice: number
}
