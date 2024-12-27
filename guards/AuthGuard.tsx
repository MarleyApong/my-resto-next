import { ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Loader } from "@/components/features/Loader"

interface AuthGuardProps {
  children: ReactNode
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag after initial render
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle authentication redirect
  useEffect(() => {
    if (!loading && isClient && !isAuthenticated) {
      // Store current URL as callback and redirect to login
      const callbackUrl = encodeURIComponent(window.location.href)
      router.replace(`/o/auth/login?callbackUrl=${callbackUrl}`)
    }
  }, [isAuthenticated, loading, isClient, router])

  if (loading && isClient) {
    return <Loader />
  }

  if (!isClient || !isAuthenticated) {
    return null
  }

  return children
}

export default AuthGuard
