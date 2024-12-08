"use client"

import React, { createContext, useState, useContext, useEffect } from "react"

export type OrderCartContextType = {
  isOrderCartVisible: boolean
  toggleOrderCart: () => void
}

export const OrderCartContext = createContext<OrderCartContextType>({
  isOrderCartVisible: false,
  toggleOrderCart: () => {}
})

export const OrderCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOrderCartVisible, setIsOrderCartVisible] = useState(() => {
    // Initialize from sessionStorage
    const savedState = sessionStorage.getItem("orderCartVisibility")
    return savedState ? JSON.parse(savedState) : false
  })

  const toggleOrderCart = () => {
    const newVisibility = !isOrderCartVisible
    setIsOrderCartVisible(newVisibility)
    sessionStorage.setItem("orderCartVisibility", JSON.stringify(newVisibility))
  }

  return <OrderCartContext.Provider value={{ isOrderCartVisible, toggleOrderCart }}>{children}</OrderCartContext.Provider>
}
