const API_ENDPOINTS = {
  health: "/health",
  upload: "/api/upload",
  taskStatus: (taskId: string) => `/api/task/${taskId}`,
  download: (taskId: string) => `/api/download/${taskId}`,
  events: (taskId: string) => `/api/events/${taskId}`,
} as const;

export { API_ENDPOINTS };

