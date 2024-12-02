"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Level2 from "@/components/features/Level2"
import { DataTable, FilterState } from "@/components/features/DataTable"
import { Plus, Edit, Trash2, X, HardDriveDownload, SaveOff, Eye } from "lucide-react"

// Expanded Types and Validation
type Permission = {
  resource: string
  actions: string[]
}

type Role = {
  id: string
  name: string
  description: string
  createdAt: string
  permissions: Permission[]
}

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional()
})

// Initial Data with Permissions
const initialRoles: Role[] = [
  {
    id: "role1",
    name: "Admin",
    description: "Full access to all features.",
    createdAt: "2024-10-25",
    permissions: [
      {
        resource: "restaurant",
        actions: ["create", "update", "delete", "view"]
      },
      {
        resource: "orders",
        actions: ["create", "update", "delete", "view"]
      }
    ]
  },
  {
    id: "role2",
    name: "Editor",
    description: "Can edit content but not manage users.",
    createdAt: "2024-10-25",
    permissions: [
      {
        resource: "restaurant",
        actions: ["update", "view"]
      },
      {
        resource: "orders",
        actions: ["view"]
      }
    ]
  },
  {
    id: "role3",
    name: "Viewer",
    description: "Can view content but cannot edit.",
    createdAt: "2024-10-25",
    permissions: [
      {
        resource: "restaurant",
        actions: ["view"]
      },
      {
        resource: "orders",
        actions: ["view"]
      }
    ]
  }
]

const Role = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [isEditing, setIsEditing] = useState<Role | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const handleAddOrEditRole = (data: Role) => {
    if (isEditing) {
      // Update the role
      setRoles((prev) =>
        prev.map((role) =>
          role.id === isEditing.id
            ? {
                ...role,
                ...data,
                createdAt: role.createdAt
              }
            : role
        )
      )
      setIsEditing(null)
    } else {
      // Add new role
      setRoles((prev) => [
        ...prev,
        {
          ...data,
          id: `role${roles.length + 1}`,
          createdAt: new Date().toISOString().split("T")[0]
        }
      ])
    }
    setIsDialogOpen(false)
  }

  const handleDeleteRole = (roleToDelete: Role) => {
    setRoles((prev) => prev.filter((role) => role.id !== roleToDelete.id))
    setSelectedRole(null)
    setIsDeleteDialogOpen(false)
  }

  // Truncate permissions text if it's too long
  const truncatePermissions = (permissions: Permission[]) => {
    const permissionsText = permissions.map((perm) => `${perm.resource}: ${perm.actions.join(", ")}`).join("; ")

    return permissionsText.length > 100 ? `${permissionsText.slice(0, 100)}...` : permissionsText
  }

  const columns = [
    { accessorKey: "name", header: "Role Name" },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }: any) => {
        const role = row.original as Role
        return <div className="max-w-[300px] truncate">{truncatePermissions(role.permissions)}</div>
      }
    },
    { accessorKey: "createdAt", header: "Created At" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const role = row.original as Role
        return (
          <div className="flex gap-1 justify-end">
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedRole(role)
                setIsDetailsDialogOpen(true)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="sun"
              size="icon"
              onClick={() => {
                setIsEditing(role)
                setIsDialogOpen(true)
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
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
      <Level2 title="Roles & Permissions">
        <Button variant="default" size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </Level2>

      <DataTable data={roles} columns={columns} totalItems={roles.length} currentPage={0} pageSize={20} onPageChange={() => {}} onFilterChange={() => {}} />

      {/* Add/Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-0">
          <DialogHeader className="shadow-md px-3 py-2">
            <DialogTitle>{isEditing ? "Edit Role" : "Add New Role"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected role." : "Fill in the details to create a new role."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEditRole} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Role Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl p-0 block">
          <DialogHeader className="p-2 shadow-md">
            <DialogTitle>Role Details: {selectedRole?.name}</DialogTitle>
            <DialogDescription>{selectedRole?.description}</DialogDescription>
          </DialogHeader>
          <div className="p-2">
            <h2 className="font-semibold">Permissions</h2>
            <div className="grid gap-2 ml-2 mt-1">
              {selectedRole?.permissions.map((perm, index) => (
                <div key={index} className="border p-1 rounded grid grid-cols-4 gap-2 text-sm">
                  <strong className="capitalize col-span-1">{perm.resource}:</strong>
                  <ul className="list-none ml-2 flex gap-1 col-span-3">[
                    {perm.actions.map((action, index) => (
                      <li key={index} className="capitalize text-gray-500">
                        {action}{perm.actions.length - 1 !== index && "|" }
                      </li>
                    ))}]
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex gap-1 col-span-3 justify-end p-1 border-t">
            <Button variant="close" size="sm" onClick={() => setIsDetailsDialogOpen(false)}>
              <X className="h-4 w-4" />
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
          <DialogDescription>Are you sure you want to delete the role "{selectedRole?.name}"?</DialogDescription>
          <DialogFooter>
            <Button size="sm" variant="destructive" onClick={() => selectedRole && handleDeleteRole(selectedRole)}>
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

// Add/Edit Form Component
const AddEditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: Role | null; onSubmit: (data: Role) => void; onCancel: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Role>({
    defaultValues: defaultValues || {
      name: "",
      description: ""
    },
    resolver: zodResolver(roleSchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
      <div className="p-2 pt-0">
        <div className="mb-2">
          <Label htmlFor="name">Role Name</Label>
          <Input id="name" {...register("name")} placeholder="Enter role name" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="mb-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register("description")} placeholder="Enter role description" />
        </div>
      </div>
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

export default Role
