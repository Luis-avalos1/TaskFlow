import axios from 'axios'
import { API_ENDPOINTS } from '@shared/constants'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  projectId: string
  projectName?: string
  assigneeId?: string
  reporterId: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  createdAt: string
  updatedAt: string
  assignee?: {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
  }
  reporter?: {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
  }
}

interface CreateTaskRequest {
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  projectId: string
  assigneeId?: string
  dueDate?: string
  estimatedHours?: number
  tags?: string[]
}

interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
}

interface TaskResponse {
  success: boolean
  data: Task
  message: string
}

interface TasksResponse {
  success: boolean
  data: Task[]
  message: string
}

interface TaskFilters {
  projectId?: string
  status?: string
  priority?: string
  assigneeId?: string
}

class TaskService {
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
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await this.api.post<TaskResponse>(API_ENDPOINTS.TASKS.BASE, taskData)
    return response.data.data
  }

  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams()
    if (filters?.projectId) params.append('projectId', filters.projectId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId)

    const url = `${API_ENDPOINTS.TASKS.BASE}${params.toString() ? '?' + params.toString() : ''}`
    const response = await this.api.get<TasksResponse>(url)
    return response.data.data
  }

  async getTaskById(id: string): Promise<Task> {
    const response = await this.api.get<TaskResponse>(API_ENDPOINTS.TASKS.BY_ID(id))
    return response.data.data
  }

  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<Task> {
    const response = await this.api.put<TaskResponse>(API_ENDPOINTS.TASKS.BY_ID(id), taskData)
    return response.data.data
  }

  async deleteTask(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.TASKS.BY_ID(id))
  }

  // Utility methods for task management
  async moveTaskToStatus(id: string, status: 'todo' | 'in_progress' | 'in_review' | 'done'): Promise<Task> {
    return this.updateTask(id, { status })
  }

  async assignTask(id: string, assigneeId: string): Promise<Task> {
    return this.updateTask(id, { assigneeId })
  }

  async unassignTask(id: string): Promise<Task> {
    return this.updateTask(id, { assigneeId: undefined })
  }

  async updateTaskPriority(id: string, priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<Task> {
    return this.updateTask(id, { priority })
  }

  async addTagsToTask(id: string, newTags: string[]): Promise<Task> {
    const task = await this.getTaskById(id)
    const updatedTags = [...new Set([...task.tags, ...newTags])]
    return this.updateTask(id, { tags: updatedTags })
  }

  async removeTagsFromTask(id: string, tagsToRemove: string[]): Promise<Task> {
    const task = await this.getTaskById(id)
    const updatedTags = task.tags.filter(tag => !tagsToRemove.includes(tag))
    return this.updateTask(id, { tags: updatedTags })
  }
}

export const taskService = new TaskService()
export type { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters }