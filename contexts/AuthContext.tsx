import api from "@/lib/axiosConfig"
import { authService } from "@/services/authService"
import React, { createContext, useState, useEffect } from "react"

interface AuthContextType {
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider= ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    try {
      const { accessToken } = await authService.login(email, password)
      setAccessToken(accessToken)
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const logout = async () => {
    await authService.logout()
    setAccessToken(null)
    delete api.defaults.headers.common["Authorization"]
  }

  // Rafraîchissement automatique au rechargement de la page
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const { accessToken } = await authService.refresh()
        setAccessToken(accessToken)
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      } catch (error) {
        console.error("Failed to refresh token:", error)
      }
    }

    refreshToken()
  }, [])

  return <AuthContext.Provider value={{ accessToken, login, logout }}>{children}</AuthContext.Provider>
}