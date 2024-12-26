import { useEffect, useRef } from "react"
import { authService } from "@/services/authService"
import { jwtDecode } from "jwt-decode"

export const useTokenRefresh = () => {
  const refreshTimeoutId = useRef<NodeJS.Timeout>()

  const setupRefreshToken = () => {
    const cookies = document.cookie.split(";")
    const accessToken = cookies.find((cookie) => cookie.trim().startsWith("accessToken="))

    if (!accessToken) return

    try {
      const token = accessToken.split("=")[1]
      const decoded = jwtDecode(token)
      const expirationTime = decoded.exp! * 1000
      const currentTime = Date.now()
      const timeUntilExpiry = expirationTime - currentTime

      // Refresh 30 seconds before expiry
      const refreshTime = timeUntilExpiry - 10000

      if (refreshTime <= 0) return

      refreshTimeoutId.current = setTimeout(async () => {
        try {
          await authService.refresh()
          setupRefreshToken() // Setup next refresh
        } catch (err) {
          await authService.logout()
        }
      }, refreshTime)
    } catch (error) {
      console.error("Token decode failed:", error)
    }
  }

  useEffect(() => {
    setupRefreshToken()

    return () => {
      if (refreshTimeoutId.current) {
        clearTimeout(refreshTimeoutId.current)
      }
    }
  }, [])
}
