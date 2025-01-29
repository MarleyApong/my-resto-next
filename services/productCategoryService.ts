import { api } from "@/lib/axiosConfig"
import { ParamsType } from "@/types/param"
import { CreateProductCategory, UpdateProductCategory } from "@/types/productCategory"

const route = "/product-categories"

export const productCategoryService = {
  getAll: async (params: ParamsType) => {
    return await api.get(
      `${route}?order=${params.order}&filter=${params.filter}&search=${params.search}&startDate=${params.startDate}&endDate=${params.endDate}&page=${params.page}&size=${params.size}`
    )
  },

  getById: async (id: string) => {
    return await api.get(`${route}/${id}`)
  },

  getByOrganization: async (organizationId: string) => {
    return await api.get(`${route}/organizations/${organizationId}`)
  },

  getByRestaurant: async (restaurantId: string) => {
    return await api.get(`${route}/restaurants/${restaurantId}`)
  },

  create: async (data: CreateProductCategory) => {
    return await api.post(route, data)
  },

  update: async (id: string, data: UpdateProductCategory) => {
    return await api.put(`${route}/${id}`, data)
  },

  delete: async (id: string) => {
    return await api.delete(`${route}/${id}`)
  }
}
