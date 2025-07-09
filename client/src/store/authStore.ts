import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthTokens } from '@shared/types'
import { authService } from '../services/authService'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

interface RegisterData {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        console.log('AuthStore: Starting login...')
        set({ isLoading: true })
        try {
          const response = await authService.login({ email, password })
          console.log('AuthStore: Login response:', response)
          set({ 
            user: response.user, 
            tokens: response.tokens,
            isLoading: false 
          })
          console.log('AuthStore: User state updated:', response.user)
        } catch (error) {
          console.error('AuthStore: Login error:', error)
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(userData)
          set({ 
            user: response.user, 
            tokens: response.tokens,
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        const { tokens } = get()
        if (tokens) {
          authService.logout()
        }
        set({ user: null, tokens: null })
      },

      refreshToken: async () => {
        const { tokens } = get()
        if (!tokens) return

        try {
          const response = await authService.refreshToken(tokens.refreshToken)
          set({ tokens: response.tokens })
        } catch (error) {
          set({ user: null, tokens: null })
          throw error
        }
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        tokens: state.tokens 
      }),
    }
  )
)