import { api } from "@/lib/axiosConfig"

const route = "/auth"

export const authService = {
  getMe: async () => {
    return await api.get(`${route}/me`)
  },

  login: async (email: string, password: string) => {
    return await api.post(`${route}/login`, { email, password })
  },

  logout: async () => {
    return await api.post(`${route}/logout`)
  }
}
