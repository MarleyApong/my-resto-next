import { RoleType } from "./role"

export type UserType = {
  id: string
  firstname: string
  lastname?: string
  organizationId: string
  restaurantId?: string
  organization?: {
    id: string
    name: string
  }
  restaurant?: {
    id: string
    name: string
  }
  role: RoleType
  phone: string
  email: string
  city?: string
  neighborhood?: string
  picture: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
}

export type UserCreateType = {
  firstname: string
  lastname?: string
  organizationId: string
  restaurantId?: string
  roleId?: string
  phone: string
  email: string
  city?: string
  neighborhood?: string
  picture: string
  status: "ACTIVE" | "INACTIVE"
}

export type UserUpdateType = {
  firstname: string
  lastname?: string
  organizationId: string
  restaurantId?: string
  roleId: string
  phone: string
  email: string
  city?: string
  neighborhood?: string
  picture: string
  status: "ACTIVE" | "INACTIVE"
}
