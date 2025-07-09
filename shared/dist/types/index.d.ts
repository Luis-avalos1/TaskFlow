export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    startDate: Date;
    endDate?: Date;
    ownerId: string;
    teamMembers: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    projectId: string;
    assigneeId?: string;
    reporterId: string;
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    MEMBER = "member"
}
export declare enum ProjectStatus {
    PLANNING = "planning",
    ACTIVE = "active",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    IN_REVIEW = "in_review",
    DONE = "done"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
}
export interface WebSocketMessage {
    type: string;
    payload: any;
    timestamp: Date;
}
export interface TaskUpdateMessage extends WebSocketMessage {
    type: 'task_updated';
    payload: {
        taskId: string;
        updates: Partial<Task>;
        updatedBy: string;
    };
}
export interface UserPresenceMessage extends WebSocketMessage {
    type: 'user_presence';
    payload: {
        userId: string;
        isOnline: boolean;
        lastSeen: Date;
    };
}
//# sourceMappingURL=index.d.ts.map