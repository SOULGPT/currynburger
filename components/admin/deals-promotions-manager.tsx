"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2, Tag, Megaphone, ImageIcon, Calendar, Package, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/date-utils"
import type { Deal, Promotion, DealItem, Banner } from "@/types"
import {
  subscribeToDeals,
  subscribeToPromotions,
  subscribeToBanners,
  saveDeal,
  savePromotion,
  saveBanner,
  deleteDeal,
  deletePromotion,
  deleteBanner,
} from "@/lib/firebase-deals"
import { DealItemsManager } from "./deal-items-manager"

export function DealsPromotionsManager() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("deals")
  const [loading, setLoading] = useState(true)

  // Deals state
  const [deals, setDeals] = useState<Deal[]>([])
  const [dealDialogOpen, setDealDialogOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [dealForm, setDealForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    priceEur: 0,
    originalPriceEur: 0,
    discount: "",
    validUntil: "",
    active: true,
    priority: 1,
  })
  const [dealItems, setDealItems] = useState<DealItem[]>([])

  // Promotions state
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [promoDialogOpen, setPromoDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [promoForm, setPromoForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    discount: "",
    validUntil: "",
    active: true,
    priority: 1,
  })

  // Banners state
  const [banners, setBanners] = useState<Banner[]>([])
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    linkText: "",
    active: true,
    priority: 1,
  })
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("")
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)

    const unsubDeals = subscribeToDeals((newDeals) => {
      setDeals(newDeals)
      setLoading(false)
    })

    const unsubPromos = subscribeToPromotions((newPromos) => {
      setPromotions(newPromos)
    })

    const unsubBanners = subscribeToBanners((newBanners) => {
      setBanners(newBanners)
    })

    return () => {
      unsubDeals()
      unsubPromos()
      unsubBanners()
    }
  }, [])

  // DEAL FUNCTIONS
  async function handleSaveDeal() {
    if (!dealForm.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" })
      return
    }

    setSaving(true)

    try {
      await saveDeal({
        id: editingDeal?.id,
        title: dealForm.title,
        description: dealForm.description,
        imageUrl: dealForm.imageUrl || "/placeholder.svg?height=400&width=600",
        priceEur: Number(dealForm.priceEur) || 0,
        originalPriceEur: Number(dealForm.originalPriceEur) || 0,
        discount: dealForm.discount,
        validUntil: dealForm.validUntil
          ? new Date(dealForm.validUntil)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        active: dealForm.active,
        priority: dealForm.priority,
        items: dealItems,
        category: editingDeal?.category || "General",
      })

      toast({ title: "Success", description: editingDeal ? "Deal updated" : "Deal created" })
      setDealDialogOpen(false)
      resetDealForm()
    } catch (error) {
      console.error("Error saving deal:", error)
      toast({ title: "Error", description: "Failed to save deal. Check permissions.", variant: "destructive" })
    }

    setSaving(false)
  }

  async function handleDeleteDeal(id: string) {
    if (!confirm("Are you sure you want to delete this deal?")) return

    try {
      await deleteDeal(id)
      toast({ title: "Success", description: "Deal deleted" })
    } catch (error) {
      console.error("Error deleting deal:", error)
      toast({ title: "Error", description: "Failed to delete deal", variant: "destructive" })
    }
  }

  function resetDealForm() {
    setEditingDeal(null)
    setDealForm({
      title: "",
      description: "",
      imageUrl: "",
      priceEur: 0,
      originalPriceEur: 0,
      discount: "",
      validUntil: "",
      active: true,
      priority: 1,
    })
    setDealItems([])
  }

  function openEditDeal(deal: Deal) {
    setEditingDeal(deal)
    setDealForm({
      title: deal.title,
      description: deal.description || "",
      imageUrl: deal.imageUrl || "",
      priceEur: deal.priceEur || 0,
      originalPriceEur: deal.originalPriceEur || 0,
      discount: deal.discount || "",
      validUntil: deal.validUntil ? new Date(deal.validUntil).toISOString().split("T")[0] : "",
      active: deal.active ?? true,
      priority: deal.priority || 1,
    })
    setDealItems(deal.items || [])
    setDealDialogOpen(true)
  }

  // PROMOTION FUNCTIONS
  async function handleSavePromotion() {
    if (!promoForm.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" })
      return
    }

    setSaving(true)

    try {
      await savePromotion({
        id: editingPromo?.id,
        title: promoForm.title,
        description: promoForm.description,
        imageUrl: promoForm.imageUrl || "/placeholder.svg?height=400&width=600",
        discount: promoForm.discount,
        validUntil: promoForm.validUntil
          ? new Date(promoForm.validUntil)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        active: promoForm.active,
        priority: promoForm.priority,
      })

      toast({ title: "Success", description: editingPromo ? "Promotion updated" : "Promotion created" })
      setPromoDialogOpen(false)
      resetPromoForm()
    } catch (error) {
      console.error("Error saving promotion:", error)
      toast({ title: "Error", description: "Failed to save promotion. Check permissions.", variant: "destructive" })
    }

    setSaving(false)
  }

  async function handleDeletePromotion(id: string) {
    if (!confirm("Are you sure you want to delete this promotion?")) return

    try {
      await deletePromotion(id)
      toast({ title: "Success", description: "Promotion deleted" })
    } catch (error) {
      console.error("Error deleting promotion:", error)
      toast({ title: "Error", description: "Failed to delete promotion", variant: "destructive" })
    }
  }

  function resetPromoForm() {
    setEditingPromo(null)
    setPromoForm({
      title: "",
      description: "",
      imageUrl: "",
      discount: "",
      validUntil: "",
      active: true,
      priority: 1,
    })
  }

  function openEditPromotion(promo: Promotion) {
    setEditingPromo(promo)
    setPromoForm({
      title: promo.title,
      description: promo.description || "",
      imageUrl: promo.imageUrl || "",
      discount: promo.discount || "",
      validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().split("T")[0] : "",
      active: promo.active ?? true,
      priority: promo.priority || 1,
    })
    setPromoDialogOpen(true)
  }

  // BANNER FUNCTIONS
  async function uploadBannerImage(file: File): Promise<string> {
    setUploadingBannerImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "banners")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("[v0] Error uploading banner image:", error)
      throw error
    } finally {
      setUploadingBannerImage(false)
    }
  }

  function handleBannerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setBannerImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      setBannerImagePreview(previewUrl)
      setBannerForm({ ...bannerForm, imageUrl: "" })
    }
  }

  function clearBannerImage() {
    setBannerImageFile(null)
    if (bannerImagePreview) {
      URL.revokeObjectURL(bannerImagePreview)
    }
    setBannerImagePreview("")
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.value = ""
    }
  }

  function resetBannerForm() {
    setEditingBanner(null)
    setBannerForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      linkText: "",
      active: true,
      priority: 1,
    })
    clearBannerImage()
  }

  function openEditBanner(banner: Banner) {
    setEditingBanner(banner)
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      linkText: banner.linkText || "",
      active: banner.active,
      priority: banner.priority || 1,
    })
    clearBannerImage()
    if (banner.imageUrl) {
      setBannerImagePreview(banner.imageUrl)
    }
    setBannerDialogOpen(true)
  }

  async function handleSaveBanner() {
    if (!bannerForm.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      let finalImageUrl = bannerForm.imageUrl

      if (bannerImageFile) {
        try {
          finalImageUrl = await uploadBannerImage(bannerImageFile)
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
      }

      const bannerData: Partial<Banner> = {
        title: bannerForm.title,
        subtitle: bannerForm.subtitle || undefined,
        imageUrl: finalImageUrl || undefined,
        linkUrl: bannerForm.linkUrl || undefined,
        linkText: bannerForm.linkText || undefined,
        active: bannerForm.active,
        priority: bannerForm.priority,
      }

      if (editingBanner?.id) {
        bannerData.id = editingBanner.id
      }

      await saveBanner(bannerData)

      toast({
        title: "Success",
        description: editingBanner ? "Banner updated successfully" : "Banner created successfully",
      })
      setBannerDialogOpen(false)
      resetBannerForm()
    } catch (error) {
      console.error("[v0] Error saving banner:", error)
      toast({ title: "Error", description: "Failed to save banner. Check permissions.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteBanner(id: string) {
    if (!confirm("Are you sure you want to delete this banner?")) return

    try {
      await deleteBanner(id)
      toast({ title: "Success", description: "Banner deleted" })
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({ title: "Error", description: "Failed to delete banner", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E78A00]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deals" className="gap-2">
            <Tag className="w-4 h-4" />
            Deals ({deals.length})
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-2">
            <Megaphone className="w-4 h-4" />
            Promotions ({promotions.length})
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Banners ({banners.length})
          </TabsTrigger>
        </TabsList>

        {/* DEALS TAB */}
        <TabsContent value="deals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Deals</h3>
            <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetDealForm} className="bg-[#E78A00] hover:bg-[#C67500]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>{editingDeal ? "Edit Deal" : "Add New Deal"}</DialogTitle>
                  <DialogDescription>
                    {editingDeal
                      ? "Update the deal details and items below"
                      : "Create a deal with detailed item breakdown for customers"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Title *</Label>
                      <Input
                        value={dealForm.title}
                        onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                        placeholder="Family Feast Deal"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={dealForm.description}
                        onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                        placeholder="Describe the deal..."
                        rows={2}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Image URL</Label>
                      <Input
                        value={dealForm.imageUrl}
                        onChange={(e) => setDealForm({ ...dealForm, imageUrl: e.target.value })}
                        placeholder="/images/deal.jpg"
                      />
                    </div>
                    <div>
                      <Label>Price (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={dealForm.priceEur}
                        onChange={(e) => setDealForm({ ...dealForm, priceEur: Number.parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Original Price (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={dealForm.originalPriceEur}
                        onChange={(e) =>
                          setDealForm({ ...dealForm, originalPriceEur: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label>Discount Label</Label>
                      <Input
                        value={dealForm.discount}
                        onChange={(e) => setDealForm({ ...dealForm, discount: e.target.value })}
                        placeholder="Save €15"
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        value={dealForm.priority}
                        onChange={(e) => setDealForm({ ...dealForm, priority: Number.parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label>Valid Until</Label>
                      <Input
                        type="date"
                        value={dealForm.validUntil}
                        onChange={(e) => setDealForm({ ...dealForm, validUntil: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={dealForm.active}
                        onCheckedChange={(checked) => setDealForm({ ...dealForm, active: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <DealItemsManager items={dealItems} onChange={setDealItems} />
                  </div>

                  <Button onClick={handleSaveDeal} disabled={saving} className="w-full bg-[#E78A00] hover:bg-[#C67500]">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingDeal ? "Update Deal" : "Create Deal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={deal.imageUrl || "/placeholder.svg"}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${deal.active ? "bg-green-500" : "bg-gray-500"}`}>
                    {deal.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1">{deal.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{deal.description}</p>

                  {deal.items && deal.items.length > 0 && (
                    <div className="mb-2 p-2 bg-muted/50 rounded text-xs">
                      <div className="flex items-center gap-1 font-medium mb-1">
                        <Package className="w-3 h-3" />
                        {deal.items.length} items included:
                      </div>
                      <div className="space-y-0.5 text-muted-foreground">
                        {deal.items.slice(0, 3).map((item, idx) => (
                          <div key={idx}>
                            {item.quantity}× {item.name}
                          </div>
                        ))}
                        {deal.items.length > 3 && <div>+{deal.items.length - 3} more...</div>}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-[#E78A00]">€{deal.priceEur?.toFixed(2)}</span>
                    {deal.originalPriceEur && (
                      <span className="text-sm line-through text-muted-foreground">
                        €{deal.originalPriceEur?.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    {deal.validUntil ? `Ends ${formatDate(deal.validUntil)}` : "No expiry"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => openEditDeal(deal)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => handleDeleteDeal(deal.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PROMOTIONS TAB */}
        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Promotions</h3>
            <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPromoForm} className="bg-[#E78A00] hover:bg-[#C67500]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Promotion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingPromo ? "Edit Promotion" : "Add New Promotion"}</DialogTitle>
                  <DialogDescription>
                    {editingPromo
                      ? "Update the promotion details below"
                      : "Fill in the details to create a new promotion"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={promoForm.title}
                      onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                      placeholder="Summer Special"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={promoForm.description}
                      onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      placeholder="Describe the promotion..."
                    />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={promoForm.imageUrl}
                      onChange={(e) => setPromoForm({ ...promoForm, imageUrl: e.target.value })}
                      placeholder="/images/promo.jpg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Discount Label</Label>
                      <Input
                        value={promoForm.discount}
                        onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                        placeholder="20% OFF"
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        value={promoForm.priority}
                        onChange={(e) => setPromoForm({ ...promoForm, priority: Number.parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={promoForm.validUntil}
                      onChange={(e) => setPromoForm({ ...promoForm, validUntil: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={promoForm.active}
                      onCheckedChange={(checked) => setPromoForm({ ...promoForm, active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button
                    onClick={handleSavePromotion}
                    disabled={saving}
                    className="w-full bg-[#E78A00] hover:bg-[#C67500]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingPromo ? "Update Promotion" : "Create Promotion"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => (
              <Card key={promo.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={promo.imageUrl || "/placeholder.svg"}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${promo.active ? "bg-green-500" : "bg-gray-500"}`}>
                    {promo.active ? "Active" : "Inactive"}
                  </Badge>
                  {promo.discount && <Badge className="absolute top-2 left-2 bg-[#E78A00]">{promo.discount}</Badge>}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1">{promo.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{promo.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    {promo.validUntil ? `Ends ${formatDate(promo.validUntil)}` : "No expiry"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => openEditPromotion(promo)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => handleDeletePromotion(promo.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* BANNERS TAB */}
        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Banners</h3>
            <Dialog
              open={bannerDialogOpen}
              onOpenChange={(open) => {
                setBannerDialogOpen(open)
                if (!open) resetBannerForm()
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={resetBannerForm} className="bg-[#E78A00] hover:bg-[#C67500]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
                  <DialogDescription>
                    {editingBanner
                      ? "Update the banner details below"
                      : "Fill in the details to create a new banner. Only title is required."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      placeholder="Enter banner title"
                    />
                  </div>
                  <div>
                    <Label>Subtitle (optional)</Label>
                    <Textarea
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      placeholder="Additional text to display"
                      rows={2}
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-3">
                    <Label>Banner Image</Label>

                    {/* Image Preview */}
                    {bannerImagePreview && (
                      <div className="relative aspect-[2/1] rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={bannerImagePreview || "/placeholder.svg"}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => {
                            clearBannerImage()
                            setBannerForm({ ...bannerForm, imageUrl: "" })
                            setBannerImagePreview("")
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex gap-2">
                      <input
                        ref={bannerFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                        className="hidden"
                        id="banner-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => bannerFileInputRef.current?.click()}
                        disabled={uploadingBannerImage}
                      >
                        {uploadingBannerImage ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {bannerImageFile ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>

                    {/* Or use URL */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                      </div>
                    </div>

                    <Input
                      value={bannerForm.imageUrl}
                      onChange={(e) => {
                        setBannerForm({ ...bannerForm, imageUrl: e.target.value })
                        if (e.target.value) {
                          clearBannerImage()
                          setBannerImagePreview(e.target.value)
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      disabled={!!bannerImageFile}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload an image or paste a URL. Images will auto-size to fit the banner.
                    </p>
                  </div>
                  {/* End of image upload section */}

                  <div>
                    <Label>Link URL (optional)</Label>
                    <Input
                      value={bannerForm.linkUrl}
                      onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                      placeholder="/deals or https://instagram.com/..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Where should clicking the banner redirect? Leave empty for no redirect.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Button Text (optional)</Label>
                      <Input
                        value={bannerForm.linkText}
                        onChange={(e) => setBannerForm({ ...bannerForm, linkText: e.target.value })}
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        value={bannerForm.priority}
                        onChange={(e) =>
                          setBannerForm({ ...bannerForm, priority: Number.parseInt(e.target.value) || 1 })
                        }
                        min={1}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Higher = shown first</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={bannerForm.active}
                      onCheckedChange={(checked) => setBannerForm({ ...bannerForm, active: checked })}
                    />
                    <Label>Active</Label>
                    <span className="text-xs text-muted-foreground ml-2">
                      Only active banners are shown on the homepage
                    </span>
                  </div>
                  <Button
                    onClick={handleSaveBanner}
                    disabled={saving || uploadingBannerImage}
                    className="w-full bg-[#E78A00] hover:bg-[#C67500]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingBanner ? "Update Banner" : "Create Banner"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {banners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="aspect-[2/1] relative bg-muted">
                  <img
                    src={banner.imageUrl || "/placeholder.svg"}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${banner.active ? "bg-green-500" : "bg-gray-500"}`}>
                    {banner.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1">{banner.title}</h4>
                  {banner.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{banner.subtitle}</p>
                  )}
                  {banner.linkUrl && <p className="text-xs text-muted-foreground mb-3">Links to: {banner.linkUrl}</p>}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => openEditBanner(banner)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => handleDeleteBanner(banner.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
