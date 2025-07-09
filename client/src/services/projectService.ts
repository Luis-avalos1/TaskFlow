import axios from 'axios'
import { API_ENDPOINTS } from '@shared/constants'

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  startDate?: string
  endDate?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

interface CreateProjectRequest {
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  startDate?: string
  endDate?: string
}

interface ProjectResponse {
  success: boolean
  data: Project
  message: string
}

interface ProjectsResponse {
  success: boolean
  data: Project[]
  message: string
}

class ProjectService {
  private api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  })

  constructor() {
    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const authData = localStorage.getItem('auth-storage')
      console.log('ProjectService: Auth data from localStorage:', authData)
      if (authData) {
        const { tokens } = JSON.parse(authData).state
        console.log('ProjectService: Tokens from storage:', tokens)
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`
          console.log('ProjectService: Added auth header:', config.headers.Authorization)
        } else {
          console.log('ProjectService: No access token found')
        }
      } else {
        console.log('ProjectService: No auth data in localStorage')
      }
      return config
    })
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    console.log('ProjectService: Creating project with data:', projectData)
    console.log('ProjectService: API base URL:', this.api.defaults.baseURL)
    console.log('ProjectService: Request URL:', API_ENDPOINTS.PROJECTS.BASE)
    try {
      const response = await this.api.post<ProjectResponse>(API_ENDPOINTS.PROJECTS.BASE, projectData)
      console.log('ProjectService: Create project response:', response.data)
      return response.data.data
    } catch (error) {
      console.error('ProjectService: Create project error:', error)
      throw error
    }
  }

  async getProjects(): Promise<Project[]> {
    const response = await this.api.get<ProjectsResponse>(API_ENDPOINTS.PROJECTS.BASE)
    return response.data.data
  }

  async getProjectById(id: string): Promise<Project> {
    const response = await this.api.get<ProjectResponse>(API_ENDPOINTS.PROJECTS.BY_ID(id))
    return response.data.data
  }

  async updateProject(id: string, projectData: Partial<CreateProjectRequest>): Promise<Project> {
    const response = await this.api.put<ProjectResponse>(API_ENDPOINTS.PROJECTS.BY_ID(id), projectData)
    return response.data.data
  }

  async deleteProject(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.PROJECTS.BY_ID(id))
  }
}

export const projectService = new ProjectService()
export type { Project, CreateProjectRequest }