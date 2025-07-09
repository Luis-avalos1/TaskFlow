import { create } from 'zustand'
import { taskService, Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '../services/taskService'

interface TaskStore {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  selectedTask: Task | null
  filters: TaskFilters
  
  // Actions
  fetchTasks: (filters?: TaskFilters) => Promise<void>
  createTask: (taskData: CreateTaskRequest) => Promise<void>
  updateTask: (id: string, taskData: UpdateTaskRequest) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  getTaskById: (id: string) => Promise<void>
  setSelectedTask: (task: Task | null) => void
  setFilters: (filters: TaskFilters) => void
  clearError: () => void
  
  // Utility actions
  moveTaskToStatus: (id: string, status: 'todo' | 'in_progress' | 'in_review' | 'done') => Promise<void>
  assignTask: (id: string, assigneeId: string) => Promise<void>
  unassignTask: (id: string) => Promise<void>
  updateTaskPriority: (id: string, priority: 'low' | 'medium' | 'high' | 'urgent') => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  selectedTask: null,
  filters: {},

  fetchTasks: async (filters?: TaskFilters) => {
    set({ isLoading: true, error: null })
    try {
      const tasks = await taskService.getTasks(filters || get().filters)
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        isLoading: false 
      })
    }
  },

  createTask: async (taskData: CreateTaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const newTask = await taskService.createTask(taskData)
      set(state => ({ 
        tasks: [...state.tasks, newTask],
        isLoading: false 
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create task',
        isLoading: false 
      })
      throw error
    }
  },

  updateTask: async (id: string, taskData: UpdateTaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTask = await taskService.updateTask(id, taskData)
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task',
        isLoading: false 
      })
      throw error
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await taskService.deleteTask(id)
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete task',
        isLoading: false 
      })
      throw error
    }
  },

  getTaskById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const task = await taskService.getTaskById(id)
      set({ selectedTask: task, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch task',
        isLoading: false 
      })
    }
  },

  setSelectedTask: (task: Task | null) => {
    set({ selectedTask: task })
  },

  setFilters: (filters: TaskFilters) => {
    set({ filters })
  },

  clearError: () => set({ error: null }),

  // Utility actions
  moveTaskToStatus: async (id: string, status: 'todo' | 'in_progress' | 'in_review' | 'done') => {
    try {
      const updatedTask = await taskService.moveTaskToStatus(id, status)
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task status'
      })
      throw error
    }
  },

  assignTask: async (id: string, assigneeId: string) => {
    try {
      const updatedTask = await taskService.assignTask(id, assigneeId)
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to assign task'
      })
      throw error
    }
  },

  unassignTask: async (id: string) => {
    try {
      const updatedTask = await taskService.unassignTask(id)
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to unassign task'
      })
      throw error
    }
  },

  updateTaskPriority: async (id: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      const updatedTask = await taskService.updateTaskPriority(id, priority)
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task priority'
      })
      throw error
    }
  }
}))