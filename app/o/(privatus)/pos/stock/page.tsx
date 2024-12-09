"use client"

import { useState } from "react"
import { Eye, Package, Archive, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/features/DataTable"
import Level2 from "@/components/features/Level2"
import { Params } from "@/types/paramTypes"

// Type Definitions
type Product = {
  id: string
  name: string
  price: number
  image: string
}

type StockMovement = {
  id: string
  productId: string
  quantity: number
  movementType: "input" | "output"
  movementDate: string
  createdAt: string
}

// Dummy Data (would typically come from an API)
const initialProducts: Product[] = [
  {
    id: "prod1",
    name: "Burger Classic",
    price: 12.5,
    image: "/api/placeholder/100/100"
  },
  {
    id: "prod2",
    name: "Frites Royales",
    price: 5.0,
    image: "/api/placeholder/100/100"
  }
]

const initialStockMovements: StockMovement[] = [
  {
    id: "mov1",
    productId: "prod1",
    quantity: 50,
    movementType: "input",
    movementDate: "2024-03-15",
    createdAt: "2024-03-15T10:30:00Z"
  },
  {
    id: "mov2",
    productId: "prod1",
    quantity: 10,
    movementType: "output",
    movementDate: "2024-03-22",
    createdAt: "2024-03-22T14:45:00Z"
  },
  {
    id: "mov3",
    productId: "prod2",
    quantity: 100,
    movementType: "input",
    movementDate: "2024-03-20",
    createdAt: "2024-03-20T09:15:00Z"
  }
]

const StockManagement = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filterState, setFilterState] = useState<Params>({
    page: 0,
    size: 20,
    type: "stock",
    filter: "movementDate",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    search: "",
    status: ""
  })

  const [stockData, setStockData] = useState<{
    data: StockMovement[]
    recordsFiltered: number
    recordsTotal: number
  }>({
    data: initialStockMovements,
    recordsFiltered: initialStockMovements.length,
    recordsTotal: initialStockMovements.length
  })

  const calculateCurrentStock = (productId: string) => {
    return initialStockMovements
      .filter(mov => mov.productId === productId)
      .reduce((total, movement) => {
        return movement.movementType === "input" 
          ? total + movement.quantity 
          : total - movement.quantity
      }, 0)
  }

  const getMovementTypeLabel = (movementType: StockMovement["movementType"]) => {
    switch (movementType) {
      case "input":
        return "Entrée"
      case "output":
        return "Sortie"
    }
  }

  const handlePageChange = (page: number) => {
    setFilterState((prev) => ({ ...prev, page }))
  }

  const handleFilterChange = (filters: any) => {
    setFilterState((prev) => ({
      ...prev,
      filter: filters.filterBy || "movementDate",
      startDate: filters.dateRange?.from || prev.startDate,
      endDate: filters.dateRange?.to || prev.endDate,
      search: filters.searchValue
    }))
  }

  const columns = [
    {
      accessorKey: "product",
      header: "Produit",
      cell: ({ row }: any) => {
        const product = initialProducts.find((p) => p.id === row.original.productId)
        return product ? product.name : "N/A"
      }
    },
    {
      accessorKey: "movementDate",
      header: "Date du mouvement"
    },
    {
      accessorKey: "movementType",
      header: "Type de mouvement",
      cell: ({ row }: any) => {
        const movementType = row.original.movementType
        const Icon = movementType === "input" ? TrendingUp : TrendingDown
        return (
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${movementType === "input" ? "text-green-500" : "text-red-500"}`} />
            {getMovementTypeLabel(movementType)}
          </div>
        )
      }
    },
    {
      accessorKey: "quantity",
      header: "Quantité",
      cell: ({ row }: any) => `${row.original.quantity} unités`
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const product = initialProducts.find(p => p.id === row.original.productId)
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                setSelectedProduct(product || null)
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
      <Level2 title="Gestion du Stock" />

      <DataTable
        totalItems={stockData.recordsTotal}
        currentPage={filterState.page}
        pageSize={filterState.size}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        columns={columns}
        data={stockData.data}
      />

      {/* Stock Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="shadow-md px-3 py-4">
            <DialogTitle className="font-bold">Détails du stock: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-3">
              {/* Left Side: Product Details */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Informations Produit</h2>
                  <div className="flex items-center gap-4 ml-2">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      className="w-24 h-24 object-cover rounded-md" 
                    />
                    <div>
                      <p className="font-semibold text-lg">{selectedProduct.name}</p>
                      <p className="text-gray-600">Prix: €{selectedProduct.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Stock Actuel</h2>
                  <div className="flex items-center gap-2 ml-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    <p className="text-gray-600 text-lg">
                      {calculateCurrentStock(selectedProduct.id)} unités
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Stock Movements */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Historique des Mouvements</h2>
                <div className="space-y-2">
                  {initialStockMovements
                    .filter(mov => mov.productId === selectedProduct.id)
                    .map((movement) => (
                      <div 
                        key={movement.id} 
                        className="flex items-center justify-between border rounded-md p-2 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          {movement.movementType === "input" ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span>{getMovementTypeLabel(movement.movementType)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{movement.movementDate}</span>
                          <span className="font-semibold">
                            {movement.quantity} unités
                          </span>
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

export default StockManagement