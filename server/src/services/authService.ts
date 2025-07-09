import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database'
import { createError } from '../middleware/errorHandler'
import { User, UserRole, AuthTokens } from '@taskflow/shared'
import { HTTP_STATUS } from '@taskflow/shared'

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
  private readonly ACCESS_TOKEN_EXPIRY = '15m'
  private readonly REFRESH_TOKEN_EXPIRY = '7d'

  async register(userData: {
    email: string
    password: string
    username: string
    firstName: string
    lastName: string
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, username, firstName, lastName } = userData

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    )

    if (existingUser.rows.length > 0) {
      throw createError('User already exists', HTTP_STATUS.CONFLICT)
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, username, first_name, last_name, role, avatar, is_active, created_at, updated_at`,
      [email, username, passwordHash, firstName, lastName, UserRole.MEMBER]
    )

    const user = this.mapDbUserToUser(result.rows[0])
    const tokens = this.generateTokens(user.id)

    return { user, tokens }
  }

  async login(credentials: {
    email: string
    password: string
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = credentials

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      throw createError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED)
    }

    const dbUser = result.rows[0]

    // Check if account is active
    if (!dbUser.is_active) {
      throw createError('Account is deactivated', HTTP_STATUS.UNAUTHORIZED)
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, dbUser.password_hash)
    
    if (!isPasswordValid) {
      throw createError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED)
    }

    const user = this.mapDbUserToUser(dbUser)
    const tokens = this.generateTokens(user.id)

    return { user, tokens }
  }

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { userId: string }
      
      // Verify user still exists and is active
      const result = await pool.query(
        'SELECT id, is_active FROM users WHERE id = $1',
        [decoded.userId]
      )

      if (result.rows.length === 0 || !result.rows[0].is_active) {
        throw createError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED)
      }

      const tokens = this.generateTokens(decoded.userId)
      return { tokens }
    } catch (error) {
      throw createError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED)
    }
  }

  private generateTokens(userId: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    )

    const refreshToken = jwt.sign(
      { userId },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    )

    return { accessToken, refreshToken }
  }

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      role: dbUser.role as UserRole,
      avatar: dbUser.avatar,
      isActive: dbUser.is_active,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    }
  }
}

export const authService = new AuthService()