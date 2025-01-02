"use client"

import { useState } from "react"
import { Eye, Wallet, RefreshCw, ArrowUpRight, ArrowDownLeft, Network, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/features/DataTable"
import {Level2} from "@/components/features/Level2"
import { Params } from "@/types/param"
import { statusOrganization } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"

// Type Definitions
type Customer = {
  id: string
  firstName: string
  lastName: string
}

type Account = {
  id: string
  customerId: string
  accountNumber: string
  balance: number
  status: "active" | "inactive"
  createdAt: string
  lastDepositAmount?: number
  lastWithdrawalAmount?: number
}

// Dummy Data (would typically come from an API)
const initialCustomers: Customer[] = [
  { id: "cust1", firstName: "Jean", lastName: "Dupont" },
  { id: "cust2", firstName: "Marie", lastName: "Dubois" }
]

const initialAccounts: Account[] = [
  {
    id: "acc1",
    customerId: "cust1",
    accountNumber: "FR7612345678901234567890123",
    balance: 5234.56,
    status: "active",
    createdAt: "2024-01-15",
    lastDepositAmount: 1000.0,
    lastWithdrawalAmount: 250.75
  },
  {
    id: "acc2",
    customerId: "cust2",
    accountNumber: "FR7698765432109876543210987",
    balance: 3456.78,
    status: "active",
    createdAt: "2024-02-01",
    lastDepositAmount: 500.0,
    lastWithdrawalAmount: 100.5
  }
]

const Account = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [filterState, setFilterState] = useState<Params>({
    page: 0,
    size: 20,
    type: "account",
    filter: "accountNumber",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "*"
  })
  const [accounts, setAccounts] = useState<{
    data: Account[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialAccounts,
    recordsFiltered: 0,
    recordsTotal: 0
  })

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleFilterChange = (filters: any) => {
    setFilterState((prev) => ({
      ...prev,
      filter: filters.filterBy || "accountNumber",
      status: filters.status || "*",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.searchValue
    }))
  }

  const columns = [
    {
      accessorKey: "accountNumber",
      header: "Account Number"
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }: any) => {
        return `€${row.original.balance.toFixed(2)}`
      }
    },
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
        const account = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedAccount(account)
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
      <Level2 title="Account Management" />

      <DataTable
        totalItems={accounts.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={accounts.data}
        statusOptions={statusOrganization}
        filterByOptions={filterOptionOrganization}
      />

      {/* Account Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Account Details: {selectedAccount?.accountNumber}</DialogTitle>
          </DialogHeader>

          {selectedAccount && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Account Information</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Account Number: {selectedAccount.accountNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Current Balance: €{selectedAccount.balance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Financial Activity</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                      <p className="text-gray-600 text-sm">Last Deposit: €{selectedAccount.lastDepositAmount?.toFixed(2) || "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-4 h-4 text-red-600" />
                      <p className="text-gray-600 text-sm">Last Withdrawal: €{selectedAccount.lastWithdrawalAmount?.toFixed(2) || "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Account Created: {selectedAccount.createdAt}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">Customer Details</h2>
                <div className="flex flex-col gap-2 ml-2">
                  {(() => {
                    const customer = initialCustomers.find((c) => c.id === selectedAccount.customerId)
                    return customer ? (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-600 text-sm">
                            Name: {customer.firstName} {customer.lastName}
                          </p>
                        </div>
                      </>
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

export default Account
