"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Banknote, CreditCard, PenLine, Smartphone, X } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export type CartItem = {
  id: string | number
  name: string
  picture: string
  price: number
  quantity: number
}

type OrderCartProps = {
  items: CartItem[]
  tableNumber?: string
  onPlaceOrder: () => void
  tables: { id: string; name: string; status: string }[]
  onTableChange: (newTableId: string | null) => void
}

const OrderCart: React.FC<OrderCartProps> = ({ items, tableNumber, onPlaceOrder, tables, onTableChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const calculateSubtotal = () => items.reduce((total, item) => total + item.price * item.quantity, 0)

  const tax = calculateSubtotal() * 0.05
  const totalAmount = calculateSubtotal() + tax

  const freeTables = tables.filter((table) => table.status === "free")

  const handleChangeTable = (tableId: string | null) => {
    onTableChange(tableId)
    setIsDialogOpen(false)
  }

  return (
    <div className="fixed top-0 right-0 z-50 w-80 bg-background shadow-md h-screen">
      <div className="title h-11 p-2 border-b flex justify-between">
        <div className="font-bold">{tableNumber ? `Table ${tableNumber}` : "Panier"}</div>
        {tableNumber && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon">
                <PenLine />
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0">
              <DialogHeader>
                <DialogTitle className="shadow-md px-2 py-3">Modifier la table</DialogTitle>
                <DialogDescription className="px-2">Sélectionnez une nouvelle table ou passez à l'option "À emporter".</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 mb-4 px-2">
                {freeTables.map((table) => (
                  <Button
                    key={table.id}
                    onClick={() => handleChangeTable(table.id)}
                    variant="outline"
                    className="h-14 flex flex-col justify-center items-center shadow-sm border p-2"
                  >
                    {table.name}
                  </Button>
                ))}
              </div>
              <DialogFooter className="flex gap-1 justify-end p-1 border-t">
                <Button size="sm" variant="default" onClick={() => handleChangeTable(null)}>
                  À emporter
                </Button>
                <Button size="sm" variant="close" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col justify-between h-[calc(100%-2rem)] p-4">
        <div className="grid gap-2 max-h-[calc(100%-15rem)] overflow-auto">
          {items.map((food) => (
            <div key={food.id} className="border rounded-md h-16 flex gap-2 p-1 text-xs">
              <img src={food.picture} alt={food.name} className="rounded-md w-14 h-full border border-gray-100 object-cover" />
              <div className="flex flex-col justify-between w-full">
                <div className="text-xs font-semibold">{food.name}</div>
                <div className="flex justify-between w-full font-bold">
                  <div className="flex gap-3">
                    <span className="text-xs text-primary">{food.price} FCFA</span>
                    <span className="text-gray-600 text-xs">{food.quantity}x</span>
                  </div>
                  <div className="text-xs text-primary">{food.price * food.quantity} FCFA</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-2 mt-2">
          <div className="bg-secondary rounded-md p-4">
            <div className="flex justify-between text-gray-700 text-xs">
              <span>Sous-total</span>
              <span>{calculateSubtotal()} FCFA</span>
            </div>
            <div className="flex justify-between text-gray-700 text-xs">
              <span>Taxe 5%</span>
              <span>{tax.toFixed(2)} FCFA</span>
            </div>
            <div className="text-xs flex justify-between font-semibold border-t-2 border-dashed mt-3 pt-2">
              <span>Montant total</span>
              <span className="px-1 bg-primary rounded-md text-white">{totalAmount.toFixed(2)} FCFA</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 m-5">
            <div className="border rounded-md grid place-content-center h-14 cursor-pointer text-black">
              <Banknote />
            </div>
            <div className="border rounded-md grid place-content-center cursor-pointer text-black">
              <CreditCard />
            </div>
            <div className="border rounded-md grid place-content-center cursor-pointer text-black">
              <Smartphone />
            </div>
          </div>

          <Button className="w-full" onClick={onPlaceOrder}>
            Passer la commande
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderCart
