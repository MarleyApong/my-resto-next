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

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!loading && isClient && !isAuthenticated) {
      router.replace(`/o/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
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
