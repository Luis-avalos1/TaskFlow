# Node.js Backend Documentation

## Overview
This document explains the Node.js backend implementation for TaskFlow, including the API architecture, authentication system, database integration, and real-time features.

## Technology Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type safety for server-side code
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage (optional)
- **Socket.io** - Real-time WebSocket communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Joi** - Request validation
- **Winston** - Logging

## Project Structure

```
server/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.ts      # Database connection
│   ├── controllers/         # Request handlers
│   │   └── authController.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # Authentication middleware
│   │   └── errorHandler.ts  # Error handling
│   ├── models/              # Database models (to be implemented)
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── projectRoutes.ts
│   │   └── taskRoutes.ts
│   ├── services/            # Business logic
│   │   └── authService.ts
│   ├── socket/              # WebSocket handlers
│   │   └── socketHandlers.ts
│   ├── utils/               # Utility functions
│   │   └── logger.ts
│   └── index.ts             # Application entry point
├── logs/                    # Log files
├── .env.example            # Environment variables template
├── Dockerfile              # Docker container configuration
└── package.json            # Dependencies and scripts
```

## Key Features

### 1. Authentication System
**Location**: `src/services/authService.ts`, `src/controllers/authController.ts`

**Features**:
- User registration with email/password
- JWT token-based authentication
- Refresh token mechanism
- Password hashing with bcrypt
- Role-based access control

**Flow**:
```typescript
// Registration flow
1. Validate input data
2. Check if user exists
3. Hash password
4. Create user in database
5. Generate JWT tokens
6. Return user data and tokens

// Login flow
1. Validate credentials
2. Find user by email
3. Verify password
4. Generate JWT tokens
5. Return user data and tokens
```

### 2. Database Integration
**Location**: `src/config/database.ts`

**Features**:
- PostgreSQL connection with connection pooling
- Automatic table creation
- Database migrations (schema in database.ts)
- Proper indexing for performance

**Schema**:
- **users** - User accounts and profiles
- **projects** - Project information
- **project_members** - Project team memberships
- **tasks** - Individual work items
- **task_comments** - Task discussions

### 3. API Routes
**Location**: `src/routes/`

**Authentication Routes** (`/api/auth`):
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Token refresh
- `POST /logout` - User logout
- `GET /profile` - Get user profile

**User Routes** (`/api/users`):
- `GET /` - List users
- `GET /:id` - Get user by ID

**Project Routes** (`/api/projects`):
- `GET /` - List projects
- `POST /` - Create project
- `GET /:id` - Get project details

**Task Routes** (`/api/tasks`):
- `GET /` - List tasks
- `POST /` - Create task
- `GET /:id` - Get task details

### 4. Middleware
**Location**: `src/middleware/`

**Authentication Middleware**:
- JWT token validation
- User authentication
- Role-based authorization

**Error Handling Middleware**:
- Centralized error handling
- Proper HTTP status codes
- Development vs production error responses

**Security Middleware**:
- Helmet for security headers
- CORS configuration
- Rate limiting
- Request validation

### 5. Real-time Features
**Location**: `src/socket/socketHandlers.ts`

**Features**:
- WebSocket authentication
- Project-based room system
- User presence tracking
- Real-time task updates

**Socket Events**:
- `connection` - User connects
- `join_project` - Join project room
- `leave_project` - Leave project room
- `user_presence` - User online/offline status
- `task_updated` - Task modification notifications

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'member',
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  project_id UUID REFERENCES projects(id),
  assignee_id UUID REFERENCES users(id),
  reporter_id UUID REFERENCES users(id),
  due_date TIMESTAMP,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Implementation

### 1. Authentication
- JWT tokens with expiration
- Refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Account activation status

### 2. Authorization
- Role-based access control
- Resource-level permissions
- Route protection middleware

### 3. Input Validation
- Joi schema validation
- SQL injection prevention
- XSS protection

### 4. Security Headers
- Helmet middleware
- CORS configuration
- Rate limiting

## Error Handling

### Custom Error Classes
```typescript
export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}
```

### Error Handling Middleware
- Centralized error processing
- Proper HTTP status codes
- Development vs production responses
- Error logging

## Logging

### Winston Logger Configuration
- Multiple log levels
- File and console transports
- Structured logging
- Error stack traces

### Log Levels
- `error` - Error messages
- `warn` - Warning messages
- `info` - General information
- `debug` - Debug information

## Environment Configuration

### Required Environment Variables
```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Client
CLIENT_URL=http://localhost:3000
```

## Development Workflow

### Starting Development
```bash
cd server
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

## API Documentation

### Response Format
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}
```

### Authentication Endpoints

**POST /api/auth/register**
```typescript
Request: {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
}

Response: {
  user: User
  tokens: AuthTokens
}
```

**POST /api/auth/login**
```typescript
Request: {
  email: string
  password: string
}

Response: {
  user: User
  tokens: AuthTokens
}
```

## Performance Optimizations

1. **Database Connection Pooling**: Efficient connection management
2. **Query Optimization**: Proper indexing and query structure
3. **Caching**: Redis for session and frequently accessed data
4. **Compression**: gzip compression for responses
5. **Rate Limiting**: Prevent abuse and DoS attacks

## Integration Points

### With Frontend
- RESTful API endpoints
- WebSocket communication
- JWT token authentication

### With Database
- PostgreSQL with connection pooling
- Transaction support
- Query optimization

### With Shared Package
- TypeScript types for consistency
- Shared constants and utilities
- API endpoint definitions

## Architecture Decisions

- **Express.js**: Mature and flexible web framework
- **PostgreSQL**: Robust relational database
- **JWT**: Stateless authentication
- **Socket.io**: Real-time communication
- **Winston**: Comprehensive logging
- **Joi**: Schema validation
- **bcryptjs**: Secure password hashing