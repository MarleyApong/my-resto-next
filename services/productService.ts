import { api } from "@/lib/axiosConfig"
import { compressImage } from "@/lib/imageCompression"
import { ProductType } from "@/types/product"
import { ParamsType } from "@/types/param"

const route = "/products"

export const productService = {
  getAll: async (params: ParamsType) => {
    return await api.get(
      `${route}?order=${params.order}&filter=${params.filter}&search=${params.search}&status=${params.status}&startDate=${params.startDate}&endDate=${params.endDate}&page=${params.page}&size=${params.size}`
    )
  },

  getById: async (id: string) => {
    return await api.get(`${route}/${id}`)
  },

  create: async (data: ProductType) => {
    if (data.picture) {
      const compressedImage = await compressImage(data.picture)
      data.picture = compressedImage
    }
    return await api.post(`${route}`, data)
  },

  update: async (id: string, data: ProductType) => {
    if (data.picture && data.picture.startsWith("data:image")) {
      const compressedImage = await compressImage(data.picture)
      data.picture = compressedImage
    }
    return await api.put(`${route}/${id}`, data)
  },

  updatePicture: async (id: string, picture: string) => {
    if (picture.startsWith("data:image")) {
      const compressedImage = await compressImage(picture)
      return await api.patch(`${route}/${id}/picture`, { picture: compressedImage })
    }
    return await api.put(`${route}/${id}/picture`, { picture })
  },

  updateStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    return await api.patch(`${route}/${id}/status`, { status })
  },

  delete: async (id: string) => {
    return await api.delete(`${route}/${id}`)
  }
}
