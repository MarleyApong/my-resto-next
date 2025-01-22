export type PermissionType = {
  create: boolean
  view: boolean
  update: boolean
  delete: boolean
}

export type SpecificPermission = {
  name: string
  granted: boolean
  description?: string
}

export type MenuType = {
  id: string
  name: string
  description: string
  permissions: PermissionType
  specificPermissions: SpecificPermission[]
}
