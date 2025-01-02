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
  Cctv,
  PencilRuler
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ParamsType } from "@/types/param"
import { statusOrganization } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"
import {Level2} from "@/components/features/Level2"
import { useRouter } from "next/navigation"

// Type and Validation Schema
type Surveys = {
  name: string
  restaurant: string
  score: string | number
  organization: string
  status: "active" | "inactive"
  createAt: string
}

const surveySchema = z.object({
  name: z.string().min(1, "Survey is required"),
  organization: z.string().min(1, "Organization is required"),
  restaurant: z.string().min(1, "Restaurant is required")
})

// Dummy Data
const initialRestaurants: Surveys[] = [
  {
    name: "Surveys 1",
    score: 4.5,
    organization: "Organization 1",
    restaurant: "Restaurant 1",
    status: "active",
    createAt: "2024-12-22"
  },
  {
    name: "Surveys 2",
    score: 3,
    organization: "Organization 1",
    restaurant: "Restaurant 1",
    status: "inactive",
    createAt: "2024-12-20"
  }
]

const organizations = [
  { id: "org1", name: "organization A" },
  { id: "org2", name: "organization B" },
  { id: "org3", name: "organization C" }
]

const restaurants = [
  { id: "resto1", name: "restaurant A" },
  { id: "resto2", name: "restaurant B" },
  { id: "resto3", name: "restaurant C" }
]

const Survey = () => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState<Surveys | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<Surveys | null>(null)
  const [filterState, setFilterState] = useState<ParamsType>({
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
    data: Surveys[]
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
    if (selectedSurvey) {
      setRestaurants((prevState) => ({
        ...prevState,
        data: prevState.data.filter((org) => org !== selectedSurvey)
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

  const handleAddOrEdit = (data: Surveys) => {
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
    { accessorKey: "name", header: "Surveys" },
    { accessorKey: "score", header: "Score" },
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
                setSelectedSurvey(org)
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

            <Button variant="printemps" size="icon" onClick={() => router.push("/o/surveys/design/1254")}>
              <PencilRuler className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                setSelectedSurvey(org)
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
        <Button variant="default" size="sm" onClick={() => setIsAddOrEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Surveys
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
        statusOptions={statusOrganization}
        filterByOptions={filterOptionOrganization}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className=" p-0">
          <DialogHeader className="shadow-md px-3 py-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit Surveys" : "Add New Surveys"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected restaurant." : "Fill in the details to create a new survey."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={() => setIsAddOrEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Surveys Details: {selectedSurvey?.name}</DialogTitle>
          </DialogHeader>
          {selectedSurvey && <div className=""></div>}

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
const AddEditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: Surveys | null; onSubmit: (data: Surveys) => void; onCancel: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Surveys>({
    defaultValues: defaultValues || {
      name: "",
      restaurant: "",
      organization: "",
      status: "active"
    },
    resolver: zodResolver(surveySchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
      <div className="p-2 grid gap-2 grid-cols-4">
        <div className="col-span-2">
          <Label htmlFor="name">Survey name</Label>
          <Input id="name" {...register("name")} placeholder="Survey Name" />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>
        <div className="col-span-2">
          <Label htmlFor="organization">Organization</Label>
          <Select value={watch("organization")} onValueChange={(value) => setValue("organization", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select organization" />
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
        <div className="col-span-2">
          <Label htmlFor="organization">Restaurant</Label>
          <Select value={watch("restaurant")} onValueChange={(value) => setValue("restaurant", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((resto) => (
                <SelectItem key={resto.id} value={resto.name}>
                  {resto.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.organization && <p className="text-red-600 text-xs">{errors.organization.message}</p>}
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

export default Survey
