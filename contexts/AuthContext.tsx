"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/services/authService"
import { useError } from "@/hooks/useError"
import { createAuthErrorHandler } from "@/hooks/useAuthError"

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  loading: boolean
  setUser: (user: any) => void
  setIsAuthenticated: (value: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  setUser: () => {},
  setIsAuthenticated: () => {},
  login: async () => {},
  logout: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showError } = useError()
  const router = useRouter()
  const pathname = usePathname()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Créer le gestionnaire d'erreurs avec les setters
  const handleAuthError = createAuthErrorHandler(setLoading, setIsAuthenticated, setUser, showError, router)

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password)
      const res = await authService.getMe()
      setUser(res.data.user)
      setIsAuthenticated(true)
    } catch (err) {
      handleAuthError(err)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      router.push("/o/auth/login")
    } catch (err) {
      handleAuthError(err)
    }
  }

  const checkAuth = async () => {
    if (!isClient) return // Ne pas vérifier l'auth côté serveur

    setLoading(true)
    try {
      const cleanPathname = pathname.replace(/^\/(en|fr|es)\//, "/")
      const isAuthRoute = cleanPathname.startsWith("/o/auth")
      const isProtectedRoute = cleanPathname.startsWith("/o") && !isAuthRoute

      if (isAuthRoute) {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false) // Important !
        return
      }

      if (isProtectedRoute) {
        const res = await authService.getMe()
        setUser(res.data.user)
        setIsAuthenticated(true)
      }
    } catch (err) {
      setIsAuthenticated(false)
      setUser(null)
      if (pathname.startsWith("/o/")) {
        router.replace(`/o/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
      }
    } finally {
      setLoading(false) // S'assurer que le loading est toujours mis à false
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      checkAuth()
    }
  }, [pathname, isClient])

  if (!isClient) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        setUser,
        setIsAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
