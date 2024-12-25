import api from "@/lib/axiosConfig"

export const authService = {
  getMe: async () => {
    return await api.get("/auth/me");
  },

  login: async (email: string, password: string) => {
    return await api.post("/auth/login", { email, password })
  },

  logout: async () => {
    await api.post("/auth/logout")
  },

  refresh: async () => {
    return await api.post("/auth/refresh")
  }
}
