"use client"

import { useState } from "react"
import { Eye, PhoneIcon, Mail, ShoppingCart, MessageSquare, X, Utensils, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/features/DataTable"
import Level2 from "@/components/features/Level2"
import { Params } from "@/types/param"
import { statusOrganization } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"

// Type Definitions
type Customer = {
  id?: string
  firstName: string
  lastName: string
  phone: string
  email: string
  profilePicture: string
  organizationId: string
  restaurantId: string
  status: "active" | "inactive"
  createdAt: string
}

type Organization = {
  id: string
  name: string
}

type Restaurant = {
  id: string
  name: string
  organizationId: string
}

type Order = {
  id: string
  customerId: string
  restaurantId: string
  date: string
  totalAmount: number
  status: string
}

type Review = {
  id: string
  customerId: string
  restaurantId: string
  rating: number
  comment: string
  date: string
}

// Dummy Data (would typically come from an API)
const initialOrganizations: Organization[] = [
  { id: "org1", name: "Culinary Excellence Group" },
  { id: "org2", name: "Gourmet Restaurants Network" }
]

const initialRestaurants: Restaurant[] = [
  { id: "rest1", name: "Le Petit Bistro", organizationId: "org1" },
  { id: "rest2", name: "Saveur Royale", organizationId: "org1" },
  { id: "rest3", name: "Urban Fusion", organizationId: "org2" }
]

const initialCustomers: Customer[] = [
  {
    id: "cust1",
    firstName: "Jean",
    lastName: "Dupont",
    phone: "+33612345678",
    email: "jean.dupont@example.com",
    profilePicture: "/assets/img/avatar/user-placeholder.jpg",
    organizationId: "org1",
    restaurantId: "rest1",
    status: "active",
    createdAt: "2024-01-15"
  }
]

const initialOrders: Order[] = [
  {
    id: "order1",
    customerId: "cust1",
    restaurantId: "rest1",
    date: "2024-02-15",
    totalAmount: 45.5,
    status: "completed"
  },
  {
    id: "order2",
    customerId: "cust1",
    restaurantId: "rest1",
    date: "2024-03-22",
    totalAmount: 62.75,
    status: "completed"
  }
]

const initialReviews: Review[] = [
  {
    id: "review1",
    customerId: "cust1",
    restaurantId: "rest1",
    rating: 4,
    comment: "Excellent service and delicious food!",
    date: "2024-02-16"
  }
]

const Customer = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false)
  const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [filterState, setFilterState] = useState<Params>({
    page: 0,
    size: 20,
    type: "customer",
    filter: "lastName",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "*"
  })
  const [customers, setCustomers] = useState<{
    data: Customer[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialCustomers,
    recordsFiltered: 0,
    recordsTotal: 0
  })

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleFilterChange = (filters: any) => {
    setFilterState((prev) => ({
      ...prev,
      filter: filters.filterBy || "lastName",
      status: filters.status || "*",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.searchValue
    }))
  }

  const columns = [
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
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
        const customer = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedCustomer(customer)
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
      <Level2 title="Customer Management" />

      <DataTable
        totalItems={customers.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={customers.data}
        statusOptions={statusOrganization}
        filterByOptions={filterOptionOrganization}
      />

      {/* Customer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">
              Customer Details: {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              <div className="grid grid-cols-2 gap-4">
                {/* Profile Picture */}
                <div className="col-span-2 w-full min-h-16 border-none shadow-md rounded-sm overflow-hidden">
                  {selectedCustomer.profilePicture && <img src={selectedCustomer.profilePicture} alt="Customer Profile" className="w-full h-full object-cover" />}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Personal Information</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    {/* <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedCustomer.identityNumber}</p>
                    </div> */}
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedCustomer.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">{selectedCustomer.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Affiliation</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Organization: {initialOrganizations.find((org) => org.id === selectedCustomer.organizationId)?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Restaurant: {initialRestaurants.find((rest) => rest.id === selectedCustomer.restaurantId)?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-1 justify-end p-1 border-t">
            <Button
              variant="default"
              onClick={() => {
                setIsOrdersDialogOpen(true)
              }}
            >
              <ShoppingCart className="mr-2 w-4 h-4" />
              View Orders
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setIsReviewsDialogOpen(true)
              }}
            >
              <MessageSquare className="mr-2 w-4 h-4" />
              View Reviews
            </Button>
            <Button size="sm" variant="close" onClick={() => setIsViewDialogOpen(false)}>
              <X className="w-4 h-4" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Orders Dialog */}
      <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Orders for {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </DialogTitle>
            <DialogDescription>List of all orders placed by the customer</DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Order ID</th>
                  <th className="p-2 text-left">Restaurant</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-right">Total Amount</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {initialOrders
                  .filter((order) => order.customerId === selectedCustomer?.id)
                  .map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{order.id}</td>
                      <td className="p-2">{initialRestaurants.find((r) => r.id === order.restaurantId)?.name}</td>
                      <td className="p-2">{order.date}</td>
                      <td className="p-2 text-right">€{order.totalAmount.toFixed(2)}</td>
                      <td className="p-2">
                        <span
                          className={`
                          px-2 py-1 rounded text-xs 
                          ${order.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        `}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Reviews Dialog */}
      <Dialog open={isReviewsDialogOpen} onOpenChange={setIsReviewsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Reviews by {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </DialogTitle>
            <DialogDescription>List of reviews submitted by the customer</DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Restaurant</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Rating</th>
                  <th className="p-2 text-left">Comment</th>
                </tr>
              </thead>
              <tbody>
                {initialReviews
                  .filter((review) => review.customerId === selectedCustomer?.id)
                  .map((review) => (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{initialRestaurants.find((r) => r.id === review.restaurantId)?.name}</td>
                      <td className="p-2">{review.date}</td>
                      <td className="p-2">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </td>
                      <td className="p-2">{review.comment}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Customer
