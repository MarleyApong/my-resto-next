import { PermissionType } from "./permission"

export type RoleType = {
  id: string
  name: string
  description?: string
  permissions: PermissionType[]
  organization?: {
    id: string
    name: string
  }
  restaurant?: {
    id: string
    name: string
  }
  createdAt: string
}

export type CreateRoleType = {
  name: string
  description?: string
  organizationId?: string
}

export type UpdateRoleType = {
  name: string
  description?: string
}
