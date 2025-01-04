import { Loader } from "@/components/features/SpecificalLoader"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { organizationSchema, organizationUpdateSchema } from "@/schemas/organization"
import { OrganizationType } from "@/types/organization"
import { zodResolver } from "@hookform/resolvers/zod"
import { HardDriveDownload, HardDriveUpload, ImagePlus, ImageUp, X } from "lucide-react"
import { ChangeEvent, useRef } from "react"
import { useForm } from "react-hook-form"

export const AddEditForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing
}: {
  defaultValues?: OrganizationType | null
  onSubmit: (data: OrganizationType) => void
  onCancel: () => void
  isEditing: boolean
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<OrganizationType>({
    defaultValues: defaultValues || {
      name: "",
      description: "",
      city: "",
      neighborhood: "",
      phone: "",
      picture: "",
      status: "INACTIVE"
    },
    resolver: zodResolver(isEditing ? organizationUpdateSchema : organizationSchema)
  })

  const { isLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pictureUrl = watch("picture")
  const description = watch("description", "")
  const remainingChars = 170 - description.length

  // Watch all form fields
  const formValues = watch()

  // Function to check if form has been modified
  const isFormModified = () => {
    if (!defaultValues) return true // Always enabled for new entries
    return Object.keys(defaultValues).some((key) => {
      const field = key as keyof OrganizationType
      return formValues[field] !== defaultValues[field]
    })
  }

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
      {/* Right side - Picture Upload (Only in Add Mode) */}
      {!isEditing && (
        <div className="sm:col-span-3 lg:col-span-1 md:col-span-1 row-span-1 ml-2">
          <Label htmlFor="picture">Logo</Label>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          <div
            className="w-full min-h-[196px] max-h-[196px] max-w-[280px] overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed rounded-sm"
            onClick={handleImageClick}
          >
            {pictureUrl ? (
              <img src={pictureUrl} alt="Preview" className="w-full h-full bg-cover object-cover max-w-[280px] flex" />
            ) : (
              <div className="flex flex-col items-center">
                <ImagePlus className="w-12 h-12 text-gray-500 mb-2" />
                <span>Click to add an image</span>
              </div>
            )}
          </div>
          <Button type="button" variant="secondary" className="mt-2 w-full" disabled={isLoading} onClick={handleImageClick}>
            <ImageUp className="w-4 h-4" />
            {pictureUrl ? "Change Image" : "Choose image"}
          </Button>
        </div>
      )}

      {/* Left side - Form Fields */}
      <div className={`${isEditing ? "col-span-4 sm:grid-cols-2 gap-4 p-2" : "col-span-3 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2"} grid gap-4 p-2`}>
        {/* Name Field (Full Width in Edit Mode) */}
        <div className={`${isEditing ? "sm:col-span-1" : "sm:col-span-2 lg:col-span-2"}`}>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="Organization Name" />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-1 lg:col-span-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="City" />
          {errors.city && <p className="text-red-600 text-xs">{errors.city.message}</p>}
        </div>
        <div className="sm:col-span-1">
          <Label htmlFor="neighborhood">Neighborhood</Label>
          <Input id="neighborhood" {...register("neighborhood")} placeholder="Neighborhood" />
          {errors.neighborhood && <p className="text-red-600 text-xs">{errors.neighborhood.message}</p>}
        </div>
        <div className="sm:col-span-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} placeholder="Phone" />
          {errors.phone && <p className="text-red-600 text-xs">{errors.phone.message}</p>}
        </div>

        {/* Status Field (Only in Add Mode) */}
        {!isEditing && (
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
        )}

        {/* Description Field */}
        <div className={`${isEditing ? "col-span-2 sm:col-span-2" : "sm:col-span-2 lg:col-span-3"}`}>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" maxLength={170} {...register("description")} placeholder="Description" className="resize-none" rows={4} />
          <p className="text-xs text-gray-500">{remainingChars} characters remaining</p>
          {errors.description && <p className="text-red-600 text-xs">{errors.description.message}</p>}
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="flex gap-1 justify-end p-1 col-span-3 border-t">
        <Button type="submit" variant={isEditing ? "sun" : "printemps"} disabled={isLoading || !isFormModified()} size="sm">
          {isLoading ? <Loader /> : isEditing ? <HardDriveUpload className="w-4 h-4" /> : <HardDriveDownload />}
          {isEditing ? "Update" : "Add"}
        </Button>
        <Button variant="close" size="sm" disabled={isLoading} onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </DialogFooter>
    </form>
  )
}
