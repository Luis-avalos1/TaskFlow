import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { HTTP_STATUS } from '@taskflow/shared'

const router = Router()

// Apply authentication to all user routes
router.use(authenticate)

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: [],
    message: 'Users endpoint - to be implemented'
  })
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: null,
    message: 'Get user by ID endpoint - to be implemented'
  })
}))

export { router as userRoutes }