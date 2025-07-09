# TaskFlow - Full-Stack Project Management Platform

A comprehensive project management platform built with modern web technologies, providing teams with powerful collaboration tools, real-time updates, and advanced project tracking capabilities.

## 🚀 Features

- **Real-time Collaboration** - WebSocket connections for live updates and user presence
- **Advanced Project Management** - Task creation, assignment, tracking with drag-and-drop boards
- **User Management** - Role-based access control (Admin, Manager, Member)
- **Search and Filtering** - PostgreSQL full-text search with advanced filtering
- **RESTful API** - Comprehensive API with rate limiting and security middleware
- **Responsive Design** - Mobile and desktop optimized interface

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for server state
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with Express and TypeScript
- **PostgreSQL** for primary database
- **Redis** for caching (optional)
- **Socket.io** for WebSocket communication
- **JWT** authentication with refresh tokens
- **Winston** for logging

### DevOps
- **Docker** containerization
- **Docker Compose** for development
- **GitHub Actions** for CI/CD (planned)
- **AWS** deployment ready (planned)

## 📁 Project Structure

```
TaskFlow/
├── client/          # React frontend application
├── server/          # Node.js backend application  
├── shared/          # Shared TypeScript types and utilities
├── docs/            # Comprehensive documentation
├── docker-compose.yml
├── Makefile
└── README.md
```

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if running without Docker)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd TaskFlow

# Start all services
make up

# Or using docker-compose directly
docker-compose up
```

### Manual Setup
```bash
# Install dependencies for all packages
make install

# Start development servers
make dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Project Foundation](docs/01-project-foundation.md)** - Project structure and monorepo setup
- **[TypeScript Setup](docs/02-typescript-setup.md)** - TypeScript configuration and shared types
- **[React Frontend](docs/03-react-frontend.md)** - Frontend architecture and components
- **[Node.js Backend](docs/04-nodejs-backend.md)** - Backend API and database design
- **[Docker Setup](docs/05-docker-setup.md)** - Containerization and deployment

## 🔧 Development Commands

```bash
# Docker commands
make up           # Start Docker containers
make down         # Stop Docker containers
make clean        # Clean containers and volumes
make logs         # View container logs

# Development commands
make install      # Install dependencies
make dev          # Start development servers
make build        # Build all packages
make test         # Run tests

# Database commands
make db-reset     # Reset database
```

## 🏗 Architecture

### Monorepo Structure
TaskFlow uses a monorepo architecture with npm workspaces:
- **Shared Types**: Common TypeScript definitions across frontend and backend
- **Independent Packages**: Each service can be developed and deployed independently
- **Consistent Tooling**: Shared linting, testing, and build configurations

### Authentication Flow
1. User registration/login with email and password
2. JWT tokens (access + refresh) returned
3. Automatic token refresh on expiration
4. Protected routes and API endpoints

### Real-time Features
- WebSocket connections for live updates
- Project-based room system
- User presence tracking
- Real-time task updates

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** with bcrypt
- **Rate Limiting** for API endpoints
- **Input Validation** with Joi schemas
- **CORS Configuration** for cross-origin requests
- **Security Headers** with Helmet middleware

## 🧪 Testing (Planned)

- **Unit Tests**: Jest for both frontend and backend
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Cypress for user journey testing
- **Test Coverage**: Target >80% coverage

## 📦 Deployment

### Docker Production
```bash
# Build production images
docker build -t taskflow-server ./server
docker build -t taskflow-client ./client

# Run with production environment
docker-compose -f docker-compose.prod.yml up
```

### Environment Variables
Copy `.env.example` files and configure:
- Database connection settings
- JWT secrets
- API URLs
- Third-party service keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper documentation
4. Ensure tests pass
5. Submit a pull request

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile

### Project Endpoints
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details

### Task Endpoints
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task

## 🐛 Troubleshooting

### Common Issues

**Port Conflicts**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5000

# Kill processes if needed
kill -9 $(lsof -t -i:3000)
```

**Database Connection**
```bash
# Check PostgreSQL container
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d taskflow
```

**Clean Restart**
```bash
# Reset everything
make clean
make up
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- PostgreSQL for the reliable database
- Docker for containerization
- All open-source contributors

---

For detailed implementation guides and architecture decisions, please refer to the documentation in the `docs/` directory.