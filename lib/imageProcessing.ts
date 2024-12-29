import fs from "fs/promises"
import path from "path"

export async function imageProcessing(imageBase64: string, oldImagePath?: string, directory: string = 'organizations') {
  // Supprimer l'ancienne image si elle existe
  if (oldImagePath) {
    try {
      await fs.unlink(path.join(process.cwd(), 'public', oldImagePath))
    } catch (error) {
      console.error('Error deleting old image:', error)
    }
  }

  // Traiter et sauvegarder la nouvelle image
  if (imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Générer un nom de fichier unique
    const filename = `org_${Date.now()}.webp`
    const relativePath = `/api/imgs/${directory}/${filename}`
    const fullPath = path.join(process.cwd(), 'public', relativePath)

    // Sauvegarder l'image sans compression
    await fs.writeFile(fullPath, buffer)

    return relativePath
  }
  return null
}
