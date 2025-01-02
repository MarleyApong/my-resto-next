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
import { Params } from "@/types/param"
import { statusRestaurant } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"
import {Level2} from "@/components/features/Level2"

// Type and Validation Schema
type Restaurant = {
  name: string
  organization: string
  description: string
  city: string
  neighborhood: string
  phone: string
  email: string
  picture: string
  status: "active" | "inactive"
  createAt: string
}

const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurant is required"),
  organization: z.string().min(1, "Organization is required"),
  description: z.string().min(70, "Description must be at least 70 characters").max(170, "Description must not exceed 170 characters"),
  city: z.string().min(1, "City is required"),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  phone: z.string().regex(/^\d+$/, "Phone must contain only numbers"),
  picture: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  email: z.string().email("Invalid email format").min(1, "Email is required")
})

// Dummy Data
const initialRestaurants: Restaurant[] = [
  {
    name: "Restaurant 1",
    organization: "Organization 1",
    description: "Organisation dédiée à l'excellence culinaire, réunissant des restaurants engagés à offrir des repas de qualité, un accueil chaleureux et une expérience unique.",
    city: "Paris",
    neighborhood: "Montmartre",
    phone: "123456789",
    email: "test@yahoo.fr",
    picture: "/assets/img/avatar/product.jpg",
    status: "active",
    createAt: "2024-12-22"
  },
  {
    name: "Restaurant 2",
    organization: "Organization 1",
    description: "Notre organisation regroupe des restaurants passionnés, offrant des plats savoureux, un service exceptionnel et des expériences culinaires mémorables pour tous.",
    city: "Lyon",
    neighborhood: "Bellecour",
    phone: "987654321",
    email: "resto@gmail.com",
    picture: "/assets/img/avatar/product.jpg",
    status: "inactive",
    createAt: "2024-12-22"
  }
]

const organizations = [
  { id: "org1", name: "Organization A" },
  { id: "org2", name: "Organization B" },
  { id: "org3", name: "Organization C" }
]

const Restaurant = () => {
  const [isEditing, setIsEditing] = useState<Restaurant | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedRestaurant, setSelectedOrganization] = useState<Restaurant | null>(null)
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
    data: Restaurant[]
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

  const handleAddOrEdit = (data: Restaurant) => {
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
    { accessorKey: "name", header: "Restaurant" },
    { accessorKey: "organization", header: "Organization" },
    { accessorKey: "city", header: "City" },
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
      <Level2 title="Restaurants">
        <Button variant="default" size="sm" onClick={() => setIsAddOrEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Restaurant
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
            <DialogTitle className="font-bold">{isEditing ? "Edit Restaurant" : "Add New Restaurant"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected restaurant." : "Fill in the details to create a new restaurant."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={() => setIsAddOrEditDialogOpen(false)} />
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
              <div className="w-full min-h-72 border-none shadow-md rounded-sm overflow-hidden">
                {selectedRestaurant.picture && <img src={selectedRestaurant.picture} alt="Restaurant" className="w-full h-full object-cover" />}
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
                      <p className="text-gray-600 text-sm">{selectedRestaurant.city}</p>
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
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-1 justify-end p-1 border-t">
            <Button size="sm" variant="secondary" disabled>
              <ConciergeBell className="w-4 h-4" /> Show order
            </Button>

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
          <DialogDescription>Are you sure you want to delete this restaurant?</DialogDescription>
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
const AddEditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: Restaurant | null; onSubmit: (data: Restaurant) => void; onCancel: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Restaurant>({
    defaultValues: defaultValues || {
      name: "",
      organization: "",
      description: "",
      city: "",
      neighborhood: "",
      phone: "",
      email: "",
      picture: "",
      status: "active"
    },
    resolver: zodResolver(restaurantSchema)
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
          {errors.organization && <p className="text-red-600 text-xs">{errors.organization.message}</p>}
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="Restaurant Name" />
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
          {errors.email && <p className="text-red-600 text-xs">{errors.email.message}</p>}
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" maxLength={170} {...register("description")} placeholder="Description" className="resize-none" rows={4} />
          <p className="text-xs text-gray-500">{remainingChars} characters remaining</p>
          {errors.description && <p className="text-red-600 text-xs">{errors.description.message}</p>}
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

export default Restaurant
