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

  getRolesBackOffice: async () => {
    return await api.get(`${route}/back-office`)
  },

  getRolesAndMenus: async () => {
    return await api.get(`${route}/menus`)
  },

  getRolesByOrg: async (organizationId: string) => {
    return await api.get(`${route}/organizations/${organizationId}`)
  },

  getMenusByRole: async (roleId: string) => {
    return await api.get(`${route}/${roleId}/menu-organization`)
  },

  getPermissionByMenu: async (menuId: string) => {
    return await api.get(`${route}/menus/${menuId}/permissions`)
  },

  getPermissionAttibutedByMenu: async (roleId: string, menuId: string) => {
    return await api.get(`${route}/${roleId}/menus/${menuId}`)
  },

  create: async (data: CreateRoleType) => {
    return await api.post(`${route}`, data)
  },

  update: async (roleId: string, data: UpdateRoleType) => {
    return await api.put(`${route}/${roleId}`, data)
  },

  assignMenusToRoleOrganization: async (roleId: string, menuIds: string[]) => {
    return await api.put(`${route}/${roleId}/menu-organization`, { menuIds })
  },

  assignMenusToRole: async (roleId: string, menuIds: string[]) => {
    return await api.put(`${route}/${roleId}/menu-role`, { menuIds })
  },

  assignPermissionToRoleMenu: async (roleId: string, menuId: string, permissions: any, specificPermissions: any[]) => {
    return await api.put(`${route}/${roleId}/menus/${menuId}`, { permissions, specificPermissions })
  },

  delete: async (roleId: string) => {
    return await api.delete(`${route}/${roleId}`)
  }
}
