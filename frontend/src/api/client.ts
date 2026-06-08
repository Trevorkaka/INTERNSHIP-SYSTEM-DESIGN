import axios from 'axios'

const baseURL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://127.0.0.1:8000'

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) { clearAuthAndRedirect(); return Promise.reject(error) }
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/refresh/`,
          { refresh }
        )
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return client(original)
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
  window.location.href = '/'
}

export default client