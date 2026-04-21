"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface MenuStoreContextType {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

const MenuStoreContext = createContext<MenuStoreContextType | undefined>(undefined)

export function MenuStoreProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState("featured")

  const handleSetCategory = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  return (
    <MenuStoreContext.Provider value={{ selectedCategory, setSelectedCategory: handleSetCategory }}>
      {children}
    </MenuStoreContext.Provider>
  )
}

export function useMenuStore() {
  const context = useContext(MenuStoreContext)
  if (context === undefined) {
    // Return a default implementation if used outside provider
    return {
      selectedCategory: "featured",
      setSelectedCategory: () => {},
    }
  }
  return context
}
