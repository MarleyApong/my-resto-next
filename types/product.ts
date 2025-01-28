export type ProductType = {
  id: string
  name: string
  category: string
  organization: string
  restaurant: string
  description: string
  price: string | number
  specialPrice: string | number
  picture: string
  status: "ACTIVE" | "INACTIVE"
  createAt: string
}