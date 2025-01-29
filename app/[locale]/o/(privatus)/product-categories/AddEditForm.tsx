import { Combobox } from "@/components/features/Combobox"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { useError } from "@/hooks/useError"
import { productCategorySchema } from "@/schemas/productCategory"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { organizationService } from "@/services/organizationService"
import { ProductCategoryType } from "@/types/productCategory"

export const AddEditForm = ({
  defaultValues,
  onSubmit,
  onCancel
}: {
  defaultValues?: ProductCategoryType | null
  onSubmit: (data: ProductCategoryType) => void
  onCancel: () => void
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductCategoryType>({
    defaultValues: defaultValues || {
      name: "",
      description: "",
      organizationId: "",
      restaurantId: ""
    },
    resolver: zodResolver(productCategorySchema)
  })

  const [organizations, setOrganizations] = useState<any[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])

  useEffect(() => {
    const fetchOrganizations = async () => {
      const response = await organizationService.getOrganizationsByPermissions()
      setOrganizations(response.data)
    }
    fetchOrganizations()
  }, [])

  useEffect(() => {
    const organizationId = watch("organizationId")
    if (organizationId) {
      const fetchRestaurants = async () => {
        const response = await organizationService.getRestaurantsByOrg(organizationId)
        setRestaurants(response.data)
      }
      fetchRestaurants()
    }
  }, [watch("organizationId")])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-4 lg:grid-cols-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
      <div className="col-span-3 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
        <div>
          <Label htmlFor="name">Category name</Label>
          <Input id="name" {...register("name")} placeholder="Category Name" />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="organization">Organization</Label>
          <Select value={watch("organizationId")} onValueChange={(value) => setValue("organizationId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.organizationId && <p className="text-red-600 text-xs">{errors.organizationId.message}</p>}
        </div>
        <div>
          <Label htmlFor="restaurant">Restaurant</Label>
          <Select value={watch("restaurantId")} onValueChange={(value) => setValue("restaurantId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.restaurantId && <p className="text-red-600 text-xs">{errors.restaurantId.message}</p>}
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} placeholder="Description" />
          {errors.description && <p className="text-red-600 text-xs">{errors.description.message}</p>}
        </div>
      </div>
      <DialogFooter className="flex gap-1 col-span-3 justify-end p-1 border-t">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button variant="close" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </form>
  )
}
