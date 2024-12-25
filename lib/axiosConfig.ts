import { authService } from "@/services/authService"
import axios from "axios"

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
})

let isRefreshing = false
let refreshSubscribers: (() => void)[] = []

const subscribeTokenRefresh = (cb: () => void) => {
  refreshSubscribers.push(cb)
}

const onTokenRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb())
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await authService.refresh()
        isRefreshing = false
        onTokenRefreshed()
        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        window.location.href = `/o/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
