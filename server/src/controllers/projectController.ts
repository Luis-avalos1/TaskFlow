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

export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const query = `
      SELECT p.*, 
             u.first_name as owner_first_name,
             u.last_name as owner_last_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.owner_id = $1
      ORDER BY p.created_at DESC
    `
    
    const result = await pool.query(query, [userId])
    
    const projects = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      owner: {
        firstName: row.owner_first_name,
        lastName: row.owner_last_name
      }
    }))

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: projects,
      message: 'Projects retrieved successfully'
    })
  } catch (error) {
    logger.error('Error fetching projects:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch projects'
    })
  }
}

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const { name, description, status, startDate, endDate } = req.body

    // Validation
    if (!name || !description) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Project name and description are required'
      })
    }

    if (name.length > 100) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Project name must be less than 100 characters'
      })
    }

    const validStatuses = ['planning', 'active', 'on_hold', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid project status'
      })
    }

    // Insert project
    const query = `
      INSERT INTO projects (name, description, status, start_date, end_date, owner_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, description, status, start_date, end_date, owner_id, created_at, updated_at
    `
    
    const values = [
      name,
      description,
      status || 'planning',
      startDate || null,
      endDate || null,
      userId
    ]

    const result = await pool.query(query, values)
    const project = result.rows[0]

    // Also add the user as a project member with owner role
    const memberQuery = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, 'owner')
    `
    await pool.query(memberQuery, [project.id, userId])

    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      ownerId: project.owner_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }

    logger.info(`Project created: ${project.name} by user ${userId}`)

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: formattedProject,
      message: 'Project created successfully'
    })
  } catch (error) {
    logger.error('Error creating project:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create project'
    })
  }
}

export const getProjectById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const projectId = req.params.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const query = `
      SELECT p.*, 
             u.first_name as owner_first_name,
             u.last_name as owner_last_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)
    `
    
    const result = await pool.query(query, [projectId, userId])
    
    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Project not found or access denied'
      })
    }

    const row = result.rows[0]
    const project = {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      owner: {
        firstName: row.owner_first_name,
        lastName: row.owner_last_name
      }
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: project,
      message: 'Project retrieved successfully'
    })
  } catch (error) {
    logger.error('Error fetching project:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch project'
    })
  }
}

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const projectId = req.params.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const { name, description, status, startDate, endDate } = req.body

    // Check if user has permission to update this project
    const permissionQuery = `
      SELECT id FROM projects 
      WHERE id = $1 AND owner_id = $2
    `
    const permissionResult = await pool.query(permissionQuery, [projectId, userId])
    
    if (permissionResult.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Project not found or access denied'
      })
    }

    // Validation
    if (name && name.length > 100) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Project name must be less than 100 characters'
      })
    }

    const validStatuses = ['planning', 'active', 'on_hold', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid project status'
      })
    }

    // Build update query dynamically
    const updateFields = []
    const values = []
    let paramCount = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`)
      values.push(name)
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
    if (startDate !== undefined) {
      updateFields.push(`start_date = $${paramCount}`)
      values.push(startDate || null)
      paramCount++
    }
    if (endDate !== undefined) {
      updateFields.push(`end_date = $${paramCount}`)
      values.push(endDate || null)
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
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, description, status, start_date, end_date, owner_id, created_at, updated_at
    `
    
    values.push(projectId)

    const result = await pool.query(query, values)
    const project = result.rows[0]

    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      ownerId: project.owner_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }

    logger.info(`Project updated: ${project.name} by user ${userId}`)

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: formattedProject,
      message: 'Project updated successfully'
    })
  } catch (error) {
    logger.error('Error updating project:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update project'
    })
  }
}

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const projectId = req.params.id
    
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    // Check if user has permission to delete this project
    const permissionQuery = `
      SELECT id FROM projects 
      WHERE id = $1 AND owner_id = $2
    `
    const permissionResult = await pool.query(permissionQuery, [projectId, userId])
    
    if (permissionResult.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Project not found or access denied'
      })
    }

    // Delete project (cascade will handle related records)
    const deleteQuery = `DELETE FROM projects WHERE id = $1`
    await pool.query(deleteQuery, [projectId])

    logger.info(`Project deleted: ${projectId} by user ${userId}`)

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting project:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete project'
    })
  }
}