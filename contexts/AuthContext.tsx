"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/services/authService"
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

  const login = async (email: string, password: string) => {
    await authService.login(email, password)
    const res = await authService.getMe()
    setUser(res.data.user)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      router.push("/o/auth/login")
    } catch (err) {
      showError(err)
    }
  }

  const checkAuth = async () => {
    setLoading(true)
    try {
      if (pathname.includes("o/auth")) {
        setIsAuthenticated(false)
        setUser(null)
        return
      }

      const res = await authService.getMe()
      setUser(res.data.user)
      setIsAuthenticated(true)
    } catch (err) {
      setIsAuthenticated(false)
      setUser(null)
      if (pathname.startsWith("/o/")) {
        router.replace(`/o/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [pathname])

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