import { api } from "@/lib/axiosConfig"
import { ParamsType } from "@/types/param"
import { CreateRoleType, UpdateRoleType } from "@/types/role"

const route = "/roles"

export const roleService = {
  getAll: async (params: ParamsType) => {
    return await api.get(
      `${route}?order=${params.order}&filter=${params.filter}&search=${params.search}&status=${params.status}&startDate=${params.startDate}&endDate=${params.endDate}&page=${params.page}&size=${params.size}`
    )
  },

  getById: async (roleId: string) => {
    return await api.get(`${route}/${roleId}`)
  },

  getRolesByPermissions: async () => {
    return await api.get(`${route}/permissions`)
  },

  getRolesAndMenus: async () => {
    return await api.get(`${route}/menus`)
  },

  getRolesByOrg: async (organizationId: string) => {
    return await api.get(`${route}/organizations/${organizationId}`)
  },

  create: async (data: CreateRoleType) => {
    return await api.post(`${route}`, data)
  },

  update: async (roleId: string, data: UpdateRoleType) => {
    return await api.put(`${route}/${roleId}`, data)
  },

  assignMenusToRole: async (roleId: string, menuIds: string[]) => {
    return await api.put(`${route}/${roleId}/menus`, { menuIds })
  },

  delete: async (roleId: string) => {
    return await api.delete(`${route}/${roleId}`)
  }
}
