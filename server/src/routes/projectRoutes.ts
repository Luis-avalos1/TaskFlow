import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { 
  getProjects, 
  createProject, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from '../controllers/projectController'

const router = Router()

// Apply authentication to all project routes
router.use(authenticate)

router.get('/', asyncHandler(getProjects))
router.post('/', asyncHandler(createProject))
router.get('/:id', asyncHandler(getProjectById))
router.put('/:id', asyncHandler(updateProject))
router.delete('/:id', asyncHandler(deleteProject))

export { router as projectRoutes }