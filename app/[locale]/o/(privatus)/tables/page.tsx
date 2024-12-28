"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DataTable, FilterState } from "@/components/features/DataTable"
import { Trash2, Edit, Eye, Plus, X, HardDriveDownload, SaveOff, Building, ConciergeBell, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Params } from "@/types/paramTypes"
import { statusRestaurant } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"
import Level2 from "@/components/features/Level2"
import Qrcode from "qrcode"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import toast from "react-hot-toast"

// Type and Validation Schema
type TableMode = "manual" | "auto"

type Table = {
  tableNumber: string
  prefix?: string
  numberOfTables?: number
  baseNumber?: number
  organization: string
  restaurant: string
  webPage: string
  status: "active" | "inactive"
  createAt: string
  option: TableMode
}

const manualTableSchema = z.object({
  tableNumber: z
    .string()
    .min(1, "Table number is required")
    .regex(/^T-\d{2}$/, "Table number must be in format T-XX"),
  organization: z.string().min(1, "Organization is required"),
  restaurant: z.string().min(1, "Restaurant is required"),
  status: z.enum(["active", "inactive"]),
  option: z.literal("manual"),
  webPage: z.string()
})

const autoTableSchema = z.object({
  prefix: z.string().min(1, "Prefix is required"),
  numberOfTables: z.number().min(1, "Number of tables is required"),
  baseNumber: z.number().min(0, "Base number must be non-negative"),
  organization: z.string().min(1, "Organization is required"),
  restaurant: z.string().min(1, "Restaurant is required"),
  status: z.enum(["active", "inactive"]),
  option: z.literal("auto"),
  webPage: z.string()
})

