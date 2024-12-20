import axios from "axios"

// Instance
const api = axios.create({
  baseURL: "/api",
  withCredentials: true
})

// Intercepteur de réponse pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si l'erreur est un 401 et que ce n'est pas une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Tenter de rafraîchir le token
        const { data } = await api.post("/auth/refresh")
        api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`

        // Relancer la requête originale
        return api(originalRequest)
      } catch (refreshError) {
        // Si le refresh échoue, déconnexion
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
