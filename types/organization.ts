export type OrganizationType = {
  id: string
  name: string
  description: string
  city: string
  neighborhood: string
  phone: string
  picture: string
  status: "ACTIVE" | "INACTIVE",
  createdAt: string
}
