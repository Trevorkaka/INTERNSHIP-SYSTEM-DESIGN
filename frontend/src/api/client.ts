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
