import fs from "fs/promises"
import path from "path"

/**
 * Processes an image provided as a base64 string and saves it to the specified directory.
 * If an old image path is provided, it will be deleted before saving the new image.
 *
 * @param imageBase64 - The image as a base64 string.
 * @param oldImagePath - Optional. The path of the old image to delete.
 * @param directory - Optional. The directory where the image will be saved. Defaults to 'organizations'.
 * @returns The relative path of the saved image or `null` if the image could not be processed.
 */
export async function imageProcessing(imageBase64: string, oldImagePath?: string, directory: string = "organizations"): Promise<string | null> {
  // Delete the old image if it exists
  if (oldImagePath) {
    try {
      await fs.unlink(path.join(process.cwd(), "public", oldImagePath))
    } catch (error) {
      console.error("Error deleting old image:", error)
    }
  }

  // Process and save the new image if the base64 string is valid
  if (imageBase64) {
    // Remove the base64 prefix (e.g., "data:image/png;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    // Generate a unique filename
    const filename = `${directory.slice(0, 3)}_${Date.now()}.webp`
    const uploadDir = path.join(process.cwd(), "public", "api", "imgs", directory)
    const relativePath = `/api/imgs/${directory}/${filename}`
    const fullPath = path.join(uploadDir, filename)

    // Create the directory if it doesn't exist
    try {
      await fs.mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Error creating directory:", error)
      return null // Return null if the directory cannot be created
    }

    // Save the image without compression
    try {
      await fs.writeFile(fullPath, buffer)
      return relativePath // Return the relative path of the saved image
    } catch (error) {
      console.error("Error saving the image:", error)
      return null // Return null if the image cannot be saved
    }
  }

  // Return null if the base64 string is invalid or empty
  return null
}
