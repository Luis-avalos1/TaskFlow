import { Request, Response } from 'express'
import { pool } from '../config/database'
import { HTTP_STATUS } from '@taskflow/shared'
import { logger } from '../utils/logger'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { projectId, status, priority, assigneeId } = req.query
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    let query = `
      SELECT t.*, 
             p.name as project_name,
             assignee.first_name as assignee_first_name,
             assignee.last_name as assignee_last_name,
             assignee.username as assignee_username,
             assignee.email as assignee_email,
             reporter.first_name as reporter_first_name,
             reporter.last_name as reporter_last_name,
             reporter.username as reporter_username,
             reporter.email as reporter_email
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users assignee ON t.assignee_id = assignee.id
      LEFT JOIN users reporter ON t.reporter_id = reporter.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE (p.owner_id = $1 OR pm.user_id = $1)
    `
    
    const queryParams = [userId]
    let paramCount = 2

    if (projectId) {
      query += ` AND t.project_id = $${paramCount}`
      queryParams.push(projectId as string)
      paramCount++
    }

    if (status) {
      query += ` AND t.status = $${paramCount}`
      queryParams.push(status as string)
      paramCount++
    }

    if (priority) {
      query += ` AND t.priority = $${paramCount}`
      queryParams.push(priority as string)
      paramCount++
    }

    if (assigneeId) {
      query += ` AND t.assignee_id = $${paramCount}`
      queryParams.push(assigneeId as string)
      paramCount++
    }

    query += ` ORDER BY t.created_at DESC`
    
    const result = await pool.query(query, queryParams)
    
    const tasks = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      projectId: row.project_id,
      projectName: row.project_name,
      assigneeId: row.assignee_id,
      reporterId: row.reporter_id,
      dueDate: row.due_date,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      assignee: row.assignee_id ? {
        id: row.assignee_id,
        firstName: row.assignee_first_name,
        lastName: row.assignee_last_name,
        username: row.assignee_username,
        email: row.assignee_email
      } : null,
      reporter: {
        id: row.reporter_id,
        firstName: row.reporter_first_name,
        lastName: row.reporter_last_name,
        username: row.reporter_username,
        email: row.reporter_email
      }
    }))

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully'
    })
  } catch (error) {
    logger.error('Error fetching tasks:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch tasks'
    })
  }
}

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const { 
      title, 
      description, 
      status, 
      priority, 
      projectId, 
      assigneeId, 
      dueDate, 
      estimatedHours,
      tags 
    } = req.body

    // Validation
    if (!title || !projectId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Task title and project ID are required'
      })
    }

    // Check if user has permission to create tasks in this project
    const permissionQuery = `
      SELECT id FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)
    `
    const permissionResult = await pool.query(permissionQuery, [projectId, userId])
    
    if (permissionResult.rows.length === 0) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'No permission to create tasks in this project'
      })
    }

    // Validate assignee if provided
    if (assigneeId) {
      const assigneeQuery = `
        SELECT u.id FROM users u
        LEFT JOIN project_members pm ON u.id = pm.user_id
        LEFT JOIN projects p ON pm.project_id = p.id
        WHERE u.id = $1 AND (p.id = $2 OR p.owner_id = $1)
      `
      const assigneeResult = await pool.query(assigneeQuery, [assigneeId, projectId])
      
      if (assigneeResult.rows.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Assignee must be a member of the project'
        })
      }
    }

    const validStatuses = ['todo', 'in_progress', 'in_review', 'done']
    const validPriorities = ['low', 'medium', 'high', 'urgent']

    if (status && !validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid task status'
      })
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid task priority'
      })
    }

    // Insert task
    const query = `
      INSERT INTO tasks (
        title, description, status, priority, project_id, 
        assignee_id, reporter_id, due_date, estimated_hours, tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, title, description, status, priority, project_id, 
                assignee_id, reporter_id, due_date, estimated_hours, 
                actual_hours, tags, created_at, updated_at
    `
    
    const values = [
      title,
      description || null,
      status || 'todo',
      priority || 'medium',
      projectId,
      assigneeId || null,
      userId, // reporter_id
      dueDate || null,
      estimatedHours || null,
      tags || []
    ]

    const result = await pool.query(query, values)
    const task = result.rows[0]

    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.project_id,
      assigneeId: task.assignee_id,
      reporterId: task.reporter_id,
      dueDate: task.due_date,
      estimatedHours: task.estimated_hours,
      actualHours: task.actual_hours,
      tags: task.tags,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }

    logger.info(`Task created: ${task.title} by user ${userId}`)

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: formattedTask,
      message: 'Task created successfully'
    })
  } catch (error) {
    logger.error('Error creating task:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create task'
    })
  }
}

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const taskId = req.params.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const query = `
      SELECT t.*, 
             p.name as project_name,
             assignee.first_name as assignee_first_name,
             assignee.last_name as assignee_last_name,
             assignee.username as assignee_username,
             assignee.email as assignee_email,
             reporter.first_name as reporter_first_name,
             reporter.last_name as reporter_last_name,
             reporter.username as reporter_username,
             reporter.email as reporter_email
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users assignee ON t.assignee_id = assignee.id
      LEFT JOIN users reporter ON t.reporter_id = reporter.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE t.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)
    `
    
    const result = await pool.query(query, [taskId, userId])
    
    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Task not found or access denied'
      })
    }

    const row = result.rows[0]
    const task = {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      projectId: row.project_id,
      projectName: row.project_name,
      assigneeId: row.assignee_id,
      reporterId: row.reporter_id,
      dueDate: row.due_date,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      assignee: row.assignee_id ? {
        id: row.assignee_id,
        firstName: row.assignee_first_name,
        lastName: row.assignee_last_name,
        username: row.assignee_username,
        email: row.assignee_email
      } : null,
      reporter: {
        id: row.reporter_id,
        firstName: row.reporter_first_name,
        lastName: row.reporter_last_name,
        username: row.reporter_username,
        email: row.reporter_email
      }
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: task,
      message: 'Task retrieved successfully'
    })
  } catch (error) {
    logger.error('Error fetching task:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch task'
    })
  }
}

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const taskId = req.params.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const { 
      title, 
      description, 
      status, 
      priority, 
      assigneeId, 
      dueDate, 
      estimatedHours,
      actualHours,
      tags 
    } = req.body

    // Check if user has permission to update this task
    const permissionQuery = `
      SELECT t.id, t.project_id FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE t.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2 OR t.assignee_id = $2)
    `
    const permissionResult = await pool.query(permissionQuery, [taskId, userId])
    
    if (permissionResult.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Task not found or access denied'
      })
    }

    const task = permissionResult.rows[0]

    // Validate assignee if provided
    if (assigneeId) {
      const assigneeQuery = `
        SELECT u.id FROM users u
        LEFT JOIN project_members pm ON u.id = pm.user_id
        LEFT JOIN projects p ON pm.project_id = p.id
        WHERE u.id = $1 AND (p.id = $2 OR p.owner_id = $1)
      `
      const assigneeResult = await pool.query(assigneeQuery, [assigneeId, task.project_id])
      
      if (assigneeResult.rows.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Assignee must be a member of the project'
        })
      }
    }

    const validStatuses = ['todo', 'in_progress', 'in_review', 'done']
    const validPriorities = ['low', 'medium', 'high', 'urgent']

    if (status && !validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid task status'
      })
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid task priority'
      })
    }

    // Build update query dynamically
    const updateFields = []
    const values = []
    let paramCount = 1

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`)
      values.push(title)
      paramCount++
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`)
      values.push(description)
      paramCount++
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`)
      values.push(status)
      paramCount++
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount}`)
      values.push(priority)
      paramCount++
    }
    if (assigneeId !== undefined) {
      updateFields.push(`assignee_id = $${paramCount}`)
      values.push(assigneeId)
      paramCount++
    }
    if (dueDate !== undefined) {
      updateFields.push(`due_date = $${paramCount}`)
      values.push(dueDate || null)
      paramCount++
    }
    if (estimatedHours !== undefined) {
      updateFields.push(`estimated_hours = $${paramCount}`)
      values.push(estimatedHours)
      paramCount++
    }
    if (actualHours !== undefined) {
      updateFields.push(`actual_hours = $${paramCount}`)
      values.push(actualHours)
      paramCount++
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${paramCount}`)
      values.push(tags || [])
      paramCount++
    }

    if (updateFields.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No fields to update'
      })
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, status, priority, project_id, 
                assignee_id, reporter_id, due_date, estimated_hours, 
                actual_hours, tags, created_at, updated_at
    `
    
    values.push(taskId)

    const result = await pool.query(query, values)
    const updatedTask = result.rows[0]

    const formattedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      projectId: updatedTask.project_id,
      assigneeId: updatedTask.assignee_id,
      reporterId: updatedTask.reporter_id,
      dueDate: updatedTask.due_date,
      estimatedHours: updatedTask.estimated_hours,
      actualHours: updatedTask.actual_hours,
      tags: updatedTask.tags,
      createdAt: updatedTask.created_at,
      updatedAt: updatedTask.updated_at
    }

    logger.info(`Task updated: ${updatedTask.title} by user ${userId}`)

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: formattedTask,
      message: 'Task updated successfully'
    })
  } catch (error) {
    logger.error('Error updating task:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update task'
    })
  }
}

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const taskId = req.params.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    // Check if user has permission to delete this task
    const permissionQuery = `
      SELECT t.id FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1 AND (p.owner_id = $2 OR t.reporter_id = $2)
    `
    const permissionResult = await pool.query(permissionQuery, [taskId, userId])
    
    if (permissionResult.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Task not found or access denied'
      })
    }

    // Delete task
    const deleteQuery = `DELETE FROM tasks WHERE id = $1`
    await pool.query(deleteQuery, [taskId])

    logger.info(`Task deleted: ${taskId} by user ${userId}`)

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting task:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete task'
    })
  }
}