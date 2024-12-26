import { useRouter } from "next/navigation"
import { useAuth } from "./useAuth"
import { useError } from "./useError"

export const createAuthErrorHandler = (setLoading: (state: boolean) => void, setIsAuthenticated: (value: boolean) => void, setUser: (user: any) => void, showError: (error: any) => void, router: any) => {
  return (error: any) => {
    const status = error.response?.status
    const errorData = error.response?.data

    // Si c'est une erreur 401 ou une erreur de refresh token
    if (status === 401 || (errorData?.message && errorData.message.includes("refresh"))) {
      setIsAuthenticated(false)
      setUser(null)
      setLoading(false)
      const currentPath = window.location.href
      router.replace(`/o/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`)
    }

    // Afficher le message d'erreur du backend
    showError({
      name: errorData?.name,
      message: errorData?.message || "Une erreur est survenue",
      status: status
    })

    return Promise.reject(error)
  }
}
