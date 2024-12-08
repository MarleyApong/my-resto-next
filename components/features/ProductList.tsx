"use client"

import React from "react"
import { Button } from "../ui/button"

export type Product = {
  id: string | number
  picture: string
  name: string
  price: number
  specialPrice?: number
  description?: string
  quantity: number
}

type ProductListProps = {
  products: Product[]
  menuCategories: { name: string; count: number }[]
  handleQuantityChange: (id: string | number, delta: number) => void
  onAddToCart: (product: Product) => void
  items: { id: string | number; quantity: number }[]
}

const ProductList: React.FC<ProductListProps> = ({ products, menuCategories, handleQuantityChange, onAddToCart, items }) => {
  return (
    <>
      {/* Menu Categories Slider */}
      <div className="menu-categories flex overflow-x-auto gap-4 no-scrollbar mb-4">
        {menuCategories?.length ? (
          menuCategories.map((category, index) => (
            <Button
              key={index}
              className="flex gap-2 shadow-md rounded-md min-w-max bg-[var(--secondary)] text-[var(--foreground)] px-2 py-1 text-sm relative cursor-pointer border-2 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
            >
              <span className="font-medium text-xs">{category.name}</span>
              <div className="flex items-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-2 text-xs font-bold">{category.count}</div>
            </Button>
          ))
        ) : (
          <span className="text-sm text-gray-500">Aucune catégorie disponible</span>
        )}
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-16 mt-3">
        {products.map((product) => {
          const cartItem = items.find((item) => item.id === product.id)

          return (
            <div key={product.id} className="flex flex-col border shadow-md bg-card text-[var(--card-foreground)] rounded-sm p-2 gap-2 overflow-hidden">
              <img src={product.picture} alt={product.name} className="rounded-sm w-full h-32 border border-[var(--border)] object-cover" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-xs">{product.name}</span>
                </div>

                <div className="flex justify-between items-center font-semibold">
                  <span className={`text-xs ${product.specialPrice ? "line-through text-[var(--muted-foreground)]" : "text-primary"}`}>{product.price} FCFA</span>
                  {product.specialPrice && <span className="text-xs text-[var(--destructive)]">{product.specialPrice} FCFA</span>}
                </div>

                {/* Quantity Controls */}
                {cartItem ? (
                  <div className="flex items-center justify-between gap-4 p-1 border border-[var(--primary)] rounded-md bg-[var(--secondary)]">
                    <Button onClick={() => handleQuantityChange(product.id, -1)} size="icon" variant="printemps">
                      -
                    </Button>
                    <span className="text-sm font-medium">{cartItem.quantity}</span>
                    <Button onClick={() => handleQuantityChange(product.id, 1)} variant="printemps" size="icon">
                      +
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button onClick={() => onAddToCart(product)} className="w-full px-3 py-1 text-xs font-medium rounded-sm shadow" variant="printemps">
                      Ajouter au panier
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default ProductList
