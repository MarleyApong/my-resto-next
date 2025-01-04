"use client"

import { useState, useEffect } from "react"
import { DataTable, FilterState } from "@/components/features/DataTable"
import { Trash2, Edit, Eye, Plus, PhoneIcon, Calendar1, X, SaveOff, TowerControl, Cctv, Utensils, SendToBack } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ParamsType } from "@/types/param"
import { statusOrganization } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"
import { OrganizationType } from "@/types/organization"
import { Level2 } from "@/components/features/Level2"
import { organizationService } from "@/services/organizationService"
import { toast } from "sonner"
import { useError } from "@/hooks/useError"
import { format } from "date-fns"
import { useAuth } from "@/hooks/useAuth"
import { Loader } from "@/components/features/SpecificalLoader"
import { AddEditForm } from "./AddEditForm"

const Organization = () => {
  const { showError } = useError()
  const { setIsLoading, isLoading } = useAuth()

  const [isEditing, setIsEditing] = useState<OrganizationType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState<boolean>(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false)
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationType | null>(null)
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
  const [organizations, setOrganizations] = useState<{
    data: OrganizationType[]
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
      const res = await organizationService.getAll(filterState)
      setOrganizations({
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
    if (selectedOrganization) {
      setIsLoading(true)
      try {
        const res = await organizationService.updateStatus(selectedOrganization.id, newStatus)
        const updatedOrg = await organizationService.getById(selectedOrganization.id)
        toast.success(res.data?.message)

        setSelectedOrganization(updatedOrg.data.data)
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
      const res = await organizationService.updatePicture(id, picture)
      const updatedOrg = await organizationService.getById(selectedOrganization!.id)

      toast.success(res.data?.message)
      setSelectedOrganization(updatedOrg.data.data)
      loadData()
    } catch (err) {
      showError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (selectedOrganization?.id) {
      setIsLoading(true)
      try {
        const res = await organizationService.delete(selectedOrganization.id)
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

  const handleAddOrEdit = async (data: OrganizationType) => {
    setIsLoading(true)
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
    if (tempImage && selectedOrganization) {
      handleUpdatePicture(selectedOrganization.id, tempImage)
      setTempImage(null)
    }
  }

  const columns = [
    { accessorKey: "name", header: "Restaurant" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "phone", header: "Phone" },
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
                setSelectedOrganization(org)
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
      <Level2>
        <Button variant="default" size="sm" disabled={isLoading} onClick={() => setIsAddOrEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Org.
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
        <DialogContent className={`${!isEditing ? "max-w-4xl" : "max-w-xl"} p-0`}>
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
              <div className="w-full min-h-72 border-none shadow-md rounded-sm overflow-hidden" onClick={handleImageClick}>
                {(tempImage || selectedOrganization.picture) && <img src={tempImage || selectedOrganization.picture} alt="Organization" className="w-full h-full object-cover" />}
                <Button variant="secondary" className="mt-2 w-full" onClick={tempImage ? handleUploadPicture : handleImageClick}>
                  {tempImage ? "Upload" : selectedOrganization.picture ? "Update Picture" : "Choose Picture"}
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
            <Button variant="sun" disabled={isLoading} onClick={tempImage ? handleUploadPicture : handleImageClick}>
              {tempImage ? "Upload" : selectedOrganization?.picture ? "Update Picture" : "Choose Picture"}
            </Button>

            <Button
              variant={selectedOrganization?.status === "ACTIVE" ? "destructive" : "default"}
              disabled={isLoading}
              onClick={() => {
                setIsStatusDialogOpen(true)
              }}
            >
              {selectedOrganization?.status === "ACTIVE" ? "Desactivate" : "Activate"}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              disabled={isLoading}
              onClick={() => {
                setIsEditing(selectedOrganization)
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
          <DialogDescription>{`Are you sure you want to delete the organization "${selectedOrganization?.name}" ?`}</DialogDescription>
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

export default Organization
