# React Frontend Documentation

## Overview
This document explains the React frontend implementation for TaskFlow, including the component architecture, state management, routing, and integration with the backend API.

## Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety throughout the application
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Query** - Server state management and caching
- **React Hook Form** - Form handling with validation
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time WebSocket communication

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layouts/         # Layout components
│   │   └── ui/              # Basic UI components
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── projects/        # Project management pages
│   │   ├── tasks/           # Task management pages
│   │   └── profile/         # User profile pages
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── store/               # State management
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Key Features

### 1. Authentication System
**Location**: `src/store/authStore.ts`, `src/pages/auth/`

**Features**:
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Persistent login state

**How it works**:
```typescript
// Auth store with Zustand
const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    login: async (email, password) => {
      const response = await authService.login({ email, password })
      set({ user: response.user, tokens: response.tokens })
    }
  })
))
```

### 2. Routing and Navigation
**Location**: `src/App.tsx`, `src/components/layouts/`

**Features**:
- Protected routes based on authentication
- Dynamic route rendering
- Clean navigation structure

**Route Structure**:
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/` - Dashboard (protected)
- `/projects` - Projects list (protected)
- `/projects/:id` - Project details (protected)
- `/tasks` - Tasks list (protected)
- `/profile` - User profile (protected)

### 3. State Management
**Location**: `src/store/`

**Zustand for Client State**:
- Authentication state
- UI state (modals, sidebar)
- User preferences

**React Query for Server State**:
- API data caching
- Background refetching
- Optimistic updates

### 4. Component Architecture
**Location**: `src/components/`

**Layout Components**:
- `AuthLayout` - Authentication pages wrapper
- `DashboardLayout` - Main application layout with sidebar

**UI Components**:
- `LoadingSpinner` - Reusable loading indicator
- Form components (to be implemented)
- Modal components (to be implemented)

### 5. API Integration
**Location**: `src/services/`

**Features**:
- Axios-based HTTP client
- Automatic token injection
- Request/response interceptors
- Error handling

**Example Service**:
```typescript
class AuthService {
  private api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
  })

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post('/api/auth/login', credentials)
    return response.data
  }
}
```

## Development Workflow

### Starting Development
```bash
cd client
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

### Environment Variables
Create `.env.local` in the client directory:
```
VITE_API_URL=http://localhost:5000
```

## Integration Points

### With Backend API
- Authentication endpoints
- Data fetching and mutations
- Real-time updates via WebSocket

### With Shared Package
- TypeScript types for API contracts
- Utility functions for validation
- Constants for API endpoints

## TypeScript Configuration

**Location**: `client/tsconfig.json`

**Key Features**:
- Path mapping for clean imports
- Strict type checking
- JSX support for React

**Path Aliases**:
- `@/*` - Maps to `src/*`
- `@shared/*` - Maps to `../shared/src/*`

## Styling with Tailwind CSS

**Configuration**: `client/tailwind.config.js`

**Features**:
- Custom color palette
- Component utility classes
- Responsive design utilities

**Custom CSS Classes**:
- `.btn` - Button base styles
- `.input` - Input field styles
- `.card` - Card container styles

## Performance Optimizations

1. **Code Splitting**: Vite handles automatic code splitting
2. **Lazy Loading**: Components loaded on demand
3. **React Query Caching**: Server state cached and synchronized
4. **Optimistic Updates**: UI updates before server confirmation

## Security Considerations

1. **Token Storage**: JWT tokens stored in localStorage with persistence
2. **Protected Routes**: Authentication required for sensitive pages
3. **Input Validation**: Form validation using React Hook Form
4. **XSS Prevention**: React's built-in XSS protection

## Testing Strategy (To be implemented)

1. **Unit Tests**: Component testing with Jest and React Testing Library
2. **Integration Tests**: API integration testing
3. **E2E Tests**: User journey testing with Cypress

## Future Enhancements

1. **Real-time Features**: WebSocket integration for live updates
2. **Progressive Web App**: PWA capabilities
3. **Offline Support**: Service worker for offline functionality
4. **Advanced UI Components**: Drag-and-drop, date pickers, etc.

## Architecture Decisions

- **React 18**: Chosen for concurrent features and performance
- **Vite**: Fast development server and build tool
- **Zustand**: Lightweight alternative to Redux
- **React Query**: Specialized for server state management
- **Tailwind CSS**: Utility-first approach for rapid development
- **TypeScript**: Type safety and developer experience