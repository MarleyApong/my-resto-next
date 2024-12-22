"use client"

import React, { useState } from "react"
import ProductList, { Product } from "@/components/features/ProductList"
import OrderCartMenu, { CartItem } from "@/components/features/OrderCartMenu"
import { OrderCartProvider } from "@/contexts/OrderCartContext"
import { HeaderForMenuProduct } from "@/components/layout/header/HeaderForMenuProduct"

const Menu: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([])

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
    console.log("Order placed", { items: cart })
    setCart([]) // Clear cart after placing order
  }

  return (
    <OrderCartProvider>
      <HeaderForMenuProduct />
      <div className="flex flex-col gap-4 p-4 mt-10">
        <ProductList products={products} menuCategories={menuCategories} handleQuantityChange={handleUpdateQuantity} onAddToCart={handleAddToCart} items={cart} />
        <OrderCartMenu items={cart} onPlaceOrder={handlePlaceOrder} onRemoveItem={handleRemoveItem} />
      </div>
    </OrderCartProvider>
  )
}

export default Menu
