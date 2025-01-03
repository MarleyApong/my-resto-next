import { ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Loader } from "@/components/features/MainLoader"

interface AuthGuardProps {
  children: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag after initial render
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle authentication redirect
  useEffect(() => {
    if (!isLoading && isClient && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(window.location.href)
      router.replace(`/o/auth/login?callbackUrl=${callbackUrl}`)
    }
  }, [isAuthenticated, isLoading, isClient, router])

  if (isLoading && isClient) {
    return <Loader />
  }

  if (!isClient || !isAuthenticated) {
    return null
  }

  return children
}