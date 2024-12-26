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
    // Si on n'est plus en chargement, qu'on est côté client et pas authentifié
    if (!loading && isClient && !isAuthenticated) {
      router.replace(`/o/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
      return
    }
  }, [isAuthenticated, loading, isClient])

  // Afficher le loader uniquement pendant le chargement initial et côté client
  if (loading && isClient) {
    return <Loader />
  }

  // Ne rien rendre côté serveur ou si pas authentifié
  if (!isClient || !isAuthenticated) {
    return null
  }

  // Rendre les enfants uniquement si authentifié
  return children
}

export default AuthGuard
