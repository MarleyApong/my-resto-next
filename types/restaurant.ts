export type RestaurantType = {
  id: string
  organizationId: string
  name: string
  description: string
  city: string
  neighborhood: string
  phone: string
  email: string
  picture: string
  status: "ACTIVE" | "INACTIVE",
  createdAt: string
}
