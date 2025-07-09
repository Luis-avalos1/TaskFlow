"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = exports.createError = exports.groupBy = exports.unique = exports.slugify = exports.truncateText = exports.isValidPassword = exports.isValidEmail = exports.isDatePast = exports.formatDateTime = exports.formatDate = void 0;
// Date utilities
const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
exports.formatDateTime = formatDateTime;
const isDatePast = (date) => {
    return new Date(date) < new Date();
};
exports.isDatePast = isDatePast;
// Validation utilities
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.isValidPassword = isValidPassword;
// String utilities
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength).trim() + '...';
};
exports.truncateText = truncateText;
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
// Array utilities
const unique = (array) => {
    return [...new Set(array)];
};
exports.unique = unique;
const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = String(item[key]);
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {});
};
exports.groupBy = groupBy;
// Error utilities
const createError = (message, code) => {
    const error = new Error(message);
    if (code) {
        error.code = code;
    }
    return error;
};
exports.createError = createError;
// ID generation
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
exports.generateId = generateId;
//# sourceMappingURL=index.js.map