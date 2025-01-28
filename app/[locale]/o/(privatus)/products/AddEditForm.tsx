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
import { restaurantSchema, restaurantUpdateSchema } from "@/schemas/restaurant"
import { organizationService } from "@/services/organizationService"
import { ProductType } from "@/types/product"
import { RestaurantType } from "@/types/restaurant"
import { zodResolver } from "@hookform/resolvers/zod"
import { HardDriveDownload, HardDriveUpload, ImagePlus, ImageUp, X } from "lucide-react"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"

export const AddEditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: Product | null; onSubmit: (data: Product) => void; onCancel: () => void }) => {
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
      organization: "",
      restaurant: "",
      description: "",
      picture: "",
      status: "active"
    },
    resolver: zodResolver(productSchema)
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pictureUrl = watch("picture")
  const description = watch("description", "")
  const remainingChars = 50 - description.length

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
          <Select value={watch("restaurant")} onValueChange={(value) => setValue("restaurant", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Restaurant" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((product) => (
                <SelectItem key={product.id} value={product.name}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="organization">Organization</Label>
          <Select value={watch("organization")} onValueChange={(value) => setValue("organization", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((product) => (
                <SelectItem key={product.id} value={product.name}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.organization && <p className="text-red-600 text-xs">{errors.organization.message}</p>}
        </div>
        <div className="sm:col-span-1 lg:col-span-1">
          <Label htmlFor="restaurant">Restaurant</Label>
          <Select value={watch("restaurant")} onValueChange={(value) => setValue("restaurant", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((product) => (
                <SelectItem key={product.id} value={product.name}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.restaurant && <p className="text-red-600 text-xs">{errors.restaurant.message}</p>}
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" {...register("price")} placeholder="Price" />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="specialPrice">Special price</Label>
          <Input id="specialPrice" {...register("specialPrice")} placeholder="Special price" />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register("description")} placeholder="Description" />
          <p className="text-xs text-gray-500">{remainingChars} characters remaining</p>
          {errors.description && <p className="text-red-600 text-xs">{errors.description.message}</p>}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={watch("status")} onValueChange={(value) => setValue("status", value as "active" | "inactive")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
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
