"use client"

import { useState } from "react"
import { Eye, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone, Landmark, Network, X, ShoppingCart, DollarSign, CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/features/DataTable"
import {Level2} from "@/components/features/Level2"
import { Params } from "@/types/param"
import { statusOrganization } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"

// Type Definitions
type Account = {
  id: string
  accountNumber: string
}

type AccountOperation = {
  id: string
  accountId: string
  type: "deposit" | "withdrawal"
  amount: number
  date: string
  source?: string
  sourceType?: "mobile_money" | "bank_transfer" | "cash" | "online_payment"
  operatorName?: string
  phoneNumber?: string
  status: "completed" | "pending"
  purpose?: string // New field to describe the reason for withdrawal
}

// Dummy Data (would typically come from an API)
const initialAccounts: Account[] = [
  { id: "acc1", accountNumber: "FR7612345678901234567890123" },
  { id: "acc2", accountNumber: "FR7698765432109876543210987" }
]

const initialAccountOperations: AccountOperation[] = [
  {
    id: "op1",
    accountId: "acc1",
    type: "deposit",
    amount: 1000.0,
    date: "2024-03-15",
    source: "Mobile Money",
    sourceType: "mobile_money",
    operatorName: "Orange Money",
    phoneNumber: "+22501234567",
    status: "completed"
  },
  {
    id: "op2",
    accountId: "acc1",
    type: "withdrawal",
    amount: 250.75,
    date: "2024-03-20",
    sourceType: "cash",
    status: "completed",
    purpose: "Restaurant meal at Le Petit Bistro" // Added purpose
  },
  {
    id: "op3",
    accountId: "acc2",
    type: "deposit",
    amount: 500.0,
    date: "2024-03-22",
    sourceType: "bank_transfer",
    status: "completed"
  }
]

const AccountOperations = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<AccountOperation | null>(null)
  const [filterState, setFilterState] = useState<Params>({
    page: 0,
    size: 20,
    type: "account_operation",
    filter: "date",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "*"
  })
  const [accountOperations, setAccountOperations] = useState<{
    data: AccountOperation[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialAccountOperations,
    recordsFiltered: 0,
    recordsTotal: 0
  })

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleFilterChange = (filters: any) => {
    setFilterState((prev) => ({
      ...prev,
      filter: filters.filterBy || "date",
      status: filters.status || "*",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.searchValue
    }))
  }

  const getSourceIcon = (sourceType: AccountOperation["sourceType"]) => {
    switch (sourceType) {
      case "mobile_money":
        return <Smartphone className="w-4 h-4" />
      case "bank_transfer":
        return <Landmark className="w-4 h-4" />
      case "cash":
        return <CreditCard className="w-4 h-4" />
      case "online_payment":
        return <Network className="w-4 h-4" />
      default:
        return null
    }
  }

  const columns = [
    {
      accessorKey: "accountNumber",
      header: "Account",
      cell: ({ row }: any) => {
        const account = initialAccounts.find((a) => a.id === row.original.accountId)
        return account ? account.accountNumber : "N/A"
      }
    },
    {
      accessorKey: "type",
      header: "Operation Type",
      cell: ({ row }: any) => {
        const type = row.original.type
        return (
          <div className="flex items-center gap-2">
            {type === "deposit" ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownLeft className="w-4 h-4 text-red-600" />}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        )
      }
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => {
        return `€${row.original.amount.toFixed(2)}`
      }
    },
    {
      accessorKey: "date",
      header: "Date"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status
        const badgeStyle = status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"

        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${badgeStyle}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      }
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }: any) => {
        return row.original.purpose ? (
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            {row.original.purpose}
          </div>
        ) : (
          "N/A"
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const operation = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedOperation(operation)
                setIsViewDialogOpen(true)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <div>
      <Level2 title="Account Operations" />

      <DataTable
        totalItems={accountOperations.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={accountOperations.data}
        statusOptions={statusOrganization}
        filterByOptions={filterOptionOrganization}
      />

      {/* Operation Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Operation Details: {selectedOperation?.id}</DialogTitle>
          </DialogHeader>

          {selectedOperation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Operation Information</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      {selectedOperation.type === "deposit" ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownLeft className="w-4 h-4 text-red-600" />}
                      <p className="text-gray-600 text-sm">Type: {selectedOperation.type.charAt(0).toUpperCase() + selectedOperation.type.slice(1)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Amount: €{selectedOperation.amount.toFixed(2)}</p>
                    </div>
                    {selectedOperation.purpose && (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        <p className="text-gray-600 text-sm">Purpose: {selectedOperation.purpose}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Date: {selectedOperation.date}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Source Details</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(selectedOperation.sourceType)}
                      <p className="text-gray-600 text-sm">
                        Source Type:{" "}
                        {selectedOperation.sourceType
                          ? selectedOperation.sourceType
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")
                          : "N/A"}
                      </p>
                    </div>
                    {selectedOperation.operatorName && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <p className="text-gray-600 text-sm">Operator: {selectedOperation.operatorName}</p>
                      </div>
                    )}
                    {selectedOperation.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <p className="text-gray-600 text-sm">Phone Number: {selectedOperation.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">Account Details</h2>
                <div className="flex flex-col gap-2 ml-2">
                  {(() => {
                    const account = initialAccounts.find((a) => a.id === selectedOperation.accountId)
                    return account ? (
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4" />
                        <p className="text-gray-600 text-sm">Account Number: {account.accountNumber}</p>
                      </div>
                    ) : null
                  })()}
                </div>
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
    </div>
  )
}

export default AccountOperations
