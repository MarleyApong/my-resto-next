import { api } from "@/lib/axiosConfig"
import { compressImage } from "@/lib/imageCompression"
import { UserType } from "@/types/user"
import { ParamsType } from "@/types/param"

export const userService = {
  getAll: async (params: ParamsType) => {
    return await api.get(
      `/users?order=${params.order}&filter=${params.filter}&search=${params.search}&status=${params.status}&startDate=${params.startDate}&endDate=${params.endDate}&page=${params.page}&size=${params.size}`
    )
  },

  getById: async (id: string) => {
    return await api.get(`/users/${id}`)
  },

  create: async (data: UserType) => {
    if (data.picture) {
      // Compress the image before sending
      const compressedImage = await compressImage(data.picture)
      data.picture = compressedImage
    }
    return await api.post("/users", data)
  },

  update: async (id: string, data: UserType) => {
    if (data.picture && data.picture.startsWith("data:image")) {
      // Compress only if it's a new image (base64)
      const compressedImage = await compressImage(data.picture)
      data.picture = compressedImage
    }
    return await api.put(`/users/${id}`, data)
  },

  updatePicture: async (id: string, picture: string) => {
    if (picture.startsWith("data:image")) {
      const compressedImage = await compressImage(picture)
      return await api.patch(`/users/${id}/picture`, { picture: compressedImage })
    }
    return await api.put(`/users/${id}/picture`, { picture })
  },

  updateStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    return await api.patch(`/users/${id}/status`, { status })
  },

  delete: async (id: string) => {
    return await api.delete(`/users/${id}`)
  }
}
