"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import TableSelector from "@/components/features/TableSelector"
import ProductList, { Product } from "@/components/features/ProductList"
import OrderCart, { CartItem } from "@/components/features/OrderCart"

const SalesTerminal = () => {
  const [orderMode, setOrderMode] = useState<"dine-in" | "takeaway">("dine-in")
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

  const tables = [
    { id: "1", name: "Table 1", status: "free" },
    { id: "2", name: "Table 2", status: "occupied" }
  ]

  const products: Product[] = [
    { id: "1", picture: "/assets/img/test.jpg", name: "Burger", price: 1500, quantity: 10 },
    { id: "2", picture: "/assets/img/test.jpg", name: "Salad", price: 1200, quantity: 10 }
  ]

  const menuCategories = [
    { name: "All", count: 575 },
    { name: "Burger", count: 50 }
  ]

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (id: string | number, delta: number) => {
    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item)).filter((item) => item.quantity > 0))
  }

  const handleRemoveItem = (id: string | number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const handlePlaceOrder = () => {
    console.log("Order placed", { mode: orderMode, table: selectedTable, items: cart })
    setCart([]) // Clear cart
    setSelectedTable(null) // Reset table
  }

  const handleTableChange = (newTableId: string | null) => {
    setSelectedTable(newTableId)
    setOrderMode(newTableId ? "dine-in" : "takeaway") // Switch mode based on table selection
  }

  return (
    <div className="flex">
      <div className="flex-grow mx-5">
        <div className="flex gap-4 mb-4">
          <Button
            variant={orderMode === "dine-in" ? "default" : "outline"}
            onClick={() => {
              setOrderMode("dine-in")
              setSelectedTable(null)
            }}
          >
            Sur place
          </Button>
          <Button
            variant={orderMode === "takeaway" ? "default" : "outline"}
            onClick={() => {
              setOrderMode("takeaway")
              setSelectedTable(null)
            }}
          >
            À emporter
          </Button>
        </div>

        {orderMode === "dine-in" && !selectedTable && <TableSelector tables={tables} onSelectTable={setSelectedTable} />}

        {(orderMode === "takeaway" || selectedTable) && (
          <ProductList products={products} menuCategories={menuCategories} handleQuantityChange={handleUpdateQuantity} onAddToCart={handleAddToCart} items={cart} />
        )}
      </div>

      <OrderCart items={cart} tableNumber={selectedTable || undefined} onPlaceOrder={handlePlaceOrder} tables={tables} onTableChange={handleTableChange} />
    </div>
  )
}

export default SalesTerminal
