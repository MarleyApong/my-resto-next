import axios from "axios"

// Instance
const api = axios.create({
  baseURL: "/api",
  withCredentials: true // Permet de gérer les cookies
})

// Intercepteur de réponse pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si la réponse a un status 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Vérifier si le refreshToken est disponible dans les cookies
      const refreshToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("refreshToken="))
        ?.split("=")[1]

      // Si le refreshToken n'existe pas, on ne tente pas de rafraîchir le token
      if (!refreshToken) {
        console.log("Aucun refreshToken trouvé. Redirection vers la page de connexion.")
        // Rediriger l'utilisateur vers la page de connexion (ou ignorer l'appel)
        return Promise.reject(error)
      }

      try {
        // Si un refreshToken est trouvé, on tente de rafraîchir l'`accessToken`
        const { data } = await api.post("/auth/refresh")
        api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`

        // Relancer la requête initiale avec le nouveau `accessToken`
        return api(originalRequest)
      } catch (refreshError) {
        // Si le refresh échoue, l'utilisateur doit se reconnecter
        console.log("Échec du rafraîchissement du token. Redirection vers la page de connexion.")
        return Promise.reject(refreshError)
      }
    }

    // Si ce n'est pas une erreur 401, rejeter l'erreur
    return Promise.reject(error)
  }
)

export default api
