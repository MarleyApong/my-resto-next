import { OrderCartContext } from "@/contexts/OrderCartContext";
import { useContext } from "react";

export const useOrderCart = () => useContext(OrderCartContext)
