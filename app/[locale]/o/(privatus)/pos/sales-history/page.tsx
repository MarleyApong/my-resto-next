"use client"

import { useState } from "react"
import { Eye, UserCircle2, Network, Clock, Package, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/features/DataTable"
import Level2 from "@/components/features/Level2"
import { Params } from "@/types/paramTypes"

// Type Definitions
type Customer = {
  id: string
  firstName: string
  lastName: string
}

type Restaurant = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

type Sale = {
  id: string
  orderNumber: string
  customerId: string
  restaurantId: string
  staffName: string
  date: string
  totalAmount: number
  invoiceStatus: "paid"
  paymentType: "cash" | "mobile_money" | "local_account"
  products: Product[]
}

// Dummy Data (would typically come from an API)
const initialCustomers: Customer[] = [
  { id: "cust1", firstName: "Jean", lastName: "Dupont" },
  { id: "cust2", firstName: "Marie", lastName: "Martin" }
]

const initialRestaurants: Restaurant[] = [
  { id: "rest1", name: "Le Petit Bistro" },
  { id: "rest2", name: "Saveur Royale" }
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

const initialSales: Sale[] = [
  {
    id: "sale1",
    orderNumber: "ORD-2024-001",
    customerId: "cust1",
    restaurantId: "rest1",
    staffName: "Pierre Dupont",
    date: "2024-03-22",
    totalAmount: 30.0,
    invoiceStatus: "paid",
    paymentType: "cash",
    products: initialProducts
  },
  {
    id: "sale2",
    orderNumber: "ORD-2024-002",
    customerId: "cust2",
    restaurantId: "rest2",
    staffName: "Sophie Leclerc",
    date: "2024-03-23",
    totalAmount: 45.5,
    invoiceStatus: "paid",
    paymentType: "mobile_money",
    products: initialProducts.slice(0, 1)
  }
]

const SalesHistory = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [filterState, setFilterState] = useState<Params>({
    page: 0,
    size: 20,
    type: "sale",
    filter: "date",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: "paid"
  })
  const [sales, setSales] = useState<{
    data: Sale[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialSales,
    recordsFiltered: initialSales.length,
    recordsTotal: initialSales.length
  })

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleFilterChange = (filters: any) => {
    setFilterState((prev) => ({
      ...prev,
      filter: filters.filterBy || "date",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.searchValue
    }))
  }

  const getPaymentTypeLabel = (paymentType: Sale["paymentType"]) => {
    switch (paymentType) {
      case "mobile_money":
        return "Mobile Money"
      case "cash":
        return "Espèces"
      case "local_account":
        return "Compte Local"
    }
  }

  const columns = [
    {
      accessorKey: "date",
      header: "Date de la vente"
    },
    {
      accessorKey: "orderNumber",
      header: "Numéro de commande"
    },
    {
      accessorKey: "customer",
      header: "Nom du client",
      cell: ({ row }: any) => {
        const customer = initialCustomers.find((c) => c.id === row.original.customerId)
        return customer ? `${customer.firstName} ${customer.lastName}` : "N/A"
      }
    },
    {
      accessorKey: "restaurant",
      header: "Nom du restaurant",
      cell: ({ row }: any) => {
        const restaurant = initialRestaurants.find((r) => r.id === row.original.restaurantId)
        return restaurant ? restaurant.name : "N/A"
      }
    },
    {
      accessorKey: "staffName",
      header: "Qui a servi"
    },
    {
      accessorKey: "totalAmount",
      header: "Montant total",
      cell: ({ row }: any) => `€${row.original.totalAmount.toFixed(2)}`
    },
    {
      accessorKey: "invoiceStatus",
      header: "Statut de la facture",
      cell: () => <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium bg-green-100 text-green-800">Payée</span>
    },
    {
      accessorKey: "paymentType",
      header: "Type de paiement",
      cell: ({ row }: any) => getPaymentTypeLabel(row.original.paymentType)
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const sale = row.original
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedSale(sale)
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
      <Level2 title="Historique des Ventes" />

      <DataTable
        totalItems={sales.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={sales.data}
      />

      {/* Sale Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Détails de la vente: {selectedSale?.orderNumber}</DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              {/* Left Side: Sale Details */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Informations Client</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    {(() => {
                      const customer = initialCustomers.find((c) => c.id === selectedSale.customerId)
                      return customer ? (
                        <div className="flex items-center gap-2">
                          <UserCircle2 className="w-4 h-4" />
                          <p className="text-gray-600 text-sm">
                            {customer.firstName} {customer.lastName}
                          </p>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Détails de la vente</h2>
                  <div className="flex flex-col gap-2 ml-2">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Restaurant: {initialRestaurants.find((r) => r.id === selectedSale.restaurantId)?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Date: {selectedSale.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Nombre de produits: {selectedSale.products.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      <p className="text-gray-600 text-sm">Montant total: €{selectedSale.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Products */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Produits</h2>
                <div className="grid grid-cols-1 gap-2">
                  {selectedSale.products.map((product) => (
                    <div key={product.id} className="flex items-center border rounded-md p-2 gap-4 hover:bg-gray-50">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-sm" />
                      <div className="flex-grow">
                        <p className="font-semibold">{product.name}</p>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600">Quantité: {product.quantity}</p>
                          <p className="text-sm font-bold">€{(product.price * product.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-3 border-t">
            <Button size="sm" variant="close" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SalesHistory
