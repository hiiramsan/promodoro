// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to create API URLs
export const createApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/api/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Server
  PING: createApiUrl('ping'),
  
  // Auth
  AUTH_ME: createApiUrl('auth/me'),
  AUTH_LOGIN: createApiUrl('auth/login'),
  AUTH_REGISTER: createApiUrl('auth/register'),
  
  // Projects
  PROJECTS: createApiUrl('projects'),
  PROJECT_BY_ID: (id) => createApiUrl(`projects/${id}`),
  
  // Tasks
  TASKS: createApiUrl('tasks'),
  TASK_BY_ID: (id) => createApiUrl(`tasks/${id}`),
  
  // Messages (test)
  MESSAGES: createApiUrl('messages')
};

export default API_BASE_URL;
