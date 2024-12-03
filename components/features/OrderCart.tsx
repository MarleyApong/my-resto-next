import { PencilOff } from "lucide-react"
import React from "react"
import { Button } from "../ui/button"

type FoodCart = {
  id: number | string
  name: string
  picture: string
  price: number
  quantity: number
}

const OrderCart = () => {
  const foodsCart: FoodCart[] = [
    { id: "1", name: "Burger", picture: "/assets/img/test.jpg", price: 1500, quantity: 5 },
    { id: "2", name: "Burger", picture: "/assets/img/test.jpg", price: 1500, quantity: 5 }
  ]

  return (
    <div className="fixed top-0 right-0 z-50 w-80 bg-background shadow-md h-full">
      <div className="title h-11 p-2 border-b flex justify-between">
        <div className="font-bold">Table 4</div>
        <Button size="icon" className="">
          <PencilOff />
        </Button>
      </div>

      <div className="p-4 grid gap-2">
        {foodsCart.map((food) => (
          <div key={food.id} className="border rounded-md h-16 flex gap-2 p-1 text-xs">
            <img src={food.picture} alt={food.name} className="rounded-md w-14 h-full border border-gray-100 object-cover" />
            <div className="flex flex-col justify-between w-full">
              <div className="">{food.name}</div>
              <div className="flex justify-between w-full">
                <div className="flex gap-1">
                  <span>{food.price}</span>
                  <span className="text-gray-600">{food.quantity} x</span>
                </div>
                <div className="px-1 bg-primary rounded-md text-white">{food.price * food.quantity} FCFA</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-secondary">
        <div className="flex justify-between text-gray-400 font-xs">
          <span>Sub total</span>
          <span>2000</span>
        </div>
        <div className="flex justify-between text-gray-400 font-xs">
          <span>Tax 5%</span>
          <span>20</span>
        </div>
        <div className="">
          <span>Total amount</span>
          <span>2500</span>
        </div>
      </div>
    </div>
  )
}

export default OrderCart
