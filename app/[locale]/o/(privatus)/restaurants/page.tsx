"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DataTable, FilterState } from "@/components/features/DataTable"
import {
  Trash2,
  Edit,
  Eye,
  Plus,
  ImagePlus,
  PhoneIcon,
  Calendar1,
  X,
  HardDriveDownload,
  ImageUp,
  SaveOff,
  TowerControl,
  Cctv,
  Utensils,
  HardDriveUpload,
  SendToBack,
  Building,
  Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/features/Combobox"
import { ParamsType } from "@/types/param"
import { statusOrganization } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"
import { RestaurantType } from "@/types/restaurant"
import { Level2 } from "@/components/features/Level2"
import { restaurantService } from "@/services/restaurantService"
import { toast } from "sonner"
import { useError } from "@/hooks/useError"
import { format } from "date-fns"
import { restaurantSchema, restaurantUpdateSchema } from "@/schemas/restaurant"
import { useAuth } from "@/hooks/useAuth"
import { Loader } from "@/components/features/SpecificalLoader"

const Restaurant = () => {
  const { showError } = useError()
  const { setIsLoading, isLoading } = useAuth()

  const [isEditing, setIsEditing] = useState<RestaurantType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState<boolean>(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false)
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantType | null>(null)
  const [filterState, setFilterState] = useState<ParamsType>({
    order: "desc",
    page: 0,
    size: 20,
    filter: "name",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "*"
  })
  const [restaurants, setRestaurants] = useState<{
    data: RestaurantType[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: [],
    recordsFiltered: 0,
    recordsTotal: 0
  })
  const [tempImage, setTempImage] = useState<string | null>(null)

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleSizeChange = (size: number) => {
    setFilterState((prev) => ({ ...prev, size }))
  }

  const handleFilterChange = (filters: FilterState) => {
    setFilterState((prev) => ({
      ...prev,
      order: filters.order || "desc",
      filter: filters.filter || "name",
      status: filters.status || "*",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.search
    }))
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await restaurantService.getAll(filterState)
      setRestaurants({
        data: res.data.data,
        recordsFiltered: res.data.recordsFiltered,
        recordsTotal: res.data.recordsTotal
      })
    } catch (err) {
      showError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filterState])

  const handleStatusChange = async () => {
    if (selectedRestaurant) {
      setIsLoading(true)
      try {
        const res = await restaurantService.updateStatus(selectedRestaurant.id, newStatus)
        const updatedResto = await restaurantService.getById(selectedRestaurant.id)
        toast.success(res.data?.message)

        setSelectedRestaurant(updatedResto.data.data)
        loadData()
        setIsStatusDialogOpen(false)
      } catch (err) {
        showError(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleUpdatePicture = async (id: string, picture: string) => {
    setIsLoading(true)
    try {
      const res = await restaurantService.updatePicture(id, picture)
      const updatedResto = await restaurantService.getById(selectedRestaurant!.id)

      toast.success(res.data?.message)
      setSelectedRestaurant(updatedResto.data.data)
      loadData()
    } catch (err) {
      showError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (selectedRestaurant?.id) {
      setIsLoading(true)
      try {
        const res = await restaurantService.delete(selectedRestaurant.id)
        toast.success(res.data?.message)
        loadData()
        setIsDeleteDialogOpen(false)
      } catch (err) {
        showError(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddOrEdit = async (data: RestaurantType) => {
    setIsLoading(true)
    try {
      if (isEditing?.id) {
        const res = await restaurantService.update(isEditing.id, data)
        toast.success(res.data?.message)
      } else {
        const res = await restaurantService.create(data)
        toast.success(res.data?.message)
      }
      loadData()
      setIsAddOrEditDialogOpen(false)
      setIsEditing(null)
    } catch (err) {
      showError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsAddOrEditDialogOpen(false)
    setIsEditing(null)
  }

  const handleImageChange = (e: Event) => {
    const fileInput = e.target as HTMLInputElement
    const file = fileInput.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.onchange = handleImageChange
    fileInput.click()
  }

  const handleUploadPicture = () => {
    if (tempImage && selectedRestaurant) {
      handleUpdatePicture(selectedRestaurant.id, tempImage)
      setTempImage(null)
    }
  }

  const columns = [
    { accessorKey: "organization", header: "Organization" },
    { accessorKey: "name", header: "Restaurant" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status
        const badgeStyle = status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"

        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${badgeStyle}`}>{status}</span>
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: any) => {
        const org = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="default"
              size="icon"
              disabled={isLoading}
              onClick={() => {
                setNewStatus(org?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")
                setSelectedRestaurant(org)
                setIsViewDialogOpen(true)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              variant="sun"
              size="icon"
              disabled={isLoading}
              onClick={() => {
                setIsEditing(org)
                setIsAddOrEditDialogOpen(true)
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              disabled={isLoading}
              onClick={() => {
                setSelectedRestaurant(org)
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <div>
      <Level2>
        <Button variant="default" size="sm" disabled={isLoading} onClick={() => setIsAddOrEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Resto
        </Button>
      </Level2>

      <DataTable
        totalItems={restaurants.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        columns={columns}
        data={restaurants.data}
        statusOptions={statusOrganization}
        filterByOptions={filterOptionOrganization}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className={`${!isEditing ? "max-w-4xl" : "max-w-xl"} p-0`}>
          <DialogHeader className="shadow-md p-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit Restaurant" : "Add New Restaurant"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected restaurant." : "Fill in the details to create a new restaurant."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={handleCancel} isEditing={!!isEditing} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Restaurant Details: {selectedRestaurant?.name}</DialogTitle>
          </DialogHeader>

          {selectedRestaurant && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="w-full min-h-72 border-none shadow-md rounded-sm overflow-hidden" onClick={handleImageClick}>
                {(tempImage || selectedRestaurant.picture) && <img src={tempImage || selectedRestaurant.picture} alt="Restaurant" className="w-full h-full object-cover" />}
                <Button variant="secondary" className="mt-2 w-full" onClick={tempImage ? handleUploadPicture : handleImageClick}>
                  {tempImage ? "Upload" : selectedRestaurant.picture ? "Update Picture" : "Choose Picture"}
                </Button>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold">Description</h2>
                <p className="text-sm text-gray-500 ml-2">{selectedRestaurant.description}</p>

                {/* Additional Information */}
                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">More</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedRestaurant.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedRestaurant.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <TowerControl className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{`${selectedRestaurant.city} - ${selectedRestaurant.neighborhood}`}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar1 className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{format(selectedRestaurant.createdAt, "yyyy-mm-dd hh:mm:ss")}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">Affiliation</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedRestaurant.organizationId}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Cctv className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Boss</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-1 justify-end p-1 border-t">
            <Button variant="sun" disabled={isLoading} onClick={tempImage ? handleUploadPicture : handleImageClick}>
              {tempImage ? "Upload" : selectedRestaurant?.picture ? "Update Picture" : "Choose Picture"}
            </Button>

            <Button
              variant={selectedRestaurant?.status === "ACTIVE" ? "destructive" : "default"}
              disabled={isLoading}
              onClick={() => {
                setIsStatusDialogOpen(true)
              }}
            >
              {selectedRestaurant?.status === "ACTIVE" ? "Desactivate" : "Activate"}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              disabled={isLoading}
              onClick={() => {
                setIsEditing(selectedRestaurant)
                setIsViewDialogOpen(false)
                setIsAddOrEditDialogOpen(true)
              }}
            >
              <Edit className="w-4 h-4" /> Edit
            </Button>
            <Button size="sm" variant="close" disabled={isLoading} onClick={() => setIsViewDialogOpen(false)}>
              <X className="w-4 h-4" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm status */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
          </DialogHeader>
          <DialogDescription>{`Are you sure you want to change the status to "${newStatus}"?`}</DialogDescription>
          <DialogFooter>
            <Button size="sm" variant="sun" disabled={isLoading} onClick={handleStatusChange}>
              {isLoading ? <Loader /> : <SendToBack className="w-4 h-4" />}
              Confirm
            </Button>
            <Button size="sm" variant="close" disabled={isLoading} onClick={() => setIsStatusDialogOpen(false)}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>{`Are you sure you want to delete the restaurant "${selectedRestaurant?.name}" ?`}</DialogDescription>
          <DialogFooter>
            <Button size="sm" variant="destructive" disabled={isLoading} onClick={handleDelete}>
              {isLoading ? <Loader /> : <SaveOff className="w-4 h-4" />}
              Delete
            </Button>
            <Button size="sm" variant="close" disabled={isLoading} onClick={() => setIsDeleteDialogOpen(false)}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add/Edit Form
const AddEditForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing
}: {
  defaultValues?: RestaurantType | null
  onSubmit: (data: RestaurantType) => void
  onCancel: () => void
  isEditing: boolean
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RestaurantType>({
    defaultValues: defaultValues || {
      name: "",
      organizationId: "",
      description: "",
      city: "",
      neighborhood: "",
      phone: "",
      email: "",
      picture: "",
      status: "INACTIVE"
    },
    resolver: zodResolver(isEditing ? restaurantUpdateSchema : restaurantSchema)
  })

  const { isLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pictureUrl = watch("picture")
  const description = watch("description", "")
  const remainingChars = 170 - description.length

  // État pour stocker la liste des organisations
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])

  // Charger les organisations au montage du composant
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        // const res = await organizationService.getAll()
        // setOrganizations(res.data)
      } catch (err) {
        console.error("Failed to fetch organizations:", err)
      }
    }

    fetchOrganizations()
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
         {/* Organization Field */}
         <div className="sm:col-span-1 lg:col-span-1">
          <Label htmlFor="organization">Organization</Label>
          {isEditing ? (
            <Input id="organization" {...register("organizationId")} placeholder="Organization" disabled />
          ) : (
            <Combobox
              options={organizations.map((org) => ({ value: org.id, label: org.name }))}
              value={watch("organizationId")}
              onValueChange={(value) => setValue("organizationId", value)}
              placeholder="Select Organization"
            />
          )}
          {errors.organizationId && <p className="text-red-600 text-xs">{errors.organizationId.message}</p>}
        </div>
        
        {/* Name Field (Full Width in Edit Mode) */}
        <div className={`${isEditing ? "sm:col-span-1" : "sm:col-span-2 lg:col-span-2"}`}>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="Restaurant Name" />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>

        {/* City Field */}
        <div className="sm:col-span-1 lg:col-span-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="City" />
          {errors.city && <p className="text-red-600 text-xs">{errors.city.message}</p>}
        </div>

        {/* Neighborhood Field */}
        <div className="sm:col-span-1">
          <Label htmlFor="neighborhood">Neighborhood</Label>
          <Input id="neighborhood" {...register("neighborhood")} placeholder="Neighborhood" />
          {errors.neighborhood && <p className="text-red-600 text-xs">{errors.neighborhood.message}</p>}
        </div>

        {/* Phone Field */}
        <div className="sm:col-span-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} placeholder="Phone" />
          {errors.phone && <p className="text-red-600 text-xs">{errors.phone.message}</p>}
        </div>

        {/* Email Field */}
        <div className="sm:col-span-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register("email")} placeholder="Email" />
          {errors.email && <p className="text-red-600 text-xs">{errors.email.message}</p>}
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
        <Button type="submit" variant={isEditing ? "sun" : "printemps"} disabled={isLoading} size="sm">
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

export default Restaurant
