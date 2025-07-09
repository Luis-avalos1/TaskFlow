# TypeScript Configuration Documentation

## Overview
This document explains the TypeScript setup for TaskFlow, including the project references, shared types system, and how TypeScript enables type safety across the full-stack application.

## Project Structure

```
TaskFlow/
├── tsconfig.json           # Root TypeScript configuration
├── shared/
│   ├── package.json        # Shared package configuration
│   ├── tsconfig.json       # Shared TypeScript config
│   └── src/
│       ├── types/          # Shared type definitions
│       ├── utils/          # Shared utility functions
│       ├── constants/      # Shared constants
│       └── index.ts        # Main export file
├── client/                 # Will extend root config
└── server/                 # Will extend root config
```

## Key Files and Their Purpose

### 1. Root tsconfig.json
**Location**: `/tsconfig.json`
**Purpose**: Base TypeScript configuration for the entire project

**Key Features**:
- **Project References**: Links to client, server, and shared packages
- **Path Mapping**: Enables clean imports like `@shared/types`
- **Composite**: Allows incremental compilation across packages
- **Strict Mode**: Enforces type safety throughout the project

**Path Mapping Configuration**:
```json
{
  "paths": {
    "@shared/*": ["shared/src/*"],
    "@client/*": ["client/src/*"],
    "@server/*": ["server/src/*"]
  }
}
```

**How it connects to the project**:
- Provides consistent TypeScript settings across all packages
- Enables cross-package imports with clean syntax
- Supports incremental builds for better performance

### 2. Shared Package (/@taskflow/shared)
**Location**: `/shared/`
**Purpose**: Contains types, utilities, and constants used by both client and server

**Package Structure**:
- **types/**: Core entity types and interfaces
- **utils/**: Shared utility functions with type safety
- **constants/**: API endpoints, error messages, and configuration

**Key Benefits**:
- **Type Safety**: Ensures client and server use identical data structures
- **Code Reuse**: Shared utilities prevent duplication
- **Consistency**: API endpoints and constants defined once
- **Maintainability**: Single source of truth for shared logic

### 3. Core Type Definitions
**Location**: `/shared/src/types/index.ts`
**Purpose**: Defines the core data structures for the application

**Key Types**:
- **User**: User accounts with roles and permissions
- **Project**: Project management entities
- **Task**: Individual work items with status and priority
- **API Types**: Request/response structures
- **WebSocket Types**: Real-time communication messages

**Example Type Usage**:
```typescript
// Server endpoint
app.post('/api/tasks', (req: Request<CreateTaskRequest>, res: Response<Task>) => {
  // TypeScript knows the exact structure of req.body and res.json()
});

// Client component
const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  // TypeScript provides autocompletion and type checking
  return <div>{task.title}</div>;
};
```

### 4. Shared Utilities
**Location**: `/shared/src/utils/index.ts`
**Purpose**: Type-safe utility functions used across the application

**Key Functions**:
- **Date Utilities**: `formatDate`, `formatDateTime`, `isDatePast`
- **Validation**: `isValidEmail`, `isValidPassword`
- **String Utilities**: `truncateText`, `slugify`
- **Array Utilities**: `unique`, `groupBy`

**Benefits**:
- **Consistency**: Same formatting logic on client and server
- **Type Safety**: Utilities have proper TypeScript signatures
- **Testing**: Shared utilities can be tested once

### 5. Constants and Configuration
**Location**: `/shared/src/constants/index.ts`
**Purpose**: Centralized configuration and constants

**Key Constants**:
- **API_ENDPOINTS**: All API route definitions
- **WS_EVENTS**: WebSocket event names
- **APP_CONFIG**: Application settings and limits
- **ERROR_MESSAGES**: Standardized error messages

**Benefits**:
- **Single Source of Truth**: API endpoints defined once
- **Type Safety**: Constants are properly typed
- **Maintainability**: Easy to update across entire application

## TypeScript Project References

The project uses TypeScript's project references feature for:
- **Incremental Compilation**: Only rebuild changed packages
- **Dependency Management**: Enforces proper package dependencies
- **Type Checking**: Cross-package type checking
- **IDE Support**: Better IntelliSense and navigation

## Development Workflow

### Building the Shared Package
```bash
cd shared
npm run build    # Compile TypeScript to JavaScript
npm run dev      # Watch mode for development
```

### Using Shared Types in Other Packages
```typescript
// In client or server code
import { User, Task, ApiResponse } from '@shared/types';
import { formatDate, isValidEmail } from '@shared/utils';
import { API_ENDPOINTS } from '@shared/constants';
```

## Type Safety Benefits

1. **Compile-Time Error Detection**: Catch errors before runtime
2. **API Contract Enforcement**: Client and server must match interfaces
3. **Refactoring Safety**: Rename types across entire codebase
4. **Documentation**: Types serve as living documentation
5. **IDE Support**: Autocompletion and inline documentation

## Integration Points

### With Client (React)
- Component props use shared types
- API calls use shared request/response types
- WebSocket messages use shared event types

### With Server (Node.js/Express)
- Route handlers use shared types for requests/responses
- Database models map to shared entity types
- WebSocket handlers use shared message types

### With Database
- Database schemas match shared type definitions
- ORM models use shared types for type safety
- Migration scripts ensure data structure consistency

## Architecture Decisions

- **Shared Package**: Chosen for type consistency across full-stack
- **Project References**: Enables efficient compilation and type checking
- **Path Mapping**: Provides clean import syntax
- **Strict Mode**: Ensures maximum type safety
- **Composite Build**: Supports incremental builds for better performance

## Next Steps

This TypeScript foundation enables:
- Setting up React frontend with full type safety
- Creating Node.js backend with typed APIs
- Implementing WebSocket communication with typed messages
- Building database layer with type-safe queries
- Adding comprehensive testing with type support