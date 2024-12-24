import { ReactNode, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import Skeleton from "react-loading-skeleton"

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

  // if (loading) {
  //   return (
  //     <div style={{ padding: "20px" }}>
  //       <Skeleton height={40} width="60%" style={{ marginBottom: "10px" }} />
  //       <Skeleton height={20} width="80%" style={{ marginBottom: "10px" }} />
  //       <Skeleton height={20} width="40%" />
  //     </div>
  //   )
  // }

  return <>{children}</>
}

export default AuthGuard
