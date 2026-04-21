"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useRef, useEffect } from "react"
import { QrCode, Download, Copy, Check } from "lucide-react"

export function QRCodeGenerator() {
  const [branchId, setBranchId] = useState("001")
  const [tableNumber, setTableNumber] = useState("")
  const [qrUrl, setQrUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQRCode = () => {
    if (!tableNumber) return
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/?mode=dinein&branchId=${branchId}&table=${tableNumber}`
    setQrUrl(url)
  }

  useEffect(() => {
    if (!qrUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Use QR code API service
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=E78A00`

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = 300
      canvas.height = 300
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 300, 300)
      ctx.drawImage(img, 0, 0, 300, 300)
    }
    img.src = qrImageUrl
  }, [qrUrl])

  const downloadQRCode = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `table-${tableNumber}-qr.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  const copyUrl = async () => {
    if (!qrUrl) return
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code Generator
        </CardTitle>
        <CardDescription>Generate QR codes for dine-in tables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger id="branch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="001">Main Branch</SelectItem>
                <SelectItem value="002">Downtown Branch</SelectItem>
                <SelectItem value="003">Airport Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="table">Table Number</Label>
            <Input
              id="table"
              type="text"
              placeholder="e.g., 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={generateQRCode} disabled={!tableNumber} className="w-full">
          <QrCode className="w-4 h-4 mr-2" />
          Generate QR Code
        </Button>

        {qrUrl && (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-muted rounded-lg">
              <canvas ref={canvasRef} className="rounded-lg shadow-md" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code to order from Table {tableNumber}
              </p>

              <div className="flex gap-2">
                <Button onClick={downloadQRCode} variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={copyUrl} variant="outline" className="flex-1 bg-transparent">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy URL"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
