import axios from 'axios'
import { User, AuthTokens, LoginRequest, RegisterRequest } from '@shared/types'
import { API_ENDPOINTS } from '@shared/constants'

interface AuthResponse {
  user: User
  tokens: AuthTokens
}

class AuthService {
  private api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  })

  constructor() {
    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const { tokens } = JSON.parse(authData).state
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`
        }
      }
      return config
    })

    // Handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            const authData = localStorage.getItem('auth-storage')
            if (authData) {
              const { tokens } = JSON.parse(authData).state
              if (tokens?.refreshToken) {
                const response = await this.refreshToken(tokens.refreshToken)
                
                // Update stored tokens
                const updatedAuthData = {
                  ...JSON.parse(authData),
                  state: {
                    ...JSON.parse(authData).state,
                    tokens: response.tokens
                  }
                }
                localStorage.setItem('auth-storage', JSON.stringify(updatedAuthData))
                
                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${response.tokens.accessToken}`
                return this.api(originalRequest)
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear auth data
            localStorage.removeItem('auth-storage')
            window.location.href = '/auth/login'
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    console.log('authService.login response:', response.data)
    // The API returns { success: true, data: { user, tokens }, message }
    return response.data.data
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    console.log('authService.register response:', response.data)
    // The API returns { success: true, data: { user, tokens }, message }
    return response.data.data
  }

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    const response = await this.api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get(API_ENDPOINTS.AUTH.PROFILE)
    return response.data
  }
}

export const authService = new AuthService()