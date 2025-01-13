"use client"

import { useState, useEffect } from "react"
import { DataTable, FilterState } from "@/components/features/DataTable"
import { Trash2, Edit, Eye, Plus, X, SaveOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ParamsType } from "@/types/param"
import { Level2 } from "@/components/features/Level2"
import { roleService } from "@/services/roleService"
import { toast } from "sonner"
import { useError } from "@/hooks/useError"
import { useAuth } from "@/hooks/useAuth"
import { Loader } from "@/components/features/SpecificalLoader"
import { AddEditForm } from "./AddEditForm"
import { hasPermission } from "@/lib/hasPermission"
import { SpecificPermissionAction } from "@/enums/specificPermissionAction"
import { CreateRoleType, RoleType, UpdateRoleType } from "@/types/role"

const Role = () => {
  const { showError } = useError()
  const { setIsLoading, isLoading, user } = useAuth()

  const [isEditing, setIsEditing] = useState<RoleType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState<boolean>(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
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
  const [roles, setRoles] = useState<{
    data: RoleType[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: [],
    recordsFiltered: 0,
    recordsTotal: 0
  })

  // Check permissions
  const canDelete = hasPermission(user, "roles", "delete")
  const canEdit = hasPermission(user, "roles", "update")
  const canCreate = hasPermission(user, "roles", "create")

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
      const res = await roleService.getAll(filterState)
      setRoles({
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
    if (selectedRole?.id) {
      setIsLoading(true)
      try {
        const res = await roleService.delete(selectedRole.id)
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

  const handleAddOrEdit = async (data: CreateRoleType | UpdateRoleType) => {
    setIsLoading(true)
    try {
      if (isEditing?.id) {
        const res = await roleService.update(isEditing.id, data as UpdateRoleType)
        toast.success(res.data?.message)
      } else {
        const res = await roleService.create(data as CreateRoleType)
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
    { accessorKey: "name", header: "Role Name" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "organization.name", header: "Organization" },
    { accessorKey: "restaurant.name", header: "Restaurant" },
    { accessorKey: "createdAt", header: "Created At" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const role = row.original as RoleType
        return (
          <div className="flex justify-end gap-1">
            {/* View Button */}
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedRole(role)
                setIsViewDialogOpen(true)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>

            {/* Edit Button */}
            <Button
              variant="sun"
              size="icon"
              onClick={() => {
                setIsEditing(role)
                setIsAddOrEditDialogOpen(true)
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                setSelectedRole(role)
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
        {canCreate && (
          <Button variant="default" size="sm" disabled={isLoading} onClick={() => setIsAddOrEditDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        )}
      </Level2>

      <DataTable
        totalItems={roles.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        columns={columns}
        data={roles.data}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className="max-w-xl p-0">
          <DialogHeader className="shadow-md p-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit Role" : "Add New Role"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected role." : "Fill in the details to create a new role."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={handleCancel} isEditing={!!isEditing} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader>
            <DialogTitle className="font-bold shadow-md px-3 py-3">Role Details: {selectedRole?.name}</DialogTitle>
            <DialogDescription className="ml-2">{selectedRole?.description}</DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="px-4 max-h-96 overflow-auto">
              <div className="space-y-2">
                {selectedRole.permissions.map((perm, index) => (
                  <div key={index} className="border rounded-sm">
                    <h3 className="font-semibold capitalize text-sm p-2 shadow-md bg-primary text-white">{perm.menuId}</h3>
                    <div className="grid grid-cols-1 gap-3 my-3 ml-2 font-semibold">
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-sm text-xs ${perm.delete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          <span className="font-medium">View:</span>{" "}
                          <span className={`px-2 py-1 rounded-full text-xs ${perm.view ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {perm.view ? "Yes" : "No"}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-sm text-xs ${perm.delete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          <span className="font-medium">Create:</span>{" "}
                          <span className={`px-2 py-1 rounded-full text-xs ${perm.create ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {perm.create ? "Yes" : "No"}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-sm text-xs ${perm.delete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          <span className="font-medium">Update:</span>{" "}
                          <span className={`px-2 py-1 rounded-full text-xs ${perm.update ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {perm.update ? "Yes" : "No"}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-sm text-xs ${perm.delete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          <span className="font-medium">Delete:</span> <span>{perm.delete ? "Yes" : "No"}</span>
                        </span>
                      </div>
                    </div>

                    {perm.permissionActions.length > 0 && (
                      <div className="mt-4">
                        <ul className="list-none list-inside ml-2 mt-2">
                          {perm.permissionActions.map((action, idx) => (
                            <li key={idx} className="text-xs text-gray-800 mb-3">
                              <span className="px-2 py-1 rounded-sm bg-purple-100 text-purple-800 lowercase font-semibold">{action.name}</span> : {action.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-1 justify-end p-1 border-t">
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
          <DialogDescription>{`Are you sure you want to delete the role "${selectedRole?.name}"?`}</DialogDescription>
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

export default Role
