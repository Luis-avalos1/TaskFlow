import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database'
import { createError } from './errorHandler'
import { User, UserRole } from '@taskflow/shared'
import { HTTP_STATUS } from '@taskflow/shared'

export interface AuthRequest extends Request {
  user?: User
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', HTTP_STATUS.UNAUTHORIZED)
    }

    const token = authHeader.split(' ')[1]
    
    if (!token) {
      throw createError('No token provided', HTTP_STATUS.UNAUTHORIZED)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
    
    const result = await pool.query(
      'SELECT id, email, username, first_name, last_name, role, avatar, is_active, created_at, updated_at FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      throw createError('User not found', HTTP_STATUS.UNAUTHORIZED)
    }

    const user = result.rows[0]
    
    if (!user.is_active) {
      throw createError('Account is deactivated', HTTP_STATUS.UNAUTHORIZED)
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role as UserRole,
      avatar: user.avatar,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', HTTP_STATUS.UNAUTHORIZED)
    }

    if (!roles.includes(req.user.role)) {
      throw createError('Insufficient permissions', HTTP_STATUS.FORBIDDEN)
    }

    next()
  }
}