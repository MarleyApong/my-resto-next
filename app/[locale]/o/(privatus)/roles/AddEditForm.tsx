import { Loader } from "@/components/features/SpecificalLoader"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { roleSchema, roleUpdateSchema } from "@/schemas/role"
import { RoleType } from "@/types/role"
import { zodResolver } from "@hookform/resolvers/zod"
import { HardDriveDownload, HardDriveUpload, X } from "lucide-react"
import { useForm } from "react-hook-form"

export const AddEditForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing
}: {
  defaultValues?: RoleType | null
  onSubmit: (data: RoleType) => void
  onCancel: () => void
  isEditing: boolean
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RoleType>({
    defaultValues: defaultValues || {
      name: "",
      description: ""
    },
    resolver: zodResolver(isEditing ? roleUpdateSchema : roleSchema)
  })

  const { isLoading } = useAuth()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 p-2">
      <div>
        <Label htmlFor="name">Role Name</Label>
        <Input id="name" {...register("name")} placeholder="Role Name" />
        {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} placeholder="Description" />
        {errors.description && <p className="text-red-600 text-xs">{errors.description.message}</p>}
      </div>

      <DialogFooter className="flex gap-1 justify-end p-1 border-t">
        <Button type="submit" variant={isEditing ? "sun" : "default"} disabled={isLoading} size="sm">
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
