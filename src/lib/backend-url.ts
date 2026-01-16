/**
 * Get the correct backend URL for server-side requests
 * Uses BACKEND_URL for Docker network communication,
 * falls back to NEXT_PUBLIC_BACKEND_URL for development
 */
export function getBackendUrl(): string {
  // For server-side (API routes) - use Docker network URL
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
  }

  // For client-side - use public URL
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
}
