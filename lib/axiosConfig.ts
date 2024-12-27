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
      window.location.href = `/${locale}/o/auth/login?reason=session_expired`
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
