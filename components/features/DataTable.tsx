import React, { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SlidersHorizontal } from "lucide-react"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface OptionType {
  value: string
  label: string
}

export interface FilterState {
  order: string
  filterBy: string | null
  status: string | null
  dateRange: DateRange | null
  searchValue: string
}

type DataTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  enableFiltering?: boolean
  enableSorting?: boolean
  enableSelection?: boolean
  enableColumns?: boolean
  enableExport?: boolean
  enableOrderBy?: boolean
  enableFilterBy?: boolean
  enableStatus?: boolean
  enableDateRange?: boolean
  className?: string
  height?: string
  rowIdKey?: keyof TData
  bottomActions?: React.ReactNode
  totalItems: number
  currentPage: number
  pageSize: number
  filterByOptions?: OptionType[]
  statusOptions?: OptionType[]
  onFilterChange: (filters: FilterState) => void
  onPageChange: (page: number) => void
  onSelectedRowsChange?: (selectedRowIds: (string | number)[]) => void
  onExport?: (type: "filtered" | "all") => void
}

export function DataTable<TData extends object>({
  data,
  columns,
  enableFiltering = true,
  enableSorting = true,
  enableSelection = false,
  enableColumns = false,
  enableExport = true,
  enableOrderBy = true,
  enableFilterBy = true,
  enableStatus = true,
  enableDateRange = true,
  className = "shadow-md",
  height = "calc(100vh - 16rem)",
  rowIdKey,
  bottomActions,
  totalItems,
  currentPage,
  pageSize,
  filterByOptions = [],
  statusOptions = [],
  onFilterChange,
  onPageChange,
  onSelectedRowsChange,
  onExport
}: DataTableProps<TData>) {
  // States
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [filterState, setFilterState] = useState<FilterState>({
    order: "asc",
    filterBy: null,
    status: null,
    dateRange: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() },
    searchValue: ""
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage,
        pageSize
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (selection) => {
      setRowSelection(selection)
      if (onSelectedRowsChange && rowIdKey) {
        const selectedIds = Object.keys(selection as Record<string, boolean>)
          .filter((key) => (selection as Record<string, boolean>)[key])
          .map((key) => data[Number(key)][rowIdKey])
        onSelectedRowsChange(selectedIds as (string | number)[])
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined
  })

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFilterState((prev) => ({ ...prev, searchValue: value }))
    if (!value) {
      handleFilterSubmit()
    }
  }
  const handleFilterSubmit = () => {
    onFilterChange(filterState)
  }

  const handleDateRangeSubmit = () => {
    setIsDatePickerOpen(false)
    handleFilterSubmit()
  }

  const PopoverControl = () => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            <SlidersHorizontal /> Filter option
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-80 bg-background p-2 rounded-sm">
          <div className="grid gap-2">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Option de filtre</h4>
              <p className="text-sm text-muted-foreground">Filtrez les données par tri, état, date ou recherche. </p>
            </div>

            <div className="grid gap-2">
              {enableOrderBy && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Order by</Label>
                  <Select value={filterState.order} onValueChange={(value) => setFilterState((prev) => ({ ...prev, order: value }))}>
                    <SelectTrigger className="w-[180px] flex-1">
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Croissant</SelectItem>
                      <SelectItem value="desc">Decroissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {enableFilterBy && filterByOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Filter by</Label>
                  <Select value={filterState.filterBy || undefined} onValueChange={(value) => setFilterState((prev) => ({ ...prev, filterBy: value }))}>
                    <SelectTrigger className="w-[180px] flex-1">
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterByOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {enableStatus && statusOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Status</Label>
                  <Select value={filterState.status || undefined} onValueChange={(value) => setFilterState((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-[180px] flex-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {enableDateRange && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] flex-1">
                        {filterState.dateRange?.from && filterState.dateRange.to
                          ? `${format(filterState.dateRange.from, "PP")} - ${format(filterState.dateRange.to, "PP")}`
                          : "Select date range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-2 bg-background" align="center">
                      <Calendar
                        mode="range"
                        selected={filterState.dateRange ?? undefined}
                        onSelect={(range) => setFilterState((prev) => ({ ...prev, dateRange: range ?? null }))}
                        className="rounded-sm border"
                      />
                      <Button onClick={handleDateRangeSubmit} className="mt-1">
                        Apply
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {enableFiltering && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Search</Label>
                  <Input placeholder="Search..." value={filterState.searchValue} onChange={handleSearchChange} className="w-[180px] flex-1" />
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={handleFilterSubmit}>
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const renderExportButton = () =>
    enableExport && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onExport?.("filtered")}>Export Filtered</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport?.("all")}>Export All</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize)
  const hasSelectedRows = Object.keys(rowSelection).length > 0
  const allRowsSelected = table.getRowModel().rows.length > 0 && table.getRowModel().rows.every((row) => row.getIsSelected())

  return (
    <div className={`w-full bg-background rounded-sm ${className}`}>
      {/* Top Actions */}
      <div className="flex flex-wrap items-center justify-between p-1 shadow-md gap-4">
        {enableFiltering && PopoverControl()}

        <div className="flex items-center gap-2">
          {renderExportButton()}
          {enableColumns && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm border m-1" style={{ height, overflowY: "auto" }}>
        <Table>
          <TableHeader className="shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {enableSelection && (
                  <TableHead className="w-8">
                    <Input type="checkbox" checked={allRowsSelected} onChange={table.getToggleAllRowsSelectedHandler()} />
                  </TableHead>
                )}
                {headerGroup.headers.map((header, index) => {
                  const isLastColumn = index === headerGroup.headers.length - 1

                  return (
                    <TableHead key={header.id} className={isLastColumn ? "text-right" : index === 0 ? "text-left" : "text-center"}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {enableSelection && (
                    <TableCell className="w-8">
                      <Input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell key={cell.id} className={`${index !== 0 ? "text-center" : "text-left"} text-nowrap h-4 px-2 py-1`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (enableSelection ? 1 : 0)} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Actions and Pagination */}
      <div className="flex items-center justify-between p-1">
        {enableSelection && bottomActions && hasSelectedRows && <div className="flex gap-2">{bottomActions}</div>}

        <Pagination className="ml-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={() => onPageChange(Math.max(1, currentPage - 1))} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (page === 1 || page === totalPages) return true
                return Math.abs(currentPage - page) <= 2
              })
              .map((page, i, array) => (
                <React.Fragment key={page}>
                  {i > 0 && array[i - 1] !== page - 1 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink href="#" onClick={() => onPageChange(page)} isActive={currentPage === page}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                </React.Fragment>
              ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
