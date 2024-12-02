"use client"

import { useState, useRef, ChangeEvent } from "react"
import { z } from "zod"
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
  Mail,
  TowerControl,
  Building,
  Cookie,
  ConciergeBell,
  Cctv
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Params } from "@/types/paramTypes"
import { statusRestaurant } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"
import Level2 from "@/components/features/Level2"

// Type and Validation Schema
type User = {
  firstname: string
  lastname?: string
  organization: string
  restaurant: string
  role: string
  phone: string
  email: string
  picture: string
  status: "active" | "inactive"
  createAt: string
}

const userSchema = z.object({
  firstname: z.string().min(1, "Firstname is required"),
  organization: z.string().min(1, "Organization is required"),
  restaurant: z.string().min(1, "Restaurant is required"),
  role: z.string().min(1, "Role is required"),
  env: z.string().min(1, "Environnment is required"),
  phone: z.string().regex(/^\d+$/, "Phone must contain only numbers"),
  picture: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  email: z.string().email("Invalid email format").min(1, "Email is required")
})

// Dummy Data
const initialRestaurants: User[] = [
  {
    firstname: "Aqwe",
    lastname: "Ivan",
    organization: "Organization 1",
    restaurant: "Resto 1",
    role: "Admin",
    phone: "123456789",
    email: "test@yahoo.fr",
    picture: "/assets/img/avatar/product.jpg",
    status: "active",
    createAt: "2024-12-22"
  },
  {
    firstname: "Aqwe",
    lastname: "Ivan",
    organization: "Organization 1",
    restaurant: "Resto 1",
    role: "Admin",
    phone: "123456789",
    email: "test@yahoo.fr",
    picture: "/assets/img/avatar/product.jpg",
    status: "active",
    createAt: "2024-12-22"
  }
]

const organizations = [
  { id: "org1", name: "Organization A" },
  { id: "org2", name: "Organization B" },
  { id: "org3", name: "Organization C" }
]

const restaurants = [
  { id: "resto1", name: "Restaurant A" },
  { id: "resto2", name: "Restaurant B" },
  { id: "resto3", name: "Restaurant C" }
]

const User = () => {
  const [isEditing, setIsEditing] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<User | null>(null)
  const [filterState, setFilterState] = useState<Params>({
    page: 0,
    size: 20,
    type: "sms",
    filter: "name",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "*"
  })
  const [restaurants, setRestaurants] = useState<{
    data: User[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialRestaurants,
    recordsFiltered: 0,
    recordsTotal: 0
  })

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleSearchChange = (searchValue: string) => {
    setFilterState((prev) => ({ ...prev, search: searchValue }))
  }

  const handleDelete = () => {
    if (selectedRestaurant) {
      setRestaurants((prevState) => ({
        ...prevState,
        data: prevState.data.filter((org) => org !== selectedRestaurant)
      }))
      setIsDeleteDialogOpen(false)
    }
  }

  const handleFilterChange = (filters: FilterState) => {
    setFilterState((prev) => ({
      ...prev,
      filter: filters.filterBy || "name",
      status: filters.status || "*",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.searchValue
    }))
  }

  console.log("filterState", filterState)

  const handleAddOrEdit = (data: User) => {
    if (isEditing) {
      setRestaurants((prevState) => ({
        ...prevState,
        data: prevState.data.map((org) => (org === isEditing ? { ...isEditing, ...data } : org))
      }))
      setIsEditing(null)
    } else {
      setRestaurants((prevState) => ({
        ...prevState,
        data: [...prevState.data, data]
      }))
    }
    setIsAddOrEditDialogOpen(false)
  }

  const columns = [
    { accessorKey: "firstname", header: "Firstname" },
    { accessorKey: "lastname", header: "Lastname" },
    { accessorKey: "organization", header: "Organization" },
    { accessorKey: "restaurant", header: "Restaurant" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status
        const badgeStyle = status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"

        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${badgeStyle}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
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
                setSelectedRestaurant(org)
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
      <Level2 title="Users">
        <Button variant="default" size="sm" onClick={() => setIsAddOrEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </Level2>

      <DataTable
        totalItems={restaurants.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={restaurants.data}
        statusOptions={statusRestaurant}
        filterByOptions={filterOptionOrganization}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected user." : "Fill in the details to create a new user."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={() => setIsAddOrEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">User Details: {selectedRestaurant?.firstname + " " + selectedRestaurant?.lastname}</DialogTitle>
          </DialogHeader>

          {selectedRestaurant && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="w-full min-h-72 border-none shadow-md rounded-sm overflow-hidden">
                {selectedRestaurant.picture && <img src={selectedRestaurant.picture} alt="User" className="w-full h-full object-cover" />}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
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
                      <Calendar1 className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedRestaurant.createAt}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">Affiliation</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedRestaurant.organization}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Cctv className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Boss</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">Privilèges</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedRestaurant.organization}</p>
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
            <Button size="sm" variant="secondary" onClick={() => setIsViewDialogOpen(false)}>
              <Edit className="w-4 h-4" /> Edit
            </Button>
            <Button size="sm" variant="close" onClick={() => setIsViewDialogOpen(false)}>
              <X className="w-4 h-4" /> Close
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
          <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
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
const AddEditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: User | null; onSubmit: (data: User) => void; onCancel: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<User>({
    defaultValues: defaultValues || {
      firstname: "",
      lastname: "",
      organization: "",
      restaurant: "",
      role: "",
      phone: "",
      email: "",
      picture: "",
      status: "active"
    },
    resolver: zodResolver(userSchema)
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pictureUrl = watch("picture")

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
        <div>
          <Label htmlFor="organization">Organization</Label>
          <Select value={watch("organization")} onValueChange={(value) => setValue("organization", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.name}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.organization && <p className="text-red-600 text-sm">{errors.organization.message}</p>}
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="firstname">Firstname</Label>
          <Input id="firstname" {...register("firstname")} placeholder="Firstname" />
          {errors.firstname && <p className="text-red-600 text-sm">{errors.firstname.message}</p>}
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="lastname">Lastname</Label>
          <Input id="lastname" {...register("firstname")} placeholder="Lastname" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} placeholder="Phone" />
          {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
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
        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register("email")} placeholder="Email" />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
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

export default User
