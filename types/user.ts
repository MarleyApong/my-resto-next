export type UserType = {
  id: string
  firstname: string
  lastname?: string
  organizationId: string
  restaurantId?: string
  organization: {
    id: string,
    name: string
  }
  restaurant: {
    id: string,
    name: string
  }
  role: string
  phone: string
  email: string
  picture: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
}
