import React, { useEffect, useState } from "react"
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
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Calendar } from "../ui/calendar"
import { format } from "date-fns"
import { useAuthStore } from "@/stores/authStore"

interface OptionType {
  value: string
  label: string
}

export interface FilterState {
  order: string
  filterBy: string | null
  status: string | null
  type: string | null
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
  enableType?: boolean
  enableDateRange?: boolean
  enableActions?: boolean
  className?: string
  height?: string
  onSearchChange?: (searchValue: string) => void
  onSelectedRowsChange?: (selectedRowIds: (string | number)[]) => void
  rowIdKey?: string
  bottomActions?: React.ReactNode
  otherFeactures?: React.ReactNode
  totalItems: number
  currentPage: number
  pageSize: number
  filterByOptions?: OptionType[]
  statusOptions?: OptionType[]
  typeOptions?: OptionType[]
  onFilterChange: (filters: FilterState) => void
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  onExport?: (type: "filtered" | "all") => void
}

export const DataTable = <TData extends object>({
  data,
  columns,
  enableColumns = false,
  enableFiltering = true,
  enableSorting = true,
  enableSelection = false,
  enableExport = true,
  enableOrderBy = true,
  enableFilterBy = true,
  enableStatus = true,
  enableType = false,
  enableDateRange = true,
  className = "shadow-md",
  height = "calc(100vh - 13rem)",
  onSelectedRowsChange,
  rowIdKey,
  bottomActions,
  otherFeactures,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onSizeChange,
  filterByOptions = [],
  statusOptions = [],
  typeOptions = [],
  onFilterChange,
  onExport
}: DataTableProps<TData>) => {
  const { isLoading } = useAuthStore()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [filterState, setFilterState] = useState<FilterState>({
    order: "asc",
    filterBy: "message",
    status: "*",
    type: "",
    dateRange: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() },
    searchValue: ""
  })

  // Adjust for 0-based index in table but 1-based in UI
  const displayPage = currentPage + 1
  const totalPages = Math.ceil(totalItems / pageSize)

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
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    manualPagination: true, // Important: Enable manual pagination
    pageCount: totalPages,
    getRowId: (row: any, index) => {
      return rowIdKey ? String(row[rowIdKey]) : index.toString() // Conversion explicite en string
    }
  })

  useEffect(() => {
    if (onSelectedRowsChange && rowIdKey && table) {
      const selectedRows = table.getSelectedRowModel().rows
      const selectedIds = selectedRows
        .map((row: any) => row.original[rowIdKey]) // Utilise `rowIdKey` pour récupérer l'identifiant.
        .filter((id) => id !== undefined)
      onSelectedRowsChange(selectedIds as (string | number)[])
    }
  }, [rowSelection, rowIdKey, table])

  const handlePageChange = (newPage: number) => {
    // Convert 1-based page number to 0-based index
    onPageChange(newPage - 1)
  }

  const handleSizeChange = (size: number) => {
    onSizeChange(size)
  }

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
    handleFilterSubmit()
  }

  const PopoverControl = () => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" disabled={isLoading} variant="outline">
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
              {otherFeactures}
              {enableOrderBy && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Order by</Label>
                  <Select disabled={isLoading} value={filterState.order} onValueChange={(value) => setFilterState((prev) => ({ ...prev, order: value }))}>
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

              {enableStatus && statusOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Status</Label>
                  <Select disabled={isLoading} value={filterState.status || undefined} onValueChange={(value) => setFilterState((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-[180px] flex-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="*">All Status</SelectItem>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {enableType && typeOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Type</Label>
                  <Select disabled={isLoading} value={filterState.type || undefined} onValueChange={(value) => setFilterState((prev) => ({ ...prev, type: value }))}>
                    <SelectTrigger className="w-[180px] flex-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
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

              {enableFilterBy && filterByOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Filter by</Label>
                  <Select disabled={isLoading} value={filterState.filterBy || undefined} onValueChange={(value) => setFilterState((prev) => ({ ...prev, filterBy: value }))}>
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

              {enableFiltering && (
                <div className="flex items-center gap-2">
                  <Label className="w-24 text-sm">Search</Label>
                  <Input placeholder="Search..." value={filterState.searchValue} onChange={handleSearchChange} className="w-[180px] flex-1" />
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button size="sm" disabled={isLoading} onClick={handleFilterSubmit}>
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
          <Button size="sm" disabled={isLoading} variant="outline">
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onExport?.("filtered")}>Export Filtered</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport?.("all")}>Export All</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

  const hasSelectedRows = Object.keys(rowSelection).length > 0
  const allRowsSelected = table.getRowModel().rows.length > 0 && table.getRowModel().rows.every((row) => row.getIsSelected())

  const renderPageNumbers = () => {
    const range = [] as number[]
    const delta = 0 // Number of pages to show before and after current page

    for (let i = Math.max(1, displayPage - delta); i <= Math.min(totalPages, displayPage + delta); i++) {
      range.push(i)
    }

    return range
  }

  return (
    <div className={`w-full bg-background rounded-sm px-2 ${className}`}>
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
      <div className="rounded-sm border overflow-auto" style={{ height: height }}>
        <Table>
          <TableHeader className="relative">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="z-20 sticky bg-background w-full" key={headerGroup.id}>
                {enableSelection && (
                  <TableHead className="w-8 sticky">
                    <Input type="checkbox" checked={allRowsSelected} onChange={table.getToggleAllRowsSelectedHandler()} />
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-nowrap" key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-[var(--row-hover)]">
                  {enableSelection && (
                    <TableCell className="w-8">
                      <Input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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

      {/* Pagination section */}
      <div className="flex justify-between items-center mt-1 py-2">
        <div className="flex items-center">
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" disabled={isLoading} variant="outline">
                  Pagination
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="bg-background p-2 flex gap-2 flex-col lg:flex-row md:flex-row">
                <div className="flex items-center gap-2">
                  <Label>Limit</Label>
                  <Select disabled={isLoading} value={pageSize?.toString()} onValueChange={(value) => handleSizeChange(parseInt(value))}>
                    <SelectTrigger className="flex- w-auto">
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Pagination className="w-full flex items-center gap-3 overflow-x-auto">
                  <PaginationContent className="flex items-center justify-center gap-2 flex-wrap">
                    <PaginationItem>
                      <PaginationPrevious size="sm" href="#" onClick={() => handlePageChange(displayPage - 1)} isActive={displayPage === 1} />
                    </PaginationItem>

                    {displayPage > 2 && (
                      <>
                        <PaginationItem>
                          <PaginationLink size="sm" href="#" onClick={() => handlePageChange(1)}>
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {displayPage > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {renderPageNumbers().map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink size="sm" href="#" isActive={pageNum === displayPage} onClick={() => handlePageChange(pageNum)}>
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {displayPage < totalPages - 1 && (
                      <>
                        {displayPage < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink href="#" onClick={() => handlePageChange(totalPages)}>
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext size="sm" href="#" onClick={() => handlePageChange(displayPage + 1)} isActive={displayPage === totalPages} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </DropdownMenuContent>
            </DropdownMenu>
            {enableSelection && bottomActions && hasSelectedRows && bottomActions}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-sm text-end ml-auto">
            Total rows: <span className="bg-primary rounded-sm text-white px-2 py-[3px]">{totalItems ?? 0}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
