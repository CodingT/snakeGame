"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/lib/api/types"
import { authApi } from "@/lib/api/mock-api"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login({ email, password })
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          })
          throw error
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.signup({ username, email, password })
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Signup failed",
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authApi.logout()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // Force logout even if API call fails (e.g. backend restarted/token invalid)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "snake-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
