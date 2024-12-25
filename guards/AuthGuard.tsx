import { ReactNode, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Loader } from "@/components/features/Loader"

interface AuthGuardProps {
  children: ReactNode
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/o/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }
  }, [isAuthenticated, loading])
  

  if (loading) {
    return <Loader />
  }

  return <>{children}</>
}

export default AuthGuard
