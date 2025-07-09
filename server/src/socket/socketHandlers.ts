import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'
import { WS_EVENTS } from '@taskflow/shared'

export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      
      if (!token) {
        throw new Error('No token provided')
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
      socket.data.userId = decoded.userId
      
      next()
    } catch (error) {
      logger.error('Socket authentication failed:', error)
      next(new Error('Authentication failed'))
    }
  })

  io.on(WS_EVENTS.CONNECTION, (socket) => {
    logger.info(`User connected: ${socket.data.userId}`)

    // Join user to their personal room
    socket.join(`user:${socket.data.userId}`)

    // Handle joining project rooms
    socket.on(WS_EVENTS.JOIN_PROJECT, (projectId: string) => {
      socket.join(`project:${projectId}`)
      logger.info(`User ${socket.data.userId} joined project ${projectId}`)
    })

    // Handle leaving project rooms
    socket.on(WS_EVENTS.LEAVE_PROJECT, (projectId: string) => {
      socket.leave(`project:${projectId}`)
      logger.info(`User ${socket.data.userId} left project ${projectId}`)
    })

    // Handle user presence
    socket.on(WS_EVENTS.USER_PRESENCE, (data) => {
      socket.broadcast.emit(WS_EVENTS.USER_PRESENCE, {
        userId: socket.data.userId,
        ...data
      })
    })

    // Handle disconnect
    socket.on(WS_EVENTS.DISCONNECT, () => {
      logger.info(`User disconnected: ${socket.data.userId}`)
      
      // Broadcast user offline status
      socket.broadcast.emit(WS_EVENTS.USER_PRESENCE, {
        userId: socket.data.userId,
        isOnline: false,
        lastSeen: new Date()
      })
    })
  })
}

// Helper function to emit to specific project
export const emitToProject = (io: Server, projectId: string, event: string, data: any): void => {
  io.to(`project:${projectId}`).emit(event, data)
}

// Helper function to emit to specific user
export const emitToUser = (io: Server, userId: string, event: string, data: any): void => {
  io.to(`user:${userId}`).emit(event, data)
}