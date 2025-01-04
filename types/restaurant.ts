export type RestaurantType = {
  id: string
  organizationId: string
  organization?: {
    id?: string
    name?: string
  }
  name: string
  description: string
  city: string
  neighborhood: string
  phone: string
  email: string
  picture: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
}
