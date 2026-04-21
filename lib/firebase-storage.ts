import { getFirebaseStorage } from "./firebase"
import { put } from "@vercel/blob"

export async function uploadMenuItemImage(file: File, itemId: string): Promise<string> {
  try {
    // Try Vercel Blob first
    const blob = await put(`menu-items/${itemId}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })
    return blob.url
  } catch (blobError) {}

  // Fallback to Firebase Storage
  const storage = await getFirebaseStorage()
  if (!storage) throw new Error("No storage available")

  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")

  const timestamp = Date.now()
  const filename = `menu-items/${itemId}/${timestamp}-${file.name}`
  const storageRef = ref(storage, filename)

  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}

export async function deleteMenuItemImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return

  try {
    // Handle Vercel Blob URLs - they don't need explicit deletion in most cases
    if (imageUrl.includes("blob.vercel-storage.com")) {
      return
    }

    // Handle Firebase Storage URLs
    if (imageUrl.includes("firebasestorage.googleapis.com")) {
      const storage = await getFirebaseStorage()
      if (!storage) return

      const urlObj = new URL(imageUrl)
      const pathPart = urlObj.pathname.split("/o/")[1]
      if (!pathPart) return

      const path = decodeURIComponent(pathPart.split("?")[0])
      if (!path) return

      const { ref, deleteObject } = await import("firebase/storage")
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    }
  } catch (error) {
    // Silently ignore deletion errors
  }
}
