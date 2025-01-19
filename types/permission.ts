export type PermissionType = {
  menuId: string
  view: boolean
  create: boolean
  update: boolean
  delete: boolean
  specificsPermissions: any[] // Array of specific permission actions
}
