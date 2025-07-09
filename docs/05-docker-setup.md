# Docker Setup Documentation

## Overview
This document explains the Docker containerization setup for TaskFlow, including development and production configurations, service orchestration, and deployment strategies.

## Docker Architecture

The TaskFlow application is containerized using Docker Compose with the following services:
- **PostgreSQL** - Database service
- **Redis** - Caching service (optional)
- **Server** - Node.js backend API
- **Client** - React frontend application

## Service Configuration

### 1. PostgreSQL Database
**Container**: `taskflow-postgres`
**Image**: `postgres:15-alpine`
**Port**: `5432`

**Features**:
- Persistent data storage
- Automatic database initialization
- Environment-based configuration

**Volume Mounts**:
- `postgres_data:/var/lib/postgresql/data` - Data persistence
- `./server/init.sql:/docker-entrypoint-initdb.d/init.sql` - Initialization script

### 2. Redis Cache
**Container**: `taskflow-redis`
**Image**: `redis:7-alpine`
**Port**: `6379`

**Features**:
- In-memory caching
- Session storage
- Data persistence with RDB snapshots

### 3. Backend Server
**Container**: `taskflow-server`
**Build Context**: `./server`
**Port**: `5000`

**Features**:
- Node.js/Express application
- TypeScript compilation
- Hot reload in development
- Health check endpoint

**Dependencies**:
- PostgreSQL (database)
- Redis (caching)

### 4. Frontend Client
**Container**: `taskflow-client`
**Build Context**: `./client`
**Port**: `3000`

**Features**:
- React/Vite development server
- Hot module replacement
- Proxy configuration for API calls

**Dependencies**:
- Server (API endpoints)

## File Structure

```
TaskFlow/
├── docker-compose.yml       # Service orchestration
├── Makefile                # Development commands
├── server/
│   ├── Dockerfile          # Server container
│   └── .dockerignore       # Server ignore patterns
├── client/
│   ├── Dockerfile          # Client container
│   └── .dockerignore       # Client ignore patterns
└── docs/
    └── 05-docker-setup.md  # This document
```

## Development Workflow

### Starting the Application
```bash
# Using Docker Compose
docker-compose up

# Using Makefile
make up

# Start specific services
docker-compose up postgres redis
```

### Stopping the Application
```bash
# Stop all services
docker-compose down

# Using Makefile
make down

# Stop and remove volumes
make clean
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server

# Using Makefile
make logs
```

### Development Commands
```bash
# Install dependencies
make install

# Start development (without Docker)
make dev

# Build all packages
make build

# Run tests
make test

# Reset database
make db-reset
```

## Container Configurations

### Server Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy and build application
COPY . .
RUN npm run build

# Security: non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000
CMD ["npm", "start"]
```

### Client Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Security: non-root user
USER nodejs

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## Environment Configuration

### Docker Compose Environment Variables

**PostgreSQL**:
```yaml
environment:
  POSTGRES_DB: taskflow
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: password
```

**Server**:
```yaml
environment:
  - NODE_ENV=development
  - DB_HOST=postgres
  - DB_PORT=5432
  - JWT_SECRET=your-secret-key
  - CLIENT_URL=http://localhost:3000
```

**Client**:
```yaml
environment:
  - VITE_API_URL=http://localhost:5000
```

## Networking

### Docker Network
- **Network Name**: `taskflow-network`
- **Driver**: `bridge`
- **Internal Communication**: Services communicate using container names

### Port Mapping
- **Client**: `3000:3000` - Frontend application
- **Server**: `5000:5000` - Backend API
- **PostgreSQL**: `5432:5432` - Database connection
- **Redis**: `6379:6379` - Cache connection

## Data Persistence

### Volumes
- **postgres_data** - PostgreSQL data persistence
- **redis_data** - Redis data persistence

### Development Volumes
- **Server**: `./server:/app` - Live code updates
- **Client**: `./client:/app` - Hot module replacement
- **Node Modules**: `/app/node_modules` - Prevent host/container conflicts

## Health Checks

### Server Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
```

### Health Endpoint
```typescript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  })
})
```

## Security Considerations

### 1. Non-Root User
```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### 2. .dockerignore Files
- Exclude sensitive files
- Reduce image size
- Prevent unwanted file copying

### 3. Environment Variables
- Use environment variables for secrets
- Never commit secrets to Docker images
- Use Docker secrets in production

## Production Deployment

### Multi-Stage Builds
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
USER nodejs
CMD ["node", "dist/index.js"]
```

### Production Considerations
1. **Environment Variables**: Use proper secrets management
2. **SSL/TLS**: Configure HTTPS with reverse proxy
3. **Load Balancing**: Multiple container instances
4. **Monitoring**: Container health and metrics
5. **Logging**: Centralized log aggregation

## Troubleshooting

### Common Issues

**1. Port Conflicts**
```bash
# Check port usage
lsof -i :3000
lsof -i :5000

# Kill processes using ports
kill -9 $(lsof -t -i:3000)
```

**2. Database Connection Issues**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d taskflow
```

**3. Volume Permission Issues**
```bash
# Fix ownership
docker-compose exec server chown -R nodejs:nodejs /app
```

**4. Clean Start**
```bash
# Remove all containers and volumes
make clean

# Rebuild images
docker-compose build --no-cache
```

### Debug Commands
```bash
# Enter container shell
docker-compose exec server sh
docker-compose exec client sh

# View container details
docker inspect taskflow-server

# Check container resources
docker stats
```

## Development Best Practices

1. **Layer Caching**: Order Dockerfile commands for optimal caching
2. **Image Size**: Use Alpine images and multi-stage builds
3. **Security**: Always use non-root users
4. **Environment**: Use .env files for local development
5. **Volumes**: Mount source code for development, exclude node_modules

## Makefile Commands

The included Makefile provides convenient development commands:

```bash
make help        # Show available commands
make install     # Install all dependencies
make dev         # Start development servers
make up          # Start Docker containers
make down        # Stop Docker containers
make clean       # Clean containers and volumes
make logs        # View container logs
make test        # Run tests
make db-reset    # Reset database
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Build and test
  run: |
    docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
    docker-compose -f docker-compose.test.yml down

- name: Build production images
  run: |
    docker build -t taskflow-server ./server
    docker build -t taskflow-client ./client
```

## Architecture Benefits

1. **Consistency**: Same environment across development and production
2. **Isolation**: Services run in isolated containers
3. **Scalability**: Easy to scale individual services
4. **Portability**: Runs on any Docker-compatible system
5. **Development Speed**: Quick setup and teardown