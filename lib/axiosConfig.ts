import { authService } from "@/services/authService"
import axios from "axios"

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
})

const shouldAttemptRefresh = (url: string): boolean => {
  const normalizedUrl = url.replace(/^\/[a-z]{2}\//, "/")
  return normalizedUrl.startsWith("/o/") && !normalizedUrl.startsWith("/o/auth/")
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && shouldAttemptRefresh(originalRequest.url)) {
      originalRequest._retry = true

      try {
        await authService.refresh()
        return api(originalRequest)
      } catch (refreshError) {
        window.location.href = `/o/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}` // Include full URL
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
