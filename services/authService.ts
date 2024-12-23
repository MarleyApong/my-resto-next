import api from "@/lib/axiosConfig"

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password })    
    return res.data
  },

  logout: async () => {
    await api.post("/auth/logout")
  },

  refresh: async () => {
    const response = await api.post("/auth/refresh")
    return response.data
  }
}
