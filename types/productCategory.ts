export type ProductCategoryType = {
  id: string
  name: string
  description?: string
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
  createdAt: string
  updatedAt: string
}

export type CreateProductCategory = {
  name: string
  description?: string
  organizationId: string
  restaurantId?: string
}

export type UpdateProductCategory = {
  name?: string
  description?: string
  organizationId?: string
  restaurantId?: string
}
