import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { api } from "@/lib/axiosConfig"

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
  checkAuthStatus: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (menuId: string, action: "view" | "create" | "update" | "delete") => boolean
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,

      checkAuthStatus: async () => {
        set({ isLoading: true })
        try {
          const res = await api.get("/auth/me")
          set({
            user: res.data.user,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (err: any) {
          if (err.response?.status === 401) {
            document.cookie = "sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;"
          }
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
          throw err // L'erreur sera gérée par ErrorProvider
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          await api.post("/auth/login", { email, password })
          const res = await api.get("/auth/me")
          set({
            user: res.data.user,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (err) {
          set({ isLoading: false })
          throw err // L'erreur sera gérée par ErrorProvider
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.post("/auth/logout")
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        } catch (err) {
          set({ isLoading: false })
          throw err // L'erreur sera gérée par ErrorProvider
        }
      },

      hasPermission: (menuId: string, action: "view" | "create" | "update" | "delete") => {
        const { user } = get()
        if (!user?.role.permissions) return false
        const permission = user.role.permissions.find((p) => p.menuId === menuId)
        return permission ? permission[action] : false
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }))
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export const useAuth = () => useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  user: state.user,
  isLoading: state.isLoading,
  login: state.login,
  logout: state.logout,
  checkAuthStatus: state.checkAuthStatus,
  hasPermission: state.hasPermission
}))