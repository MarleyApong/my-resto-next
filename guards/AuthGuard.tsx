"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { Loader } from "@/components/features/Loader"

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth()
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const locale = pathname.split("/")[1]
      router.push(`/${locale}/o/auth/login`)
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
