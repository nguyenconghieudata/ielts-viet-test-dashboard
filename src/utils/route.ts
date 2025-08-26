export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  API_TEST: "/api-test",
};

// Define API routes that should be excluded from middleware
export const API_ROUTES = {
  UPLOAD: "/api/upload",
  HEALTH: "/api/health",
  READING_FILE_AI: "/api/reading-file-ai",
};

// Helper function to check if a path is an API route
export const isApiRoute = (path: string): boolean => {
  return path.startsWith("/api/");
};
