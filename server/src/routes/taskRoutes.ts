import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { 
  getTasks, 
  createTask, 
  getTaskById, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController'

const router = Router()

// Apply authentication to all task routes
router.use(authenticate)

router.get('/', asyncHandler(getTasks))
router.post('/', asyncHandler(createTask))
router.get('/:id', asyncHandler(getTaskById))
router.put('/:id', asyncHandler(updateTask))
router.delete('/:id', asyncHandler(deleteTask))

export { router as taskRoutes }