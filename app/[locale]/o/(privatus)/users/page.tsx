"use client"

import { useState, useEffect } from "react"
import { DataTable, FilterState } from "@/components/features/DataTable"
import { Trash2, Edit, Eye, Plus, PhoneIcon, Calendar1, X, SaveOff, TowerControl, Cctv, SendToBack, Building, Mail, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ParamsType } from "@/types/param"
import { statusUser } from "@/data/statusFilter"
import { filterOptionUser } from "@/data/optionFilter"
import { UserType } from "@/types/user"
import { Level2 } from "@/components/features/Level2"
import { userService } from "@/services/userService"
import { toast } from "sonner"
import { useError } from "@/hooks/useError"
import { format } from "date-fns"
import { useAuth } from "@/hooks/useAuth"
import { Loader } from "@/components/features/SpecificalLoader"
import { AddEditForm } from "./AddEditForm"

const User = () => {
  const { showError } = useError()
  const { setIsLoading, isLoading } = useAuth()

  const [isEditing, setIsEditing] = useState<UserType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState<boolean>(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false)
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [filterState, setFilterState] = useState<ParamsType>({
    order: "desc",
    page: 0,
    size: 20,
    filter: "",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "*"
  })
  const [users, setUsers] = useState<{
    data: UserType[]
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
      filter: filters.filter,
      status: filters.status || "*",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.search
    }))
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await userService.getAll(filterState)
      setUsers({
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
    if (selectedUser) {
      setIsLoading(true)
      try {
        const res = await userService.updateStatus(selectedUser.id, newStatus)
        const updatedUser = await userService.getById(selectedUser.id)
        toast.success(res.data?.message)

        setSelectedUser(updatedUser.data.data)
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
      const res = await userService.updatePicture(id, picture)
      const updatedUser = await userService.getById(selectedUser!.id)

      toast.success(res.data?.message)
      setSelectedUser(updatedUser.data.data)
      loadData()
    } catch (err) {
      showError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (selectedUser?.id) {
      setIsLoading(true)
      try {
        const res = await userService.delete(selectedUser.id)
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

  const handleAddOrEdit = async (data: UserType) => {
    console.log("Submitting Form Data:", data)
    setIsLoading(true)
    try {
      if (isEditing?.id) {
        const res = await userService.update(isEditing.id, data)
        toast.success(res.data?.message)
      } else {
        const res = await userService.create(data)
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
    if (tempImage && selectedUser) {
      handleUpdatePicture(selectedUser.id, tempImage)
      setTempImage(null)
    }
  }

  const columns = [
    { accessorKey: "organization", header: "Organization", cell: ({ row }: any) => row.original?.organization?.name },
    { accessorKey: "firstname", header: "Firstname" },
    { accessorKey: "lastname", header: "Lastname" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "neighborhood", header: "Neighborhood" },
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
                setSelectedUser(org)
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
                setSelectedUser(org)
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
          New User
        </Button>
      </Level2>

      <DataTable
        totalItems={users.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        columns={columns}
        data={users.data}
        statusOptions={statusUser}
        filterByOptions={filterOptionUser}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className={`${!isEditing ? "max-w-4xl" : "max-w-xl"} p-0`}>
          <DialogHeader className="shadow-md p-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected user." : "Fill in the details to create a new user."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={handleCancel} isEditing={!!isEditing} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">User Details: {selectedUser?.firstname + " " + selectedUser?.lastname}</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="w-full min-h-72 border-none shadow-md rounded-sm overflow-hidden" onClick={handleImageClick}>
                {tempImage || selectedUser?.picture ? (
                  <img src={tempImage || selectedUser.picture} alt="User" className="w-full h-96 object-cover" />
                ) : (
                  <img src="/assets/img/avatar/user-placeholder.jpg" alt="Default User" className="w-full h-96 object-cover" />
                )}
                {/* <Button variant="secondary" className="mt-2 w-full" onClick={tempImage ? handleUploadPicture : handleImageClick}>
                  {tempImage ? "Upload" : selectedUser?.picture ? "Update Picture" : "Choose Picture"}
                </Button> */}
              </div>

              <div className="space-y-4">
                {/* Additional Information */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedUser.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedUser.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <TowerControl className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{`${selectedUser.city} - ${selectedUser.neighborhood}`}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar1 className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{format(selectedUser.createdAt, "yyyy-mm-dd hh:mm:ss")}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold">Affiliation</h2>

                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedUser.organization?.name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedUser.restaurant?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-1 justify-end p-1 border-t">
            <Button variant="sun" disabled={isLoading} onClick={tempImage ? handleUploadPicture : handleImageClick}>
              {tempImage ? "Upload" : selectedUser?.picture ? "Update Picture" : "Choose Picture"}
            </Button>

            <Button
              variant={selectedUser?.status === "ACTIVE" ? "destructive" : "default"}
              disabled={isLoading}
              onClick={() => {
                setIsStatusDialogOpen(true)
              }}
            >
              {selectedUser?.status === "ACTIVE" ? "Desactivate" : "Activate"}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              disabled={isLoading}
              onClick={() => {
                setIsEditing(selectedUser)
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
          <DialogDescription>{`Are you sure you want to delete the user "${selectedUser?.firstname + " " + selectedUser?.lastname}" ?`}</DialogDescription>
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

export default User
