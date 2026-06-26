import axios from 'axios'

/**
 * Axios API client instance with predefined configuration.
 * Automatically falls back to local development server if VITE_API_URL environment variable is unset.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://internship-system-design-production.up.railway.app',
  //baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Request Interceptor
 * Injects the JWT access token from localStorage into the Authorization header of every outgoing request.
 * This ensures authenticated endpoints in the Django backend can verify the request identity.
 */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response Interceptor
 * Implements a robust automatic token refresh flow:
 * 1. Automatically intercepts 401 Unauthorized responses.
 * 2. Checks if a refresh token is present in localStorage.
 * 3. Sends a silent POST request to refresh the expired access token.
 * 4. Retries the original request with the fresh token if the refresh succeeds.
 * 5. Clears authentication state and redirects to login if the refresh fails or token is missing.
 */
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    
    // Check if response is 401 (Unauthorized) and the request hasn't been retried already
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true // Mark request as retried to avoid infinite loops
      
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }
      
      try {
        // Attempt silent JWT token renewal
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/refresh/`,
          { refresh }
        )
        
        // Save the new access token and update headers for retry
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        
        // Re-execute the original request with the new authorization header
        return client(original)
      } catch {
        // Refresh token might be expired or invalid; force user logout
        clearAuthAndRedirect()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Helper utility to clean up authentication data from local storage
 * and redirect the browser back to the landing page.
 */
function clearAuthAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/'
}

export default client
