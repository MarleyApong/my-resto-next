"use client"

import { useState } from "react"
import { Eye, X, Network, Utensils, ShoppingCart, CreditCard, Smartphone, Clock, Package, UserCircle2, Phone, TicketX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/features/DataTable"
import Level2 from "@/components/features/Level2"
import { Params } from "@/types/param"
import { statusOrganization } from "@/data/statusFilter"
import { filterOptionOrganization } from "@/data/optionFilter"

// Type Definitions
type Customer = {
  id: string
  firstName: string
  lastName: string
  phone: string
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

type Product = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

type Order = {
  id: string
  customerId: string
  restaurantId: string
  organizationId: string
  date: string
  totalAmount: number
  numberOfProducts: number
  status: "pending" | "in_progress" | "cancelled_by_client" | "cancelled_by_restaurant"
  invoiceStatus: "paid" | "pending"
  paymentType: "pending" | "local_account" | "cash" | "mobile_money"
  products: Product[]
}

// Dummy Data (would typically come from an API)
const initialOrganizations: Organization[] = [
  { id: "org1", name: "Culinary Excellence Group" },
  { id: "org2", name: "Gourmet Restaurants Network" }
]

const initialRestaurants: Restaurant[] = [
  { id: "rest1", name: "Le Petit Bistro", organizationId: "org1" },
  { id: "rest2", name: "Saveur Royale", organizationId: "org1" }
]

const initialCustomers: Customer[] = [
  {
    id: "cust1",
    firstName: "Jean",
    lastName: "Dupont",
    phone: "+33612345678"
  }
]

const initialProducts: Product[] = [
  {
    id: "prod1",
    name: "Burger Classic",
    price: 12.5,
    quantity: 2,
    image: "/api/placeholder/100/100"
  },
  {
    id: "prod2",
    name: "Frites Royales",
    price: 5.0,
    quantity: 1,
    image: "/api/placeholder/100/100"
  }
]

const initialOrders: Order[] = [
  {
    id: "order1",
    customerId: "cust1",
    restaurantId: "rest1",
    organizationId: "org1",
    date: "2024-03-22",
    totalAmount: 30.0,
    numberOfProducts: 3,
    status: "pending",
    invoiceStatus: "pending",
    paymentType: "pending",
    products: initialProducts
  },
  {
    id: "order2",
    customerId: "cust1",
    restaurantId: "rest2",
    organizationId: "org1",
    date: "2024-03-23",
    totalAmount: 45.5,
    numberOfProducts: 2,
    status: "in_progress",
    invoiceStatus: "paid",
    paymentType: "mobile_money",
    products: initialProducts.slice(0, 1)
  }
]

const Order = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [isCancelOrderDialogOpen, setIsCancelOrderDialogOpen] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterState, setFilterState] = useState<Params>({
    page: 0,
    size: 20,
    type: "order",
    filter: "date",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "*"
  })
  const [orders, setOrders] = useState<{
    data: Order[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialOrders,
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

  const handleCancelOrder = async () => {}

  // Status Badge Colors
  const getStatusBadgeStyle = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "cancelled_by_client":
        return "bg-red-100 text-red-800"
      case "cancelled_by_restaurant":
        return "bg-red-100 text-red-800"
    }
  }

  const getPaymentTypeIcon = (paymentType: Order["paymentType"]) => {
    switch (paymentType) {
      case "mobile_money":
        return <Smartphone className="w-4 h-4" />
      case "cash":
        return <CreditCard className="w-4 h-4" />
      case "local_account":
        return <Network className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const columns = [
    {
      accessorKey: "date",
      header: "Date"
    },
    {
      accessorKey: "numberOfProducts",
      header: "Number of Products",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4" />
          {row.original.numberOfProducts}
        </div>
      )
    },
    {
      accessorKey: "id",
      header: "Order Number"
    },
    {
      accessorKey: "organization",
      header: "Organization",
      cell: ({ row }: any) => {
        const org = initialOrganizations.find((org) => org.id === row.original.organizationId)
        return org ? org.name : "N/A"
      }
    },
    {
      accessorKey: "restaurant",
      header: "Restaurant",
      cell: ({ row }: any) => {
        const restaurant = initialRestaurants.find((rest) => rest.id === row.original.restaurantId)
        return restaurant ? restaurant.name : "N/A"
      }
    },
    {
      accessorKey: "totalAmount",
      header: "Total Price",
      cell: ({ row }: any) => `€${row.original.totalAmount.toFixed(2)}`
    },
    {
      accessorKey: "status",
      header: "Order Status",
      cell: ({ row }: any) => {
        const status = row.original.status
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${getStatusBadgeStyle(status)}`}>
            {status
              .split("_")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </span>
        )
      }
    },
    {
      accessorKey: "invoiceStatus",
      header: "Invoice Status",
      cell: ({ row }: any) => {
        const invoiceStatus = row.original.invoiceStatus
        const badgeStyle = invoiceStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${badgeStyle}`}>
            {invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1)}
          </span>
        )
      }
    },
    {
      accessorKey: "paymentType",
      header: "Payment Type",
      cell: ({ row }: any) => {
        const paymentType = row.original.paymentType
        return (
          <div className="flex items-center gap-1">
            {getPaymentTypeIcon(paymentType)}
            {paymentType
              .split("_")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const order = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedOrder(order)
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
      <Level2 title="Order Management" />

      <DataTable
        totalItems={orders.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={orders.data}
        statusOptions={statusOrganization}
        filterByOptions={filterOptionOrganization}
      />

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Order Details: {selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              {/* Left Side: Order Details */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Customer Information</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    {(() => {
                      const customer = initialCustomers.find((c) => c.id === selectedOrder.customerId)
                      return customer ? (
                        <>
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="w-4 h-4" />
                            <p className="text-gray-600 text-sm">
                              {customer.firstName} {customer.lastName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <p className="text-gray-600 text-sm">{customer.phone}</p>
                          </div>
                        </>
                      ) : null
                    })()}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Restaurant: {initialRestaurants.find((r) => r.id === selectedOrder.restaurantId)?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Organization: {initialOrganizations.find((o) => o.id === selectedOrder.organizationId)?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Date: {selectedOrder.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Number of Products: {selectedOrder.numberOfProducts}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Total Amount: €{selectedOrder.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPaymentTypeIcon(selectedOrder.paymentType)}
                      <p className="text-gray-600 text-sm">
                        Payment Type:{" "}
                        {selectedOrder.paymentType
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Products */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Products</h2>
                <div className="grid grid-cols-1 gap-2">
                  {selectedOrder.products.map((product) => (
                    <div key={product.id} className="flex items-center border rounded-md p-2 gap-4 hover:bg-gray-50">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-sm" />
                      <div className="flex-grow">
                        <p className="font-semibold">{product.name}</p>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                          <p className="text-sm font-bold">€{(product.price * product.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-1 justify-end p-1 border-t">
            <Button size="sm" variant="sun" onClick={() => setIsCancelOrderDialogOpen(true)}>
              <TicketX className="w-4 h-4" /> Cancel order
            </Button>
            <Button size="sm" variant="close" onClick={() => setIsViewDialogOpen(false)}>
              <X className="w-4 h-4" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelOrderDialogOpen} onOpenChange={setIsCancelOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm cancel order</DialogTitle>
          </DialogHeader>
          <DialogDescription>Are you sure you want to cancel this order?</DialogDescription>
          <DialogFooter>
            <Button size="sm" variant="destructive" onClick={handleCancelOrder}>
              <TicketX className="w-4 h-4" />
              Cancel order
            </Button>
            <Button size="sm" variant="close" onClick={() => setIsCancelOrderDialogOpen(false)}>
              <X className="w-4 h-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Order
