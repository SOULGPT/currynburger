"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { subscribeToIngredients, addIngredient, updateIngredient, deleteIngredient } from "@/lib/firebase-ingredients"
import { isFirebaseConfigured, getFirebaseDb } from "@/lib/firebase"
import type { Ingredient, IngredientCategory } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "Sauce",
  "Cheese",
  "Veggie",
  "Patty",
  "Bread",
  "Drink",
  "Side",
  "Other",
]

export function IngredientManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | "all">("all")
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = subscribeToIngredients((newIngredients) => {
      setIngredients(newIngredients)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const ingredientData = {
      name: formData.get("name") as string,
      imageUrl: formData.get("imageUrl") as string,
      priceAdjustment: Number.parseFloat(formData.get("priceAdjustment") as string),
      category: formData.get("category") as IngredientCategory,
      default: formData.get("default") === "on",
      optional: formData.get("optional") === "on",
      active: formData.get("active") === "on",
    }

    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, ingredientData)
        setIngredients((prev) => prev.map((i) => (i.id === editingIngredient.id ? { ...i, ...ingredientData } : i)))
        toast({
          title: "Ingredient updated",
          description: "Ingredient has been updated successfully",
        })
      } else {
        const result = await addIngredient(ingredientData)
        const newIngredient: Ingredient = { ...ingredientData, id: result?.id || `local-${Date.now()}` }
        setIngredients((prev) => [...prev, newIngredient])
        toast({
          title: "Ingredient added",
          description: "New ingredient has been added successfully",
        })
      }
      setDialogOpen(false)
      setEditingIngredient(null)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save ingredient",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ingredient?")) return

    try {
      await deleteIngredient(id)
      setIngredients((prev) => prev.filter((i) => i.id !== id))
      toast({
        title: "Ingredient deleted",
        description: "Ingredient has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      })
    }
  }

  const filteredIngredients =
    selectedCategory === "all" ? ingredients : ingredients.filter((ing) => ing.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isDemo = !isFirebaseConfigured() || !getFirebaseDb()

  return (
    <div className="space-y-4">
      {isDemo && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                Demo Mode - Changes are saved locally. Connect Firebase for cloud sync.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ingredient Management</CardTitle>
              <CardDescription>Manage ingredients for meal customization</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingIngredient(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}</DialogTitle>
                  <DialogDescription>
                    {editingIngredient ? "Update the ingredient details" : "Add a new ingredient for customization"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editingIngredient?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={editingIngredient?.category} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {INGREDIENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceAdjustment">Price Adjustment (EUR)</Label>
                    <Input
                      id="priceAdjustment"
                      name="priceAdjustment"
                      type="number"
                      step="0.01"
                      defaultValue={editingIngredient?.priceAdjustment || 0}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Positive for extra charge, negative for discount, 0 for no change
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input id="imageUrl" name="imageUrl" defaultValue={editingIngredient?.imageUrl} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="default" name="default" defaultChecked={editingIngredient?.default ?? false} />
                    <Label htmlFor="default">Default (included by default)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="optional" name="optional" defaultChecked={editingIngredient?.optional ?? true} />
                    <Label htmlFor="optional">Optional (can be added/removed)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="active" name="active" defaultChecked={editingIngredient?.active ?? true} />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>{editingIngredient ? "Update" : "Add"} Ingredient</>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All ({ingredients.length})
            </Button>
            {INGREDIENT_CATEGORIES.map((cat) => {
              const count = ingredients.filter((ing) => ing.category === cat).length
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat} ({count})
                </Button>
              )
            })}
          </div>

          <div className="space-y-4">
            {filteredIngredients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No ingredients yet. Add your first ingredient to get started!</p>
              </div>
            ) : (
              filteredIngredients.map((ingredient) => (
                <Card key={ingredient.id} className={!ingredient.active ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        {ingredient.imageUrl && (
                          <img
                            src={ingredient.imageUrl || "/placeholder.svg"}
                            alt={ingredient.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{ingredient.name}</h3>
                            <Badge variant="outline">{ingredient.category}</Badge>
                            {ingredient.default && <Badge variant="secondary">Default</Badge>}
                            {ingredient.optional && <Badge variant="secondary">Optional</Badge>}
                            {!ingredient.active && <Badge variant="destructive">Inactive</Badge>}
                            {ingredient.id.startsWith("demo-") && <Badge variant="outline">Demo</Badge>}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-lg font-bold text-[#E78A00]">
                              {ingredient.priceAdjustment >= 0 ? "+" : ""}€
                              {(Number(ingredient.priceAdjustment) || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingIngredient(ingredient)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(ingredient.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
