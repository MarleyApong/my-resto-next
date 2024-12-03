import OrderCart from "@/components/features/OrderCart"
import React from "react"

type MenuCategory = {
  name: string
  count: number
}

type Product = {
  id: string | number
  picture: string
  name: string
  price: string | number
  quantity: number
  specialPrice?: string | number
  description?: string
}

const SalesTerminal = () => {
  const menuCategories: MenuCategory[] = [
    {
      name: "All",
      count: 575
    },
    {
      name: "Breakfast",
      count: 200
    },
    {
      name: "Soup",
      count: 25
    },
    {
      name: "Pasta",
      count: 25
    },
    {
      name: "Main course",
      count: 150
    },
    {
      name: "Burger",
      count: 50
    },
    {
      name: "Boisson",
      count: 75
    }
  ]

  const products: Product[] = [
    {
      id: "1",
      picture: "/assets/img/test.jpg",
      name: "Burger",
      price: "1500",
      quantity: 25
    },
    {
      id: "2",
      picture: "/assets/img/test.jpg",
      name: "Salad",
      price: "1200",
      quantity: 15
    },
    {
      id: "3",
      picture: "/assets/img/test.jpg",
      name: "Pizza",
      price: "2000",
      quantity: 10
    }
  ]

  return (
    <div className="mx-5">
      {/* Menu Categories */}
      <div className="menu-categories flex gap-8">
        {menuCategories.map((category, index) => (
          <div className="shadow-md rounded-md bg-gray-100 px-2 py-1 text-sm relative min-w-24 cursor-pointer border-2 border-white hover:bg-blue-500 hover:text-white" key={index}>
            {category.name}
            <div className="absolute rounded-md bg-blue-500 text-white px-2 -top-4 -right-3">{category.count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-16 mt-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center border border-gray-200 bg-white rounded-lg p-2 gap-2 overflow-hidden">
            <img src={product.picture} alt={product.name} className="rounded-md w-32 h-32 border border-gray-100 object-cover" />
            <div className="flex flex-col justify-center gap-2 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm">{product.price} fcfa</span>
              </div>
              <div className="flex justify-center">
                <button className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded shadow hover:bg-blue-600">Ajouter au panier</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <OrderCart />
    </div>
  )
}

export default SalesTerminal
