"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DataTable, FilterState } from "@/components/features/DataTable"
import { Trash2, Edit, Eye, Plus, ImagePlus, PhoneIcon, Calendar1, X, HardDriveDownload, ImageUp, SaveOff, TowerControl, Cctv, Utensils, HardDriveUpload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ParamsType } from "@/types/param"
import { statusOrganization } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"
import { OrganizationType } from "@/types/organization"
import Level2 from "@/components/features/Level2"
import { organizationService } from "@/services/organizationService"
import { toast } from "sonner"
import { useError } from "@/hooks/useError"
import { format } from "date-fns"

const organizationSchema = z.object({
  name: z.string().min(1, "Field is required"),
  description: z.string().min(70, "Description must be at least 70 characters").max(170, "Description must not exceed 170 characters"),
  city: z.string().min(1, "Field is required"),
  neighborhood: z.string().min(1, "Field is required"),
  phone: z.string().min(1, "Field is required").regex(/^\d+$/, "Phone must contain only numbers"),
  picture: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"])
})

const Organization = () => {
  const { showError } = useError()
  const [isEditing, setIsEditing] = useState<OrganizationType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState<boolean>(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false)
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationType | null>(null)
  const [filterState, setFilterState] = useState<ParamsType>({
    page: 0,
    size: 20,
    filter: "name",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "*"
  })
  const [organizations, setOrganizations] = useState<{
    data: OrganizationType[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: [],
    recordsFiltered: 0,
    recordsTotal: 0
  })

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleSizeChange = (size: number) => {
    setFilterState((prev) => ({ ...prev, size }))
  }

  const loadData = async () => {
    try {
      const res = await organizationService.getAll(filterState)
      setOrganizations({
        data: res.data.data,
        recordsFiltered: res.data.recordsFiltered,
        recordsTotal: res.data.recordsTotal
      })
    } catch (err) {
      showError(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [filterState])

  const handleStatusChange = async () => {
    if (selectedOrganization) {
      try {
        const res = await organizationService.updateStatus(selectedOrganization.id, newStatus)
        toast.success(res.data?.message)
        loadData()
        setIsStatusDialogOpen(false)
      } catch (err) {
        showError(err)
      }
    }
  }

  const handleUpdatePicture = async (id: string, picture: string) => {
    try {
      const res = await organizationService.updatePicture(id, picture)
      toast.success(res.data?.message)
      loadData()
    } catch (err) {
      showError(err)
    }
  }

  const handleUpdateStatus = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    try {
      const res = await organizationService.updateStatus(id, status)
      toast.success(res.data?.message)
      loadData()
    } catch (err) {
      showError(err)
    }
  }

  const handleDelete = async () => {
    if (selectedOrganization?.id) {
      try {
        const res = await organizationService.delete(selectedOrganization.id)
        toast.success(res.data?.message)
        loadData()
        setIsDeleteDialogOpen(false)
      } catch (err) {
        showError(err)
      }
    }
  }

  const handleFilterChange = (filters: FilterState) => {
    setFilterState((prev) => ({
      ...prev,
      filter: filters.filter || "name",
      status: filters.status || "*",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.search
    }))
  }

  console.log("filterState", filterState)

  const handleAddOrEdit = async (data: OrganizationType) => {
    try {
      if (isEditing?.id) {
        const res = await organizationService.update(isEditing.id, data)
        toast.success(res.data?.message)
      } else {
        const res = await organizationService.create(data)
        toast.success(res.data?.message)
      }
      loadData()
      setIsAddOrEditDialogOpen(false)
      setIsEditing(null)
    } catch (err) {
      showError(err)
    }
  }

  const handleCancel = () => {
    setIsAddOrEditDialogOpen(false)
    setIsEditing(null)
  }

  console.log("IsEditing", isEditing)

  const columns = [
    { accessorKey: "name", header: "Restaurant" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status.name
        const badgeStyle = status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"

        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${badgeStyle}`}>{status}</span>
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const org = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedOrganization(org)
                setIsViewDialogOpen(true)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              variant="sun"
              size="icon"
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
              onClick={() => {
                setSelectedOrganization(org)
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
      <Level2 title="Organizations">
        <Button variant="default" size="sm" onClick={() => setIsAddOrEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </Level2>

      <DataTable
        totalItems={organizations.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        columns={columns}
        data={organizations.data}
        statusOptions={statusOrganization}
        filterByOptions={filterOptionOrganization}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md p-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit Organization" : "Add New Organization"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected organization." : "Fill in the details to create a new organization."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={handleCancel} isEditing={!!isEditing} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Organization Details: {selectedOrganization?.name}</DialogTitle>
          </DialogHeader>

          {selectedOrganization && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="w-full min-h-72 border-none shadow-md rounded-sm overflow-hidden">
                {selectedOrganization.picture && <img src={selectedOrganization.picture} alt="Organization" className="w-full h-full object-cover" />}
                <Button
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() => {
                    // Handle image change
                    const fileInput = document.createElement("input")
                    fileInput.type = "file"
                    fileInput.accept = "image/*"
                    fileInput.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          handleUpdatePicture(selectedOrganization.id, reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }
                    fileInput.click()
                  }}
                >
                  {selectedOrganization.picture ? "Update Picture" : "Change Picture"}
                </Button>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold">Description</h2>

                <p className="text-sm text-gray-500 ml-2">{selectedOrganization.description}</p>

                {/* Additional Information */}
                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">More</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedOrganization.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <TowerControl className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{`${selectedOrganization.city} - ${selectedOrganization.neighborhood}`}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar1 className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{format(selectedOrganization.createdAt, "yyyy-mm-dd hh:mm:ss")}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">Affiliation</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Cctv className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Boss</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">10 restaurants</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-1 justify-end p-1 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                const fileInput = document.createElement("input")
                fileInput.type = "file"
                fileInput.accept = "image/*"
                fileInput.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      handleUpdatePicture(selectedOrganization!.id, reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }
                fileInput.click()
              }}
            >
              {selectedOrganization?.picture ? "Update Picture" : "Change Picture"}
            </Button>

            <Button
              variant={selectedOrganization?.status === "ACTIVE" ? "destructive" : "default"}
              onClick={() => {
                setNewStatus(selectedOrganization?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")
                setIsStatusDialogOpen(true)
              }}
            >
              {selectedOrganization?.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setIsEditing(selectedOrganization)
                setIsViewDialogOpen(false)
                setIsAddOrEditDialogOpen(true)
              }}
            >
              <Edit className="w-4 h-4" /> Edit
            </Button>
            <Button size="sm" variant="close" onClick={() => setIsViewDialogOpen(false)}>
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
            <Button size="sm" variant="destructive" onClick={handleStatusChange}>
              <SaveOff className="w-4 h-4" />
              Confirm
            </Button>
            <Button size="sm" variant="close" onClick={() => setIsStatusDialogOpen(false)}>
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
          <DialogDescription>{`Are you sure you want to delete the organization "${selectedOrganization?.name}" ?`}</DialogDescription>
          <DialogFooter>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <SaveOff className="w-4 h-4" />
              Delete
            </Button>
            <Button size="sm" variant="close" onClick={() => setIsDeleteDialogOpen(false)}>
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
    resolver: zodResolver(organizationSchema)
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pictureUrl = watch("picture")
  const description = watch("description", "")
  const remainingChars = 170 - description.length

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
      <div className="col-span-3 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="Organization Name" />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>
        <div className="sm:col-span-1 lg:col-span-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="City" />
          {errors.city && <p className="text-red-600 text-xs">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="neighborhood">Neighborhood</Label>
          <Input id="neighborhood" {...register("neighborhood")} placeholder="Neighborhood" />
          {errors.neighborhood && <p className="text-red-600 text-xs">{errors.neighborhood.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} placeholder="Phone" />
          {errors.phone && <p className="text-red-600 text-xs">{errors.phone.message}</p>}
        </div>
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
        <div className="sm:col-span-2 lg:col-span-3">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" maxLength={170} {...register("description")} placeholder="Description" className="resize-none" rows={4} />
          <p className="text-xs text-gray-500">{remainingChars} characters remaining</p>
          {errors.description && <p className="text-red-600 text-xs">{errors.description.message}</p>}
        </div>
      </div>

      {/* Right side - Picture Upload */}
      {!isEditing && (
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
      )}

      {/* Footer */}
      <DialogFooter className="flex gap-1 justify-end p-1 col-span-3 border-t">
        <Button type="submit" variant={isEditing ? "sun" : "printemps"} size="sm">
          {isEditing ? <HardDriveUpload className="w-4 h-4" /> : <HardDriveDownload />}
          {isEditing ? "Update" : "Add"}
        </Button>
        <Button variant="close" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </DialogFooter>
    </form>
  )
}

export default Organization
