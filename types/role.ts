import { PermissionType } from "./permission"

export type RoleType = {
  id: string
  name: string
  description?: string
  permissions: PermissionType[]
  createdAt: string
}
