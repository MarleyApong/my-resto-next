export interface ProductType {
  id: string
  name: string
  description: string
  category: string
  price: number
  specialPrice?: number
  organizationId: string
  restaurantId: string
  organization: string
  restaurant: string
  status: "ACTIVE" | "INACTIVE"
  picture: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}