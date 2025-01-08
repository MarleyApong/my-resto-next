export type PermissionType = {
  menuId: string
  view: boolean
  create: boolean
  update: boolean
  delete: boolean
  permissionActions: any[] // Array of specific permission actions
}
