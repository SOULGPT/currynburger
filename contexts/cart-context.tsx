"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import type { CartItem, MenuItem, SelectedCustomization } from "@/types"

interface CartContextType {
  items: CartItem[]
  addItem: (
    menuItemOrCartItem: MenuItem | CartItem,
    quantity?: number,
    customizations?: SelectedCustomization[] | any,
    finalPrice?: number,
  ) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isReady: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          const parsed = JSON.parse(savedCart)
          if (Array.isArray(parsed)) {
            setItems(parsed)
          }
        }
      } catch {
        localStorage.removeItem("cart")
      }
      setIsReady(true)
    })
  }, [])

  useEffect(() => {
    if (!isReady) return
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem("cart", JSON.stringify(items))
      } catch {}
    }, 100)
    return () => clearTimeout(timeout)
  }, [items, isReady])

  const calculateItemPrice = useCallback(
    (menuItem: MenuItem, quantity: number, customizations: SelectedCustomization[]) => {
      let price = menuItem.priceEur || 0
      if (Array.isArray(customizations)) {
        customizations.forEach((custom) => {
          if (custom?.options && Array.isArray(custom.options)) {
            custom.options.forEach((option) => {
              if (option?.priceEur) price += option.priceEur
            })
          }
        })
      }
      return price * quantity
    },
    [],
  )

  const addItem = useCallback(
    (
      menuItemOrCartItem: MenuItem | CartItem,
      quantity = 1,
      customizations: SelectedCustomization[] | any = [],
      finalPrice?: number,
    ) => {
      try {
        if ("menuItem" in menuItemOrCartItem && "totalPrice" in menuItemOrCartItem) {
          // It's already a CartItem, add it directly
          setItems((prev) => [...prev, menuItemOrCartItem as CartItem])
          return
        }

        if (
          "id" in menuItemOrCartItem &&
          "name" in menuItemOrCartItem &&
          "price" in menuItemOrCartItem &&
          !("priceEur" in menuItemOrCartItem)
        ) {
          const simpleItem: CartItem = {
            id: `${menuItemOrCartItem.id}-${Date.now()}`,
            menuItem: {
              id: menuItemOrCartItem.id,
              categoryId: (menuItemOrCartItem as any).categoryId || "",
              name: menuItemOrCartItem.name,
              priceEur: (menuItemOrCartItem as any).price,
              imageUrl: (menuItemOrCartItem as any).imageUrl || "",
              available: true,
            },
            quantity: (menuItemOrCartItem as any).quantity || 1,
            customizations: Array.isArray((menuItemOrCartItem as any).customizations)
              ? (menuItemOrCartItem as any).customizations
              : [],
            totalPrice: (menuItemOrCartItem as any).price * ((menuItemOrCartItem as any).quantity || 1),
          }
          setItems((prev) => [...prev, simpleItem])
        } else {
          const menuItem = menuItemOrCartItem as MenuItem
          const safeCustomizations = Array.isArray(customizations) ? customizations : []
          const totalPrice =
            finalPrice !== undefined ? finalPrice : calculateItemPrice(menuItem, quantity, safeCustomizations)

          const newItem: CartItem = {
            id: `${menuItem.id}-${Date.now()}`,
            menuItem: {
              ...menuItem,
              imageUrl: menuItem.imageUrl || "",
            },
            quantity,
            customizations: safeCustomizations,
            totalPrice,
          }
          setItems((prev) => [...prev, newItem])
        }
      } catch (error) {
        console.error("Cart error:", error)
      }
    },
    [calculateItemPrice],
  )

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId)
        return
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity,
                totalPrice: calculateItemPrice(item.menuItem, quantity, item.customizations),
              }
            : item,
        ),
      )
    },
    [removeItem, calculateItemPrice],
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + (item.totalPrice || 0), 0), [items])

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isReady,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isReady],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
