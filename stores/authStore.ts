import { create } from "zustand"
import { api } from "@/lib/axiosConfig"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: {
    id: string
    name: string
    permissions: Array<{
      menuId: string
      view: boolean
      create: boolean
      update: boolean
      delete: boolean
    }>
  }
  status: {
    id: string
    name: string
  }
  organizations: any[]
  restaurants: any[]
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  setLoading: (value: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,

  setLoading: (value: boolean) => set({ isLoading: value }),

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      await api.post("/auth/login", { email, password })
      const res = await api.get("/auth/me")
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false
      })

    } catch (error: any) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      const res = await api.post("/auth/logout")
      console.log("res", res);
      
      toast(res.data.message)
      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get("/auth/me")
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false
      })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  }
}))
