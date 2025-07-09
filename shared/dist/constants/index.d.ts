export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/api/auth/login";
        readonly REGISTER: "/api/auth/register";
        readonly REFRESH: "/api/auth/refresh";
        readonly LOGOUT: "/api/auth/logout";
        readonly PROFILE: "/api/auth/profile";
    };
    readonly USERS: {
        readonly BASE: "/api/users";
        readonly BY_ID: (id: string) => string;
        readonly SEARCH: "/api/users/search";
    };
    readonly PROJECTS: {
        readonly BASE: "/api/projects";
        readonly BY_ID: (id: string) => string;
        readonly MEMBERS: (id: string) => string;
        readonly TASKS: (id: string) => string;
    };
    readonly TASKS: {
        readonly BASE: "/api/tasks";
        readonly BY_ID: (id: string) => string;
        readonly COMMENTS: (id: string) => string;
        readonly ATTACHMENTS: (id: string) => string;
    };
};
export declare const WS_EVENTS: {
    readonly CONNECTION: "connection";
    readonly DISCONNECT: "disconnect";
    readonly JOIN_PROJECT: "join_project";
    readonly LEAVE_PROJECT: "leave_project";
    readonly TASK_UPDATED: "task_updated";
    readonly USER_PRESENCE: "user_presence";
    readonly PROJECT_UPDATED: "project_updated";
    readonly NOTIFICATION: "notification";
};
export declare const APP_CONFIG: {
    readonly PAGINATION: {
        readonly DEFAULT_LIMIT: 20;
        readonly MAX_LIMIT: 100;
    };
    readonly VALIDATION: {
        readonly MIN_PASSWORD_LENGTH: 8;
        readonly MAX_USERNAME_LENGTH: 50;
        readonly MAX_PROJECT_NAME_LENGTH: 100;
        readonly MAX_TASK_TITLE_LENGTH: 200;
    };
    readonly TIMEOUTS: {
        readonly REQUEST_TIMEOUT: 30000;
        readonly WEBSOCKET_TIMEOUT: 5000;
    };
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const ERROR_MESSAGES: {
    readonly VALIDATION: {
        readonly REQUIRED_FIELD: "This field is required";
        readonly INVALID_EMAIL: "Please enter a valid email address";
        readonly INVALID_PASSWORD: "Password must be at least 8 characters with uppercase, lowercase, and number";
        readonly PASSWORDS_DONT_MATCH: "Passwords do not match";
    };
    readonly AUTH: {
        readonly INVALID_CREDENTIALS: "Invalid email or password";
        readonly UNAUTHORIZED: "You are not authorized to perform this action";
        readonly TOKEN_EXPIRED: "Your session has expired. Please login again";
        readonly ACCOUNT_DISABLED: "Your account has been disabled";
    };
    readonly GENERAL: {
        readonly SERVER_ERROR: "Something went wrong. Please try again later";
        readonly NOT_FOUND: "The requested resource was not found";
        readonly NETWORK_ERROR: "Network error. Please check your connection";
    };
};
//# sourceMappingURL=index.d.ts.map