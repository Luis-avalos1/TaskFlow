import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../store/projectStore'
import { useTaskStore } from '../../store/taskStore'
import { CreateTaskForm, TaskFormData } from '../../components/tasks/CreateTaskForm'
import { Task } from '../../services/taskService'

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isCreateTaskFormOpen, setIsCreateTaskFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'settings'>('tasks')
  
  const { projects } = useProjectStore()
  const { 
    tasks, 
    isLoading, 
    error, 
    fetchTasks, 
    createTask, 
    moveTaskToStatus,
    updateTaskPriority,
    clearError 
  } = useTaskStore()

  const project = projects.find(p => p.id === id)

  useEffect(() => {
    if (id) {
      fetchTasks({ projectId: id })
    }
  }, [id, fetchTasks])

  useEffect(() => {
    if (!project && projects.length > 0) {
      navigate('/projects')
    }
  }, [project, projects.length, navigate])

  const projectTasks = tasks.filter(task => task.projectId === id)

  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        projectId: id!,
        assigneeId: taskData.assigneeId || undefined,
        dueDate: taskData.dueDate || undefined,
        estimatedHours: typeof taskData.estimatedHours === 'number' ? taskData.estimatedHours : undefined,
        tags: taskData.tags,
      })
      setIsCreateTaskFormOpen(false)
    } catch (error) {
      // Error handled by store
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await moveTaskToStatus(taskId, newStatus as 'todo' | 'in_progress' | 'in_review' | 'done')
    } catch (error) {
      // Error handled by store
    }
  }

  const handlePriorityChange = async (taskId: string, newPriority: string) => {
    try {
      await updateTaskPriority(taskId, newPriority as 'low' | 'medium' | 'high' | 'urgent')
    } catch (error) {
      // Error handled by store
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  const getDateColor = (dateString: string) => {
    if (!dateString) return 'text-gray-500'
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-red-600'
    if (diffDays <= 1) return 'text-orange-600'
    if (diffDays <= 3) return 'text-yellow-600'
    return 'text-gray-500'
  }

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    todo: projectTasks.filter(task => task.status === 'todo'),
    in_progress: projectTasks.filter(task => task.status === 'in_progress'),
    in_review: projectTasks.filter(task => task.status === 'in_review'),
    done: projectTasks.filter(task => task.status === 'done')
  }

  // Calculate project progress
  const totalTasks = projectTasks.length
  const completedTasks = tasksByStatus.done.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (!project) {
    return (
      <div className="card">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center text-gray-500 hover:text-gray-700 mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
            <button
              onClick={() => setIsCreateTaskFormOpen(true)}
              className="btn btn-primary btn-default"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{tasksByStatus.in_progress.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{progressPercentage}%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'tasks', name: 'Tasks', icon: '✅' },
            { id: 'team', name: 'Team', icon: '👥' },
            { id: 'settings', name: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="text-sm text-gray-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="text-sm text-gray-900">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <p className="text-gray-600 text-sm">Activity feed coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
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

          {projectTasks.length === 0 ? (
            <div className="card">
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m6 0h6m-6 6v6m0 6v6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating the first task for this project.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateTaskFormOpen(true)}
                    className="btn btn-primary btn-default"
                  >
                    Create First Task
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Kanban Board View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* To Do Column */}
              <div className="card">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                    To Do ({tasksByStatus.todo.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3 min-h-[300px]">
                  {tasksByStatus.todo.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                      getDateColor={getDateColor}
                    />
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="card">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                    In Progress ({tasksByStatus.in_progress.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3 min-h-[300px]">
                  {tasksByStatus.in_progress.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                      getDateColor={getDateColor}
                    />
                  ))}
                </div>
              </div>

              {/* In Review Column */}
              <div className="card">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
                    In Review ({tasksByStatus.in_review.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3 min-h-[300px]">
                  {tasksByStatus.in_review.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                      getDateColor={getDateColor}
                    />
                  ))}
                </div>
              </div>

              {/* Done Column */}
              <div className="card">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                    Done ({tasksByStatus.done.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3 min-h-[300px]">
                  {tasksByStatus.done.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                      getDateColor={getDateColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
            <p className="text-gray-600">Team management features coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Settings</h3>
            <p className="text-gray-600">Project configuration options coming soon...</p>
          </div>
        </div>
      )}

      <CreateTaskForm
        isOpen={isCreateTaskFormOpen}
        onClose={() => setIsCreateTaskFormOpen(false)}
        onSubmit={handleCreateTask}
        defaultProjectId={id}
      />
    </div>
  )
}

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, newStatus: string) => void
  onPriorityChange: (taskId: string, newPriority: string) => void
  getPriorityColor: (priority: string) => string
  formatDate: (dateString: string) => string
  getDateColor: (dateString: string) => string
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onPriorityChange,
  getPriorityColor,
  formatDate,
  getDateColor
}) => {
  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
        <select
          value={task.priority}
          onChange={(e) => onPriorityChange(task.id, e.target.value)}
          className="text-xs border-0 bg-transparent p-0 focus:ring-0 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>
      
      {task.dueDate && (
        <p className={`text-xs ${getDateColor(task.dueDate)} mb-2`}>
          {formatDate(task.dueDate)}
        </p>
      )}
      
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-xs border border-gray-200 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
        </select>
        
        {task.assignee && (
          <span className="text-gray-500">
            {task.assignee.firstName} {task.assignee.lastName}
          </span>
        )}
      </div>
    </div>
  )
}