import { Banknote, CreditCard, PencilOff, Smartphone } from "lucide-react"
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
    { id: "1", name: "Tacos Salsa With Chickens Grilled", picture: "/assets/img/test.jpg", price: 1500, quantity: 5 },
    { id: "2", name: "Original Chess Burger With French Fries", picture: "/assets/img/test.jpg", price: 2000, quantity: 5 },
    { id: "3", name: "Tacos Salsa With Chickens Grilled", picture: "/assets/img/test.jpg", price: 1500, quantity: 5 },
    { id: "4", name: "Original Chess Burger With French Fries", picture: "/assets/img/test.jpg", price: 3000, quantity: 5 },
    { id: "5", name: "Tacos Salsa With Chickens Grilled", picture: "/assets/img/test.jpg", price: 1500, quantity: 5 },
    { id: "6", name: "Original Chess Burger With French Fries", picture: "/assets/img/test.jpg", price: 2500, quantity: 5 },
    { id: "7", name: "Tacos Salsa With Chickens Grilled", picture: "/assets/img/test.jpg", price: 1000, quantity: 5 },
    { id: "8", name: "Original Chess Burger With French Fries", picture: "/assets/img/test.jpg", price: 4000, quantity: 5 },
  ]

  return (
    <div className="fixed top-0 right-0 z-50 w-80 bg-background shadow-md h-screen">
      <div className="title h-11 p-2 border-b flex justify-between">
        <div className="font-bold">Table 4</div>
        <Button size="icon" className="">
          <PencilOff />
        </Button>
      </div>

      <div className="flex flex-col justify-between h-[calc(100%-2rem)] p-4">
        <div className="grid gap-2 max-h-[calc(100%-15rem)] overflow-auto">
          {foodsCart.map((food) => (
            <div key={food.id} className="border rounded-md h-16 flex gap-2 p-1 text-xs">
              <img src={food.picture} alt={food.name} className="rounded-md w-14 h-full border border-gray-100 object-cover" />
              <div className="flex flex-col justify-between w-full">
                <div className="text-sm font-semibold">{food.name}</div>
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

        <div className="p-2 mt-2">
          <div className="bg-secondary rounded-md p-4">
            <div className="flex justify-between text-gray-700 font-xs text-sm">
              <span>Sub total</span>
              <span>2000</span>
            </div>
            <div className="flex justify-between text-gray-700 font-xs text-sm">
              <span>Tax 5%</span>
              <span>20</span>
            </div>
            <div className="text-sm flex justify-between font-bold border-t-2 border-dashed mt-3 pt-2">
              <span>Total amount</span>
              <span className="px-1 bg-primary rounded-md text-white">2500 FCFA</span>
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

          <Button className="w-full">Place order</Button>
        </div>
      </div>
    </div>
  )
}

export default OrderCart
