"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
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
  Building,
  ConciergeBell,
  DollarSign,
  Utensils,
  Layers3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ParamsType } from "@/types/param"
import { statusRestaurant } from "@/data/statusFilter"
import { filterOptionOrganization, filterOptionProduct } from "@/data/optionFilter"
import { Level2 } from "@/components/features/Level2"
import { hasPermission } from "@/lib/hasPermission"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"
import { useError } from "@/hooks/useError"
import { useAuth } from "@/hooks/useAuth"
import { productService } from "@/services/productService"
import { toast } from "sonner"
import { ProductType } from "@/types/product"
import { Loader } from "@/components/features/SpecificalLoader"
import { AddEditForm } from "./AddEditForm"

// Type and Validation Schema
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
const initialRestaurants: ProductType[] = [
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
  const { showError } = useError()
  const { setIsLoading, isLoading, user } = useAuth()

  const [isEditing, setIsEditing] = useState<ProductType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState<boolean>(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false)
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
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
  const [products, setProducts] = useState<{
    data: ProductType[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialRestaurants,
    recordsFiltered: 0,
    recordsTotal: 0
  })
  const [tempImage, setTempImage] = useState<string | null>(null)

  // Check permissions
  const canUpdateStatus = hasPermission(user, "product", SpecificPermissionAction.UPDATE_STATUS)
  const canUpdatePicture = hasPermission(user, "product", SpecificPermissionAction.UPDATE_PICTURE)
  const canDelete = hasPermission(user, "product", "delete")
  const canEdit = hasPermission(user, "product", "update")
  const canCreate = hasPermission(user, "product", "create")

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
      const res = await productService.getAll(filterState)
      setProducts({
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
    if (selectedProduct) {
      setIsLoading(true)
      try {
        const res = await productService.updateStatus(selectedProduct.id, newStatus)
        const updatedResto = await productService.getById(selectedProduct.id)
        toast.success(res.data?.message)

        setSelectedProduct(updatedResto.data.data)
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
      const res = await productService.updatePicture(id, picture)
      const updatedProduct = await productService.getById(selectedProduct!.id)

      toast.success(res.data?.message)
      setSelectedProduct(updatedProduct.data.data)
      loadData()
    } catch (err) {
      showError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (selectedProduct?.id) {
      setIsLoading(true)
      try {
        const res = await productService.delete(selectedProduct.id)
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

  const handleAddOrEdit = async (data: ProductType) => {
    console.log("Submitting Form Data:", data)
    setIsLoading(true)
    try {
      if (isEditing?.id) {
        const res = await productService.update(isEditing.id, data)
        toast.success(res.data?.message)
      } else {
        const res = await productService.create(data)
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
    if (!canUpdatePicture) return

    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.onchange = handleImageChange
    fileInput.click()
  }

  const handleUploadPicture = () => {
    if (tempImage && selectedProduct) {
      handleUpdatePicture(selectedProduct.id, tempImage)
      setTempImage(null)
    }
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
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: any) => {
        const product = row.original
        return (
          <div className="flex justify-end gap-1">
            {/* View Button */}
            <Button
              variant="default"
              size="icon"
              disabled={isLoading}
              onClick={() => {
                setNewStatus(product?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")
                setSelectedProduct(product)
                setIsViewDialogOpen(true)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>

            {/* Edit Button */}
            {canEdit && (
              <Button
                variant="sun"
                size="icon"
                disabled={isLoading}
                onClick={() => {
                  setIsEditing(product)
                  setIsAddOrEditDialogOpen(true)
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}

            {/* Delete Button */}
            {canDelete && (
              <Button
                variant="destructive"
                size="icon"
                disabled={isLoading}
                onClick={() => {
                  setSelectedProduct(product)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div>
      <Level2>
        {canCreate && (
          <Button variant="default" size="sm" disabled={isLoading} onClick={() => setIsAddOrEditDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        )}
      </Level2>

      <DataTable
        totalItems={products.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        columns={columns}
        data={products.data}
        statusOptions={statusRestaurant}
        filterByOptions={filterOptionProduct}
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

      {/* Confirm status */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
          </DialogHeader>
          <DialogDescription>{`Are you sure you want to change the status to "${newStatus}"?`}</DialogDescription>
          <DialogFooter>
            {canUpdateStatus && (
              <Button size="sm" variant="sun" disabled={isLoading} onClick={handleStatusChange}>
                {isLoading ? <Loader /> : <SendToBack className="w-4 h-4" />}
                Confirm
              </Button>
            )}
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
          <DialogDescription>{`Are you sure you want to delete the product "${selectedProduct?.name}" ?`}</DialogDescription>
          <DialogFooter>
            {canDelete && (
              <Button size="sm" variant="destructive" disabled={isLoading} onClick={handleDelete}>
                {isLoading ? <Loader /> : <SaveOff className="w-4 h-4" />}
                Delete
              </Button>
            )}
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

export default Product
