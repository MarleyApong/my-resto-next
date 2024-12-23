import { ErrorContext, ErrorContextType } from "@/contexts/ErrorProvider"
import { useContext } from "react"

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider")
  }
  return context
}
