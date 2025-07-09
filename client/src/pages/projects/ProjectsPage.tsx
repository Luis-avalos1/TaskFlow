import React, { useState, useEffect } from 'react'
import { useProjectStore } from '../../store/projectStore'
import { CreateProjectForm, ProjectFormData } from '../../components/projects/CreateProjectForm'
import { Project } from '../../services/projectService'

export const ProjectsPage: React.FC = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const { projects, isLoading, error, fetchProjects, createProject, clearError } = useProjectStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreateProject = async (projectData: ProjectFormData) => {
    try {
      await createProject({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        startDate: projectData.startDate || undefined,
        endDate: projectData.endDate || undefined,
      })
      setIsCreateFormOpen(false)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600">
          Manage your projects and track their progress.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsCreateFormOpen(true)}
            className="btn btn-primary btn-default"
            disabled={isLoading}
          >
            Create New Project
          </button>
          <button 
            onClick={() => {
              const authData = localStorage.getItem('auth-storage')
              console.log('Raw Auth Storage:', authData)
              if (authData) {
                const parsed = JSON.parse(authData)
                console.log('Parsed Auth Storage:', parsed)
                console.log('User:', parsed.state?.user)
                console.log('Tokens:', parsed.state?.tokens)
                console.log('Access Token:', parsed.state?.tokens?.accessToken)
              }
            }}
            className="btn btn-outline btn-default"
          >
            Debug Auth
          </button>
        </div>
      </div>

      {isLoading && projects.length === 0 ? (
        <div className="card">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="card">
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12l-4 4m0 0l4 4m-4-4h12.5M9 20l6-6v12" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateFormOpen(true)}
                className="btn btn-primary btn-default"
              >
                Create New Project
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <div key={project.id} className="card">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {project.description}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Start Date:</span>
                    <span className="text-gray-900">{formatDate(project.startDate || '')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">End Date:</span>
                    <span className="text-gray-900">{formatDate(project.endDate || '')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">{formatDate(project.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    onClick={() => window.location.href = `/projects/${project.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}