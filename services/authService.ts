import api from "@/lib/axiosConfig"

export const authService = {
  login: async (email: string, password: string) => {
    alert("api auth login")
    const res = await api.post("/auth/login", { email, password })
    console.log("response", res);
    
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
