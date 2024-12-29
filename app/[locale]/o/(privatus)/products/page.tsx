"use client"

import { useState, useRef, ChangeEvent } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DataTable, FilterState } from "@/components/features/DataTable"
import { Trash2, Edit, Eye, Plus, ImagePlus, PhoneIcon, Calendar1, X, HardDriveDownload, ImageUp, SaveOff, Building, ConciergeBell, DollarSign, Utensils, Layers3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Params } from "@/types/param"
import { statusRestaurant } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"
import Level2 from "@/components/features/Level2"

// Type and Validation Schema
type Product = {
  name: string
  category: string
  organization: string
  restaurant: string
  description: string
  price: string | number
  specialPrice: string | number
  picture: string
  status: "active" | "inactive"
  createAt: string
}

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(1, "Price is required"),
  specialPrice: z.number().optional(),
  organization: z.string().min(1, "Organization is required"),
  restaurant: z.string().min(1, "Restaurant is required"),
  description: z.string().min(30, "Description must be at least 30 characters").max(50, "Description must not exceed 50 characters"),
  picture: z.string(),
  status: z.enum(["active", "inactive"])
})

// Dummy Data
const initialRestaurants: Product[] = [
  {
    name: "Product 1",
    category: "Boissson",
    price: 5000,
    specialPrice: 3000,
    organization: "Organization 1",
    restaurant: "Restaurant 1",
    description: "Organisation dédiée à l'accueil chaleureux et une expérience unique.",
    picture: "/assets/img/avatar/product.jpg",
    status: "active",
    createAt: "2024-12-22"
  },
  {
    name: "Product 2",
    category: "Boissson",
    price: 4000,
    specialPrice: 3000,
    organization: "Organization 1",
    restaurant: "Restaurant 1",
    description: "Organisation dédiée à l'accueil chaleureux et une expérience unique.",
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

const categories = [
  { id: "resto1", name: "Boisson" },
  { id: "resto2", name: "Main Courses" },
  { id: "resto3", name: "Starters" },
  { id: "resto3", name: "Chef’s Specials" }
]

const Product = () => {
  const [isEditing, setIsEditing] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProduct, setSelectedRestaurant] = useState<Product | null>(null)
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
  const [products, setProducts] = useState<{
    data: Product[]
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
    if (selectedProduct) {
      setProducts((prevState) => ({
        ...prevState,
        data: prevState.data.filter((product) => product !== selectedProduct)
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

  const handleAddOrEdit = (data: Product) => {
    if (isEditing) {
      setProducts((prevState) => ({
        ...prevState,
        data: prevState.data.map((org) => (org === isEditing ? { ...isEditing, ...data } : org))
      }))
      setIsEditing(null)
    } else {
      setProducts((prevState) => ({
        ...prevState,
        data: [...prevState.data, data]
      }))
    }
    setIsAddOrEditDialogOpen(false)
  }

  const columns = [
    { accessorKey: "name", header: "Product" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "specialPrice", header: "Special price" },
    { accessorKey: "organization", header: "Organization" },
    { accessorKey: "restaurant", header: "Restaurant" },
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
      <Level2 title="Products">
        <Button variant="default" size="sm" onClick={() => setIsAddOrEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </Level2>

      <DataTable
        totalItems={products.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={products.data}
        statusOptions={statusRestaurant}
        filterByOptions={filterOptionOrganization}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected product." : "Fill in the details to create a new product."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={() => setIsAddOrEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Product Details: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="w-full min-h-72 border-none shadow-md rounded-sm overflow-hidden">
                {selectedProduct.picture && <img src={selectedProduct.picture} alt="Product" className="w-full h-full object-cover" />}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold">Description</h2>

                <p className="text-sm text-gray-500 ml-2">{selectedProduct.description}</p>

                {/* Additional Information */}
                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">More</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedProduct.price}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Layers3 className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedProduct.category}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedProduct.specialPrice}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Calendar1 className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedProduct.createAt}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">Affiliation</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedProduct.organization}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedProduct.restaurant}</p>
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
          <DialogDescription>Are you sure you want to delete this product?</DialogDescription>
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
const AddEditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: Product | null; onSubmit: (data: Product) => void; onCancel: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Product>({
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

export default Product
