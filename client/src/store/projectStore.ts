import { create } from 'zustand'
import { projectService, Project, CreateProjectRequest } from '../services/projectService'

interface ProjectStore {
  projects: Project[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchProjects: () => Promise<void>
  createProject: (projectData: CreateProjectRequest) => Promise<void>
  updateProject: (id: string, projectData: Partial<CreateProjectRequest>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  clearError: () => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const projects = await projectService.getProjects()
      set({ projects, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false 
      })
    }
  },

  createProject: async (projectData: CreateProjectRequest) => {
    set({ isLoading: true, error: null })
    try {
      const newProject = await projectService.createProject(projectData)
      set(state => ({ 
        projects: [...state.projects, newProject],
        isLoading: false 
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false 
      })
      throw error // Re-throw so component can handle it
    }
  },

  updateProject: async (id: string, projectData: Partial<CreateProjectRequest>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedProject = await projectService.updateProject(id, projectData)
      set(state => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update project',
        isLoading: false 
      })
      throw error
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await projectService.deleteProject(id)
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false 
      })
      throw error
    }
  },

  clearError: () => set({ error: null })
}))