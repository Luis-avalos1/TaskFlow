import React, { useState, useEffect } from 'react'
import { useTaskStore } from '../../store/taskStore'
import { useProjectStore } from '../../store/projectStore'
import { CreateTaskForm, TaskFormData } from '../../components/tasks/CreateTaskForm'
import { Task } from '../../services/taskService'

export const TasksPage: React.FC = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  
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
  
  const { projects, fetchProjects } = useProjectStore()

  useEffect(() => {
    fetchTasks()
    if (projects.length === 0) {
      fetchProjects()
    }
  }, [fetchTasks, fetchProjects, projects.length])

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    if (statusFilter && task.status !== statusFilter) return false
    if (priorityFilter && task.priority !== priorityFilter) return false
    if (projectFilter && task.projectId !== projectFilter) return false
    return true
  })

  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        projectId: taskData.projectId,
        assigneeId: taskData.assigneeId || undefined,
        dueDate: taskData.dueDate || undefined,
        estimatedHours: typeof taskData.estimatedHours === 'number' ? taskData.estimatedHours : undefined,
        tags: taskData.tags,
      })
      setIsCreateFormOpen(false)
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
    todo: filteredTasks.filter(task => task.status === 'todo'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    in_review: filteredTasks.filter(task => task.status === 'in_review'),
    done: filteredTasks.filter(task => task.status === 'done')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600">
          View and manage your tasks across all projects.
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

      {/* Header Actions */}
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={() => setIsCreateFormOpen(true)}
          className="btn btn-primary btn-default"
          disabled={isLoading}
        >
          Create New Task
        </button>

        {/* Filters */}
        <div className="flex space-x-3">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="input"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {isLoading && tasks.length === 0 ? (
        <div className="card">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card">
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m6 0h6m-6 6v6m0 6v6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateFormOpen(true)}
                className="btn btn-primary btn-default"
              >
                Create New Task
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
            <div className="p-4 space-y-3 min-h-[200px]">
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
            <div className="p-4 space-y-3 min-h-[200px]">
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
            <div className="p-4 space-y-3 min-h-[200px]">
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
            <div className="p-4 space-y-3 min-h-[200px]">
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

      <CreateTaskForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateTask}
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
    <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
        <div className="flex space-x-1">
          <select
            value={task.priority}
            onChange={(e) => onPriorityChange(task.id, e.target.value)}
            className="text-xs border-0 bg-transparent p-0 focus:ring-0"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
        
        {task.projectName && (
          <span className="text-xs text-gray-500 truncate ml-2">
            {task.projectName}
          </span>
        )}
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
          className="text-xs border border-gray-200 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500"
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