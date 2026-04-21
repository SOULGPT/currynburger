"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, Loader2, Eye, EyeOff, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { MenuItem, MenuCategory } from "@/types"
import {
  subscribeToMenuItems,
  subscribeToMenuCategories,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/lib/firebase-menu"
import { deleteMenuItemImage } from "@/lib/firebase-storage"

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)

    console.log("[v0] MenuManager: Setting up subscriptions")

    const unsubscribeItems = subscribeToMenuItems((newItems) => {
      console.log("[v0] MenuManager: Received", newItems.length, "items")
      setItems(newItems)
      setLoading(false)
    })

    const unsubscribeCategories = subscribeToMenuCategories((newCategories) => {
      const validCategories = newCategories.filter((cat) => cat.id && cat.id.trim() !== "")
      console.log("[v0] MenuManager: Received", validCategories.length, "categories")
      setCategories(validCategories.sort((a, b) => (a.order || 0) - (b.order || 0)))
    })

    return () => {
      unsubscribeItems()
      unsubscribeCategories()
    }
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      let imageUrl = editingItem?.imageUrl || ""

      if (imageFile) {
        setUploadingImage(true)
        try {
          const uploadFormData = new FormData()
          uploadFormData.append("file", imageFile)
          uploadFormData.append("folder", "menu-items")

          const response = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          })

          if (response.ok) {
            const data = await response.json()
            imageUrl = data.url
          }
        } catch (uploadError) {
          console.error("[v0] Image upload error:", uploadError)
          toast({
            title: "Image upload failed",
            description: "Using placeholder image instead",
            variant: "destructive",
          })
        }
        setUploadingImage(false)
      }

      const caloriesStr = formData.get("calories") as string
      let parsedCalories: number | null = null
      if (caloriesStr && caloriesStr.trim() !== "") {
        const num = Number.parseInt(caloriesStr.trim(), 10)
        if (!Number.isNaN(num)) {
          parsedCalories = num
        }
      }

      const itemData: Omit<MenuItem, "id"> = {
        name: (formData.get("name") as string) || "",
        description: (formData.get("description") as string) || "",
        priceEur: Number.parseFloat(formData.get("price") as string) || 0,
        categoryId: (formData.get("category") as string) || categories[0]?.id || "",
        imageUrl: imageUrl || "/diverse-food-spread.png",
        available: formData.get("available") === "on",
        published: formData.get("published") === "on",
        preparationTime: Number.parseInt(formData.get("prepTime") as string, 10) || 15,
        calories: parsedCalories,
        allergens:
          (formData.get("allergens") as string)
            ?.split(",")
            .map((a) => a.trim())
            .filter(Boolean) || [],
        isVegetarian: formData.get("isVegetarian") === "on",
        isVegan: formData.get("isVegan") === "on",
        isGlutenFree: formData.get("isGlutenFree") === "on",
        spicyLevel: Number.parseInt(formData.get("spicyLevel") as string, 10) || 0,
      }

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData)
        toast({
          title: "Item updated successfully",
          description: `${itemData.name} has been updated`,
        })
      } else {
        await addMenuItem(itemData)
        toast({
          title: "Item added successfully",
          description: `${itemData.name} has been added to the menu`,
        })
      }

      setDialogOpen(false)
      setEditingItem(null)
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error saving item:", error)
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
      setUploadingImage(false)
    }
  }

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return

    try {
      if (imageUrl) {
        try {
          await deleteMenuItemImage(imageUrl)
        } catch {}
      }

      await deleteMenuItem(id)
      toast({
        title: "Item deleted successfully",
        description: "Menu item has been removed",
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      })
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { available: !item.available })
      toast({
        title: item.available ? "Item marked unavailable" : "Item marked available",
      })
    } catch {
      toast({ title: "Error updating availability", variant: "destructive" })
    }
  }

  const togglePublished = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { published: !item.published })
      toast({
        title: item.published ? "Item unpublished" : "Item published",
      })
    } catch {
      toast({ title: "Error updating status", variant: "destructive" })
    }
  }

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setImagePreview(item.imageUrl || null)
    setDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingItem(null)
    setImageFile(null)
    setImagePreview(null)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Manage your restaurant menu items</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the menu item details" : "Fill in the details for the new menu item"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" name="name" defaultValue={editingItem?.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (EUR) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingItem?.priceEur}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={editingItem?.description} rows={3} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" defaultValue={editingItem?.categoryId || categories[0]?.id}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prepTime">Prep Time (min)</Label>
                      <Input
                        id="prepTime"
                        name="prepTime"
                        type="number"
                        defaultValue={editingItem?.preparationTime || 15}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories">Calories</Label>
                      <Input id="calories" name="calories" type="number" defaultValue={editingItem?.calories ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spicyLevel">Spicy Level (0-5)</Label>
                      <Input
                        id="spicyLevel"
                        name="spicyLevel"
                        type="number"
                        min="0"
                        max="5"
                        defaultValue={editingItem?.spicyLevel || 0}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergens">Allergens (comma-separated)</Label>
                    <Input id="allergens" name="allergens" defaultValue={editingItem?.allergens?.join(", ")} />
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch id="available" name="available" defaultChecked={editingItem?.available ?? true} />
                      <Label htmlFor="available">Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="published" name="published" defaultChecked={editingItem?.published ?? true} />
                      <Label htmlFor="published">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isVegetarian" name="isVegetarian" defaultChecked={editingItem?.isVegetarian} />
                      <Label htmlFor="isVegetarian">Vegetarian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isVegan" name="isVegan" defaultChecked={editingItem?.isVegan} />
                      <Label htmlFor="isVegan">Vegan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isGlutenFree" name="isGlutenFree" defaultChecked={editingItem?.isGlutenFree} />
                      <Label htmlFor="isGlutenFree">Gluten-Free</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || uploadingImage}>
                      {(submitting || uploadingImage) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {uploadingImage ? "Uploading..." : editingItem ? "Update Item" : "Add Item"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No menu items found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className={!item.available ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="aspect-video relative mb-3 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl || "/placeholder.svg?height=200&width=300&query=food"}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                      {!item.published && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          Draft
                        </Badge>
                      )}
                      {!item.available && (
                        <Badge className="absolute top-2 right-2" variant="destructive">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">€{(Number(item.priceEur) || 0).toFixed(2)}</span>
                      <Badge variant="outline">
                        {categories.find((c) => c.id === item.categoryId)?.name || item.categoryId}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleAvailability(item)}>
                        {item.available ? "Mark Unavailable" : "Mark Available"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => togglePublished(item)}>
                        {item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id, item.imageUrl)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
