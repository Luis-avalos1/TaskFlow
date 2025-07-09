// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile'
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
    SEARCH: '/api/users/search'
  },
  PROJECTS: {
    BASE: '/api/projects',
    BY_ID: (id: string) => `/api/projects/${id}`,
    MEMBERS: (id: string) => `/api/projects/${id}/members`,
    TASKS: (id: string) => `/api/projects/${id}/tasks`
  },
  TASKS: {
    BASE: '/api/tasks',
    BY_ID: (id: string) => `/api/tasks/${id}`,
    COMMENTS: (id: string) => `/api/tasks/${id}/comments`,
    ATTACHMENTS: (id: string) => `/api/tasks/${id}/attachments`
  }
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_PROJECT: 'join_project',
  LEAVE_PROJECT: 'leave_project',
  TASK_UPDATED: 'task_updated',
  USER_PRESENCE: 'user_presence',
  PROJECT_UPDATED: 'project_updated',
  NOTIFICATION: 'notification'
} as const;

// Application Constants
export const APP_CONFIG = {
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_USERNAME_LENGTH: 50,
    MAX_PROJECT_NAME_LENGTH: 100,
    MAX_TASK_TITLE_LENGTH: 200
  },
  TIMEOUTS: {
    REQUEST_TIMEOUT: 30000,
    WEBSOCKET_TIMEOUT: 5000
  }
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    PASSWORDS_DONT_MATCH: 'Passwords do not match'
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    TOKEN_EXPIRED: 'Your session has expired. Please login again',
    ACCOUNT_DISABLED: 'Your account has been disabled'
  },
  GENERAL: {
    SERVER_ERROR: 'Something went wrong. Please try again later',
    NOT_FOUND: 'The requested resource was not found',
    NETWORK_ERROR: 'Network error. Please check your connection'
  }
} as const;