# Project Foundation Documentation

## Overview
This document explains the foundational setup of TaskFlow, including the project structure, configuration files, and how they work together to create a scalable full-stack application.

## Project Structure

```
TaskFlow/
├── client/          # React frontend application
├── server/          # Node.js backend application  
├── shared/          # Shared utilities and types
├── docs/            # Project documentation
├── package.json     # Root package configuration
├── .gitignore       # Git ignore patterns
└── README.md        # Project overview
```

## Key Files and Their Purpose

### 1. Root package.json
**Location**: `/package.json`
**Purpose**: Monorepo configuration and workspace management

**Key Features**:
- **Workspaces**: Defines `client`, `server`, and `shared` as separate packages
- **Scripts**: Provides convenient commands to run multiple packages
- **Dependencies**: Includes `concurrently` for running multiple processes

**How it connects to the project**:
- Allows us to manage multiple packages (frontend, backend, shared) in one repository
- Enables running both client and server simultaneously with `npm run dev`
- Simplifies dependency management across the entire project

**Scripts breakdown**:
```json
{
  "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
  "build": "npm run client:build && npm run server:build",
  "test": "npm run client:test && npm run server:test"
}
```

### 2. .gitignore
**Location**: `/.gitignore`
**Purpose**: Prevents unnecessary files from being committed to version control

**Key Sections**:
- **Dependencies**: `node_modules/` - Contains all installed packages
- **Build files**: `/client/build`, `/server/dist` - Generated during build process
- **Environment variables**: `.env*` - Contains sensitive configuration
- **IDE files**: `.vscode/`, `.idea/` - Editor-specific configurations
- **OS files**: `.DS_Store` - Operating system generated files

**How it connects to the project**:
- Keeps repository clean and focused on source code
- Prevents sensitive information (environment variables) from being committed
- Reduces repository size by excluding generated files

### 3. Directory Structure
**Purpose**: Logical separation of concerns and scalability

**client/**: 
- Will contain React application with TypeScript
- Handles user interface and user experience
- Communicates with server via REST API and WebSockets

**server/**:
- Will contain Node.js/Express application
- Handles business logic, database operations, and API endpoints
- Manages authentication, authorization, and data validation

**shared/**:
- Contains TypeScript types and utilities used by both client and server
- Ensures consistency between frontend and backend
- Reduces code duplication

**docs/**:
- Contains comprehensive documentation for the project
- Explains architecture decisions and implementation details
- Provides guides for development and deployment

## Monorepo Benefits

1. **Code Sharing**: Easy to share types, utilities, and configurations between frontend and backend
2. **Consistent Tooling**: Same linting, testing, and build tools across all packages
3. **Atomic Changes**: Make changes to both frontend and backend in a single commit
4. **Simplified Deployment**: Single repository to manage and deploy

## Development Workflow

1. **Install dependencies**: `npm install` (installs for all workspaces)
2. **Start development**: `npm run dev` (runs both client and server)
3. **Build for production**: `npm run build` (builds both applications)
4. **Run tests**: `npm run test` (runs all test suites)

## Next Steps

This foundation enables us to:
- Add React frontend with TypeScript configuration
- Set up Node.js backend with Express and TypeScript
- Configure shared TypeScript types and utilities
- Add Docker containerization for consistent development environments
- Set up CI/CD pipelines for automated testing and deployment

## Architecture Decisions

- **Monorepo**: Chosen for easier code sharing and consistent tooling
- **Workspaces**: Enables independent package management while maintaining shared dependencies
- **TypeScript**: Will be used across all packages for type safety and better developer experience
- **Concurrently**: Allows running multiple development servers simultaneously