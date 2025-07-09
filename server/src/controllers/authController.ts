import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { authService } from '../services/authService'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { HTTP_STATUS } from '@taskflow/shared'

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  username: Joi.string().min(3).max(50).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = registerSchema.validate(req.body)
  
  if (error) {
    throw createError(error.details[0].message, HTTP_STATUS.BAD_REQUEST)
  }

  const result = await authService.register(value)
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: result,
    message: 'User registered successfully'
  })
})

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = loginSchema.validate(req.body)
  
  if (error) {
    throw createError(error.details[0].message, HTTP_STATUS.BAD_REQUEST)
  }

  const result = await authService.login(value)
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
    message: 'Login successful'
  })
})

export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body
  
  if (!refreshToken) {
    throw createError('Refresh token is required', HTTP_STATUS.BAD_REQUEST)
  }

  const result = await authService.refreshToken(refreshToken)
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
    message: 'Token refreshed successfully'
  })
})

export const logout = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // In a real application, you would invalidate the refresh token here
  // For now, we'll just return success
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logout successful'
  })
})

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw createError('User not found', HTTP_STATUS.UNAUTHORIZED)
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: req.user,
    message: 'Profile retrieved successfully'
  })
})