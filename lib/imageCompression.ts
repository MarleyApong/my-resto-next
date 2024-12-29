import imageCompression from "browser-image-compression"

export const compressImage = async (
  base64Image: string,
  options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  }
): Promise<string> => {
  try {
    // Convertir base64 en Blob
    const blob = await fetch(base64Image).then((r) => r.blob())

    // Compresser l'image
    const compressedFile = await imageCompression(blob as File, options)

    // Reconvertir en base64
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(compressedFile)
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
    })
  } catch (error) {
    console.error("Error compressing image:", error)
    return base64Image
  }
}
