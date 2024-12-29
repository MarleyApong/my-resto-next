import axios from "axios"
import Swal from "sweetalert2"

const api = axios.create({
  baseURL: "/api"
})

// Simple error handling interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const pathname = window.location.pathname
      const locale = pathname.split("/")[1]
      const errorName = error.response.data?.name

      let reason = "session_expired"
      switch (errorName) {
        case "SessionExpiredError":
          reason = "session_expired"
          break
        case "SessionInvalidError":
          reason = "session_invalid"
          break
        case "SessionRevokedError":
          reason = "session_revoked"
          break
        case "InactiveAccountError":
          reason = "account_inactive"
          break
      }

      window.location.href = `/${locale}/o/auth/login?reason=${reason}`
      return Promise.reject(error)
    }

    if (error.response?.data?.message) {
      await Swal.fire({
        icon: "error",
        text: error.response.data.message || "An error occurred",
        confirmButtonColor: "#3085d6"
      })
    }

    return Promise.reject(error)
  }
)

export { api }
