"use client"

import { useState, useEffect } from "react"
import { DataTable, FilterState } from "@/components/features/DataTable"
import {
  Trash2,
  Edit,
  Plus,
  X,
  SaveOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ParamsType } from "@/types/param"
import { filterOptionProduct } from "@/data/optionFilter"
import { Level2 } from "@/components/features/Level2"
import { hasPermission } from "@/lib/hasPermission"
import { useError } from "@/hooks/useError"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { ProductCategoryType } from "@/types/productCategory"
import { Loader } from "@/components/features/SpecificalLoader"
import { AddEditForm } from "./AddEditForm"
import { productCategoryService } from "@/services/productCategoryService"

const ProductCategory = () => {
  const { showError } = useError()
  const { setIsLoading, isLoading, user } = useAuth()

  const [isEditing, setIsEditing] = useState<ProductCategoryType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState<boolean>(false)
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategoryType | null>(null)
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
  const [products, setProductCategories] = useState<{
    data: ProductCategoryType[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: [],
    recordsFiltered: 0,
    recordsTotal: 0
  })

  // Check permissions
  const canDelete = hasPermission(user, "product-categories", "delete")
  const canEdit = hasPermission(user, "product-categories", "update")
  const canCreate = hasPermission(user, "product-categories", "create")

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
      const res = await productCategoryService.getAll(filterState)
      setProductCategories({
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

  const handleDelete = async () => {
    if (selectedProductCategory?.id) {
      setIsLoading(true)
      try {
        const res = await productCategoryService.delete(selectedProductCategory.id)
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

  const handleAddOrEdit = async (data: ProductCategoryType) => {
    console.log("Submitting Form Data:", data)
    setIsLoading(true)
    try {
      if (isEditing?.id) {
        const res = await productCategoryService.update(isEditing.id, data)
        toast.success(res.data?.message)
      } else {
        const res = await productCategoryService.create(data)
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

  const columns = [
    { accessorKey: "name", header: "Category" },
    { accessorKey: "organization.name", header: "Organization" },
    { accessorKey: "restaurant.name", header: "Restaurant" },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: any) => {
        const product = row.original
        return (
          <div className="flex justify-end gap-1">
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
                  setSelectedProductCategory(product)
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
            New Cat. Product
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
        filterByOptions={filterOptionProduct}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit Product Category" : "Add New Product Category"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected product." : "Fill in the details to create a new product."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={() => setIsAddOrEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>Are you sure you want to delete this product category ?</DialogDescription>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>{`Are you sure you want to delete the product category "${selectedProductCategory?.name}" ?`}</DialogDescription>
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

export default ProductCategory
