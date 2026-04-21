"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { MenuCategory } from "@/types"
import { subscribeToMenuCategories, addCategory, updateCategory, deleteCategory } from "@/lib/firebase-menu"

export function CategoryManager() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = subscribeToMenuCategories((newCategories) => {
      setCategories(newCategories.sort((a, b) => (a.order || 0) - (b.order || 0)))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get("name") as string
      const description = formData.get("description") as string

      if (!name.trim()) {
        toast({ title: "Error", description: "Category name is required", variant: "destructive" })
        return
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, { name, description })
        toast({ title: "Category updated", description: `${name} has been updated` })
      } else {
        const order = categories.length
        await addCategory({ name, description, order })
        toast({ title: "Category created", description: `${name} has been added` })
      }

      setDialogOpen(false)
      setEditingCategory(null)
    } catch (error) {
      console.error("Error saving category:", error)
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (category: MenuCategory) => {
    if (
      !confirm(`Are you sure you want to delete "${category.name}"? Items in this category will become uncategorized.`)
    ) {
      return
    }

    try {
      await deleteCategory(category.id)
      toast({ title: "Category deleted", description: `${category.name} has been removed` })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" })
    }
  }

  const handleReorder = async (categoryId: string, direction: "up" | "down") => {
    const index = categories.findIndex((c) => c.id === categoryId)
    if (index === -1) return

    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    const reordered = [...categories]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)

    // Update order values
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].order !== i) {
        await updateCategory(reordered[i].id, { order: i })
      }
    }
  }

  const openEditDialog = (category: MenuCategory) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingCategory(null)
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
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <CardTitle>Menu Categories</CardTitle>
            <CardDescription>
              Create and manage menu categories. New categories appear instantly on the customer app.
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Update the category details below"
                    : "Add a new category to your menu. It will appear instantly on the customer app."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Pizzeria, Kebab, Ice Cream, Shisha..."
                    defaultValue={editingCategory?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description shown to customers"
                    defaultValue={editingCategory?.description}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingCategory ? "Update Category" : "Create Category"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  disabled={index === 0}
                  onClick={() => handleReorder(category.id, "up")}
                >
                  <span className="text-xs">↑</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  disabled={index === categories.length - 1}
                  onClick={() => handleReorder(category.id, "down")}
                >
                  <span className="text-xs">↓</span>
                </Button>
              </div>
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{category.name}</p>
                {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditDialog(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(category)}
                  disabled={category.id === "featured"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No categories yet. Create your first category to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
