"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, GripVertical, Package } from "lucide-react"
import type { DealItem, MenuItem } from "@/types"
import { subscribeToMenuItems, subscribeToMenuCategories } from "@/lib/firebase-menu"
import type { MenuCategory } from "@/types"

interface DealItemsManagerProps {
  items: DealItem[]
  onChange: (items: DealItem[]) => void
}

export function DealItemsManager({ items, onChange }: DealItemsManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DealItem | null>(null)
  const [itemForm, setItemForm] = useState<Partial<DealItem>>({
    name: "",
    category: "",
    quantity: 1,
    required: true,
    includedInPrice: true,
    isCombo: false,
    extraPrice: 0,
  })

  useEffect(() => {
    const unsubscribeItems = subscribeToMenuItems((newItems) => {
      setMenuItems(newItems)
    })
    const unsubscribeCats = subscribeToMenuCategories((newCats) => {
      setMenuCategories(newCats)
    })
    return () => {
      unsubscribeItems()
      unsubscribeCats()
    }
  }, [])

  const handleAddItem = () => {
    if (!itemForm.name || !itemForm.category) return

    const newItem: DealItem = {
      id: editingItem?.id || `item-${Date.now()}`,
      menuItemId: itemForm.menuItemId,
      name: itemForm.name || "",
      category: itemForm.category || "",
      quantity: itemForm.quantity || 1,
      imageUrl: itemForm.imageUrl,
      required: itemForm.required ?? true,
      includedInPrice: itemForm.includedInPrice ?? true,
      extraPrice: itemForm.extraPrice || 0,
      isCombo: itemForm.isCombo ?? false,
      options: itemForm.options || [],
    }

    if (editingItem) {
      onChange(items.map((i) => (i.id === editingItem.id ? newItem : i)))
    } else {
      onChange([...items, newItem])
    }

    resetForm()
    setDialogOpen(false)
  }

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleEditItem = (item: DealItem) => {
    setEditingItem(item)
    setItemForm({
      menuItemId: item.menuItemId,
      name: item.name,
      category: item.categoryId,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      required: item.required,
      includedInPrice: item.includedInPrice,
      extraPrice: item.extraPrice,
      isCombo: item.isCombo,
      options: item.options,
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingItem(null)
    setItemForm({
      name: "",
      category: "",
      quantity: 1,
      required: true,
      includedInPrice: true,
      isCombo: false,
      extraPrice: 0,
    })
  }

  const handleMenuItemSelect = (menuItemId: string) => {
    const selectedItem = menuItems.find((m) => m.id === menuItemId)
    if (selectedItem) {
      setItemForm({
        ...itemForm,
        menuItemId,
        name: selectedItem.name,
        category: selectedItem.categoryId,
        imageUrl: selectedItem.imageUrl,
      })
    }
  }

  const filteredMenuItems = itemForm.category ? menuItems.filter((m) => m.categoryId === itemForm.category) : menuItems

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Package className="w-4 h-4" />
          Deal Items ({items.length})
        </Label>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1 bg-transparent">
              <Plus className="w-3 h-3" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add Item to Deal"}</DialogTitle>
              <DialogDescription>
                Select items to include in this deal. Customers will see this breakdown.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <Label>Category *</Label>
                <Select
                  value={itemForm.category}
                  onValueChange={(value) => setItemForm({ ...itemForm, category: value, menuItemId: undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Menu Item (Optional)</Label>
                <Select
                  value={itemForm.menuItemId || "custom"}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setItemForm({ ...itemForm, menuItemId: undefined })
                    } else {
                      handleMenuItemSelect(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select menu item or enter custom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Item</SelectItem>
                    {filteredMenuItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - €{(Number(item.priceEur) || 0).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Item Name *</Label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g., Beef Burger, Large Fries"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Extra Price (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.extraPrice}
                    onChange={(e) => setItemForm({ ...itemForm, extraPrice: Number.parseFloat(e.target.value) || 0 })}
                    disabled={itemForm.includedInPrice}
                  />
                </div>
              </div>

              <div>
                <Label>Image URL (Optional)</Label>
                <Input
                  value={itemForm.imageUrl || ""}
                  onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  placeholder="/images/burger.jpg"
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Required Item</Label>
                    <p className="text-xs text-muted-foreground">Customer must include this item</p>
                  </div>
                  <Switch
                    checked={itemForm.required}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, required: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Included in Price</Label>
                    <p className="text-xs text-muted-foreground">No extra charge for this item</p>
                  </div>
                  <Switch
                    checked={itemForm.includedInPrice}
                    onCheckedChange={(checked) =>
                      setItemForm({
                        ...itemForm,
                        includedInPrice: checked,
                        extraPrice: checked ? 0 : itemForm.extraPrice,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Part of Combo</Label>
                    <p className="text-xs text-muted-foreground">Customer can choose from options</p>
                  </div>
                  <Switch
                    checked={itemForm.isCombo}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isCombo: checked })}
                  />
                </div>
              </div>

              <Button
                onClick={handleAddItem}
                className="w-full bg-[#E78A00] hover:bg-[#C67500]"
                disabled={!itemForm.name || !itemForm.category}
              >
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No items added yet</p>
          <p className="text-xs">Add items to show customers what's included</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-3 flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />

                {item.imageUrl && (
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {item.quantity}× {item.name}
                    </span>
                    {!item.required && (
                      <Badge variant="outline" className="text-xs">
                        Optional
                      </Badge>
                    )}
                    {!item.includedInPrice && item.extraPrice && item.extraPrice > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +€{item.extraPrice.toFixed(2)}
                      </Badge>
                    )}
                    {item.isCombo && <Badge className="text-xs bg-blue-500">Combo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                </div>

                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditItem(item)}>
                    <span className="sr-only">Edit</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
