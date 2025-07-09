"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.HTTP_STATUS = exports.APP_CONFIG = exports.WS_EVENTS = exports.API_ENDPOINTS = void 0;
// API Constants
exports.API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',
        PROFILE: '/api/auth/profile'
    },
    USERS: {
        BASE: '/api/users',
        BY_ID: (id) => `/api/users/${id}`,
        SEARCH: '/api/users/search'
    },
    PROJECTS: {
        BASE: '/api/projects',
        BY_ID: (id) => `/api/projects/${id}`,
        MEMBERS: (id) => `/api/projects/${id}/members`,
        TASKS: (id) => `/api/projects/${id}/tasks`
    },
    TASKS: {
        BASE: '/api/tasks',
        BY_ID: (id) => `/api/tasks/${id}`,
        COMMENTS: (id) => `/api/tasks/${id}/comments`,
        ATTACHMENTS: (id) => `/api/tasks/${id}/attachments`
    }
};
// WebSocket Events
exports.WS_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    JOIN_PROJECT: 'join_project',
    LEAVE_PROJECT: 'leave_project',
    TASK_UPDATED: 'task_updated',
    USER_PRESENCE: 'user_presence',
    PROJECT_UPDATED: 'project_updated',
    NOTIFICATION: 'notification'
};
// Application Constants
exports.APP_CONFIG = {
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
};
// HTTP Status Codes
exports.HTTP_STATUS = {
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
};
// Error Messages
exports.ERROR_MESSAGES = {
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
};
//# sourceMappingURL=index.js.map