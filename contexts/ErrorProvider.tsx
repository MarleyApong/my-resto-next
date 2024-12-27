"use client"

import React, { createContext, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

// Type to represent the error state
type AppError = {
  name?: string
  status?: number
  message: string
  details?: string
  requiresRedirect?: boolean
  redirectPath?: string
}

// Type for the context
export type ErrorContextType = {
  showError: (error: any) => void
}

// Creating the context
export const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<AppError | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const handleError = (err: any) => {
    let parsedError: AppError = {
      message: "An unexpected error occurred."
    }

    if (err.response) {
      if (err.response.status) {
        parsedError = {
          status: err.response.status,
          name: err.response.data.name,
          message: err.response.data?.message || "An error occurred."
        }
      }
    } else if (err.message) {
      parsedError = {
        message: err.message
      }
    }

    setError(parsedError)
  }

  const handleClose = () => {
    if (error?.requiresRedirect && error.redirectPath) {
      router.push(error.redirectPath)
    }
    setError(null)
  }

  return (
    <ErrorContext.Provider value={{ showError: handleError }}>
      {children}
      {error && (
        <AlertDialog open={!!error} onOpenChange={handleClose}>
          <AlertDialogContent className="z-50">
            <AlertDialogHeader>
              <AlertDialogTitle>{error?.name}</AlertDialogTitle>
              <AlertDialogDescription>
                {error.message}
                {error.details && <div className="mt-2 text-sm text-gray-500">{error.details}</div>}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button size="sm" onClick={handleClose}>
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ErrorContext.Provider>
  )
}
