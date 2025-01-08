import { api } from "@/lib/axiosConfig"
import { ParamsType } from "@/types/param"
import { RoleType } from "@/types/role"

const route = "/roles"

export const userService = {
  getAll: async (params: ParamsType) => {
    return await api.get(
      `${route}?order=${params.order}&filter=${params.filter}&search=${params.search}&status=${params.status}&startDate=${params.startDate}&endDate=${params.endDate}&page=${params.page}&size=${params.size}`
    )
  },

  getById: async (roleId: string) => {
    return await api.get(`${route}/${roleId}`)
  },

  create: async (data: RoleType) => {
    return await api.post(`${route}`, data)
  },

  update: async (roleId: string, data: RoleType) => {
    return await api.put(`${route}/${roleId}`, data)
  },

  delete: async (roleId: string) => {
    return await api.delete(`${route}/${roleId}`)
  }
}
