import axios from 'axios'

// ── Base axios instance ───────────────────────────────────────────────────────
// All API calls go through this. Swap the baseURL when you deploy.
const client = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor ───────────────────────────────────────────────────────
// Automatically attaches the access token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
// ── Response interceptor ──────────────────────────────────────────────────────
// If a request fails with 401 (token expired), try to refresh automatically.
// If refresh also fails, clear storage and redirect to login.
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }


      try {
        const { data } = await axios.post('http://127.0.0.1:8000/api/auth/refresh/', {
          refresh,
        })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return client(original) // retry the original request with new token
      } catch {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

function clearAuthAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export default client