// Dummy Data
const initialTables: Table[] = [
  {
    tableNumber: "T-01",
    organization: "Organization 1",
    restaurant: "Restaurant A",
    webPage: "https://example.com/table/T-01",
    status: "active",
    createAt: "2024-01-15",
    option: "manual"
  },
  {
    tableNumber: "T-02",
    organization: "Organization 2",
    restaurant: "Restaurant B",
    webPage: "https://example.com/table/T-02",
    status: "active",
    createAt: "2024-01-15",
    option: "manual"
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

const Table = () => {
  const [isEditing, setIsEditing] = useState<Table | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTable, setSelectedRestaurant] = useState<Table | null>(null)
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
  const [tables, setTables] = useState<{
    data: Table[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialTables,
    recordsFiltered: 0,
    recordsTotal: 0
  })

  const [qrCode, setQrCode] = useState<string>("")

  const generateQRCode = (webpage: string) => {
    Qrcode.toDataURL(
      webpage,
      {
        width: 800,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      },
      (err, url) => {
        if (err) {
          toast.error("Impossible de générer le QR code !")
        } else {
          setQrCode(url)
        }
      }
    )
  }

  useEffect(() => {
    if (selectedTable?.webPage) {
      generateQRCode(selectedTable.webPage)
    }
  }, [selectedTable])

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleSearchChange = (searchValue: string) => {
    setFilterState((prev) => ({ ...prev, search: searchValue }))
  }

  const handleDelete = () => {
    if (selectedTable) {
      setTables((prevState) => ({
        ...prevState,
        data: prevState.data.filter((table) => table !== selectedTable)
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

  const handleAddOrEdit = (data: Table) => {
    if (isEditing) {
      setTables((prevState) => ({
        ...prevState,
        data: prevState.data.map((org) => (org === isEditing ? { ...isEditing, ...data } : org))
      }))
      setIsEditing(null)
    } else {
      setTables((prevState) => ({
        ...prevState,
        data: [...prevState.data, data]
      }))
    }
    setIsAddOrEditDialogOpen(false)
  }

  const columns = [
    { accessorKey: "tableNumber", header: "Table Number" },
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
      <Level2 title="Tables">
        <Button variant="default" size="sm" onClick={() => setIsAddOrEditDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Table
        </Button>
      </Level2>

      <DataTable
        totalItems={tables.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={tables.data}
        statusOptions={statusRestaurant}
        filterByOptions={filterOptionOrganization}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="shadow-md px-3 py-2">
            <DialogTitle className="font-bold">{isEditing ? "Edit Table" : "Add New Table"}</DialogTitle>
            <DialogDescription>{isEditing ? "Update the details of the selected table." : "Fill in the details to create a new table."}</DialogDescription>
          </DialogHeader>
          <AddEditForm defaultValues={isEditing} onSubmit={handleAddOrEdit} onCancel={() => setIsAddOrEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Table Details: {selectedTable?.tableNumber}</DialogTitle>
          </DialogHeader>

          {selectedTable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="w-full border-none shadow-md rounded-sm overflow-hidden flex items-center justify-center">
                {qrCode && <img src={qrCode} alt="QR Code" className="w-100 h-100" />}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Details</h2>
                  <div className="ml-2 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <p>Table: </p>
                      <p>{selectedTable.tableNumber}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-gray-600">Status: {selectedTable.status}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-gray-600">Create at: {selectedTable.createAt}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <HardDriveDownload/>
                      <a className="Btn" style={{ textDecoration: "none" }} href={qrCode} download={"Table: " + selectedTable?.tableNumber + ".png"}>
                        Télécharger
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Affiliation</h2>
                  <div className="ml-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <p className="text-gray-600">Organization: {selectedTable.organization}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      <p className="text-gray-600">Restaurant: {selectedTable.restaurant}</p>
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
          <DialogDescription>Are you sure you want to delete this table?</DialogDescription>
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
const AddEditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: Table | null; onSubmit: (data: Table) => void; onCancel: () => void }) => {
  const [mode, setMode] = useState<TableMode>(defaultValues?.option || "manual")
  const schema = mode === "manual" ? manualTableSchema : autoTableSchema

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Table>({
    defaultValues: defaultValues || {
      tableNumber: "",
      organization: "",
      restaurant: "",
      status: "active",
      option: "manual",
      webPage: ""
    },
    resolver: zodResolver(schema)
  })

  const handleModeChange = (value: TableMode) => {
    setMode(value)
    setValue("option", value)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 p-2">
        <RadioGroup defaultValue={mode} onValueChange={(value) => handleModeChange(value as TableMode)} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Manual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto">Auto</Label>
          </div>
        </RadioGroup>

        {mode === "manual" ? (
          <div className="w-36">
            <Label htmlFor="tableNumber">Table Number</Label>
            <Input {...register("tableNumber")} placeholder="T-XX" />
            {errors.tableNumber && <p className="text-red-600 text-xs">{errors.tableNumber.message}</p>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="prefix">Prefix</Label>
                <Input {...register("prefix")} placeholder="T- or S-" />
                {errors.prefix && <p className="text-red-600 text-xs">{errors.prefix.message}</p>}
              </div>
              <div>
                <Label htmlFor="numberOfTables">Number of Tables</Label>
                <Input type="number" {...register("numberOfTables", { valueAsNumber: true })} placeholder="10" />
                {errors.numberOfTables && <p className="text-red-600 text-xs">{errors.numberOfTables.message}</p>}
              </div>
              <div>
                <Label htmlFor="baseNumber">Base Number</Label>
                <Input type="number" {...register("baseNumber", { valueAsNumber: true })} placeholder="0" />
                {errors.baseNumber && <p className="text-red-600 text-xs">{errors.baseNumber.message}</p>}
              </div>
            </div>
          </>
        )}

        {/* Common fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="organization">Organization</Label>
            <Select {...register("organization")}>
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

          <div>
            <Label htmlFor="restaurant">Restaurant</Label>
            <Select {...register("restaurant")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((rest) => (
                  <SelectItem key={rest.id} value={rest.name}>
                    {rest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.restaurant && <p className="text-red-600 text-xs">{errors.restaurant.message}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select {...register("status")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-600 text-xs">{errors.status.message}</p>}
          </div>
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

export default Table
