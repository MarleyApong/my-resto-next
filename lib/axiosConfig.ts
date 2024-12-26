import axios from "axios"
import { authService } from "@/services/authService"

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Gérer le refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await authService.refresh()
        isRefreshing = false
        processQueue()
        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError)
        // Si le refresh échoue, on rejette simplement l'erreur
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
