import { api } from "@/lib/axiosConfig"
import { compressImage } from "@/lib/imageCompression"
import { RestaurantType } from "@/types/restaurant"
import { ParamsType } from "@/types/param"

export const restaurantService = {
  getAll: async (params: ParamsType) => {
    return await api.get(
      `/restaurants?order=${params.order}&filter=${params.filter}&search=${params.search}&status=${params.status}&startDate=${params.startDate}&endDate=${params.endDate}&page=${params.page}&size=${params.size}`
    )
  },

  getById: async (id: string) => {
    return await api.get(`/restaurants/${id}`)
  },

  create: async (data: RestaurantType) => {
    if (data.picture) {
      // Compression de l'image avant envoi
      const compressedImage = await compressImage(data.picture)
      data.picture = compressedImage
    }
    return await api.post("/restaurants", data)
  },

  update: async (id: string, data: RestaurantType) => {
    if (data.picture && data.picture.startsWith("data:image")) {
      // Ne compresse que si c'est une nouvelle image (en base64)
      const compressedImage = await compressImage(data.picture)
      data.picture = compressedImage
    }
    return await api.put(`/restaurants/${id}`, data)
  },

  updatePicture: async (id: string, picture: string) => {
    if (picture.startsWith("data:image")) {
      const compressedImage = await compressImage(picture)
      return await api.patch(`/restaurants/${id}/picture`, { picture: compressedImage })
    }
    return await api.put(`/restaurants/${id}/picture`, { picture })
  },

  updateStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    return await api.patch(`/restaurants/${id}/status`, { status })
  },

  delete: async (id: string) => {
    return await api.delete(`/restaurants/${id}`)
  }
}
