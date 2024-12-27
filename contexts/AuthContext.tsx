"use client"

import { createContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/lib/axiosConfig"
import { useError } from "@/hooks/useError"

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  loading: boolean
  setUser: (user: any) => void
  setIsAuthenticated: (value: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showError } = useError()
  const router = useRouter()
  const pathname = usePathname()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  const checkAuth = async () => {
    if (!isClient) return

    setLoading(true)
    try {
      const cleanPathname = pathname.replace(/^\/(en|fr)\//, "/")
      const isAuthRoute = cleanPathname.startsWith("/o/auth")
      const isProtectedRoute = cleanPathname.startsWith("/o") && !isAuthRoute

      if (isAuthRoute) {
        setIsAuthenticated(false)
        setUser(null)
        return
      }

      if (isProtectedRoute) {
        const res = await api.get("/auth/me")
        setUser(res.data.user)
        setIsAuthenticated(true)
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        document.cookie = "sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;"
      }
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
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

  const login = async (email: string, password: string) => {
    try {
      await api.post("/auth/login", { email, password })
      const res = await api.get("/auth/me")
      setUser(res.data.user)
      setIsAuthenticated(true)
    } catch (error: any) {
      showError(error.response?.data?.message || "Login error")
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
      setUser(null)
      setIsAuthenticated(false)
      const locale = pathname.split("/")[1]
      router.push(`/${locale}/o/auth/login`)
    } catch (error: any) {
      showError(error.response?.data?.message || "Logout error")
    }
  }

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
