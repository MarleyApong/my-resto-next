import { api } from "@/lib/axiosConfig"
import { compressImage } from "@/lib/imageCompression"
import { OrganizationType } from "@/types/organization"
import { ParamsType } from "@/types/param"

export const organizationService = {
  getAll: async (params: ParamsType) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    return await api.get(`/organizations?${searchParams.toString()}`)
  },

  getById: async (id: string) => {
    return await api.get(`/organizations/${id}`)
  },

  create: async (data: OrganizationType) => {
    if (data.picture) {
      // Compression de l'image avant envoi
      const compressedImage = await compressImage(data.picture)
      data.picture = compressedImage
    }
    return await api.post("/organizations", data)
  },

  update: async (id: string, data: OrganizationType) => {
    if (data.picture && data.picture.startsWith("data:image")) {
      // Ne compresse que si c'est une nouvelle image (en base64)
      const compressedImage = await compressImage(data.picture)
      data.picture = compressedImage
    }
    return await api.put(`/organizations/${id}`, data)
  },

  updatePicture: async (id: string, picture: string) => {
    if (picture.startsWith("data:image")) {
      const compressedImage = await compressImage(picture)
      return await api.patch(`/organizations/${id}/picture`, { picture: compressedImage })
    }
    return await api.put(`/organizations/${id}/picture`, { picture })
  },

  updateStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    return await api.patch(`/organizations/${id}/status`, { status })
  },

  delete: async (id: string) => {
    return await api.delete(`/organizations/${id}`)
  }
}
