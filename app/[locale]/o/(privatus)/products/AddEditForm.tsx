import { Combobox } from "@/components/features/Combobox"
import { Loader, SpecificalLoader } from "@/components/features/SpecificalLoader"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { useError } from "@/hooks/useError"
import { productSchema } from "@/schemas/product"
import { organizationService } from "@/services/organizationService"
import { restaurantService } from "@/services/restaurantService"
import { productCategoryService } from "@/services/productCategoryService"
import { ProductType } from "@/types/product"
import { zodResolver } from "@hookform/resolvers/zod"
import { HardDriveDownload, HardDriveUpload, ImagePlus, ImageUp, X } from "lucide-react"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"

export const AddEditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: ProductType | null; onSubmit: (data: ProductType) => void; onCancel: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductType>({
    defaultValues: defaultValues || {
      name: "",
      price: 0,
      specialPrice: 0,
      quantity: 0, // Nouveau champ pour la quantité
      organizationId: "",
      restaurantId: "",
      description: "",
      picture: "",
      status: "INACTIVE"
    },
    resolver: zodResolver(productSchema)
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pictureUrl = watch("picture")
  const description = watch("description", "")
  const remainingChars = 50 - description.length

  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const { setIsLoading } = useAuth()
  const { showError } = useError()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch organizations
        const orgsResponse = await organizationService.getAll({ page: 0, size: 100, order: "asc", filter: "name" })
        setOrganizations(orgsResponse.data.data.map((org: any) => ({ id: org.id, name: org.name })))

        // Fetch restaurants
        const restosResponse = await restaurantService.getAll({ page: 0, size: 100, order: "asc", filter: "name" })
        setRestaurants(restosResponse.data.data.map((resto: any) => ({ id: resto.id, name: resto.name })))

        // Fetch product categories
        const categoriesResponse = await productCategoryService.getAll({ page: 0, size: 100, order: "asc", filter: "name" })
        setCategories(categoriesResponse.data.data.map((cat: any) => ({ id: cat.id, name: cat.name })))
      } catch (err) {
        showError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setValue("picture", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-4 lg:grid-cols-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
      {/* Left side - Form Fields */}
      <div className="col-span-3 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
        <div>
          <Label htmlFor="name">Product name</Label>
          <Input id="name" {...register("name")} placeholder="Product Name" />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={watch("category")} onValueChange={(value) => setValue("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-red-600 text-xs">{errors.category.message}</p>}
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
        <div className="sm:col-span-1 lg:col-span-1">
          <Label htmlFor="restaurant">Restaurant</Label>
          <Select value={watch("restaurantId")} onValueChange={(value) => setValue("restaurantId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((resto) => (
                <SelectItem key={resto.id} value={resto.id}>
                  {resto.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.restaurantId && <p className="text-red-600 text-xs">{errors.restaurantId.message}</p>}
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" {...register("price", { valueAsNumber: true })} placeholder="Price" />
          {errors.price && <p className="text-red-600 text-xs">{errors.price.message}</p>}
        </div>

        <div>
          <Label htmlFor="specialPrice">Special price</Label>
          <Input id="specialPrice" {...register("specialPrice", { valueAsNumber: true })} placeholder="Special price" />
          {errors.specialPrice && <p className="text-red-600 text-xs">{errors.specialPrice.message}</p>}
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" {...register("quantity", { valueAsNumber: true })} placeholder="Quantity" />
          {errors.quantity && <p className="text-red-600 text-xs">{errors.quantity.message}</p>}
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} placeholder="Description" />
          <p className="text-xs text-gray-500">{remainingChars} characters remaining</p>
          {errors.description && <p className="text-red-600 text-xs">{errors.description.message}</p>}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={watch("status")} onValueChange={(value) => setValue("status", value as "ACTIVE" | "INACTIVE")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-red-600 text-xs">{errors.status.message}</p>}
        </div>
      </div>

      {/* Right side - Picture Upload */}
      <div className="col-span-3 lg:col-span-1 row-span-1 mr-2">
        <Label htmlFor="picture">Picture</Label>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        <div
          className="w-full min-h-[196px] max-h-[196px] overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-blue-950"
          onClick={handleImageClick}
        >
          {pictureUrl ? (
            <img src={pictureUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <ImagePlus className="w-12 h-12 text-gray-500 mb-2" />
              <span>Click to add an image</span>
            </div>
          )}
        </div>
        <Button type="button" variant="secondary" className="mt-2 w-full" onClick={handleImageClick}>
          <ImageUp className="w-4 h-4" />
          {pictureUrl ? "Change Image" : "Choose image"}
        </Button>
      </div>

      {/* Footer */}
      <DialogFooter className="flex gap-1 col-span-3 justify-end p-1 border-t">
        <Button type="submit" size="sm">
          <HardDriveDownload className="w-4 h-4" />
          Save
        </Button>
        <Button variant="close" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </DialogFooter>
    </form>
  )
}
