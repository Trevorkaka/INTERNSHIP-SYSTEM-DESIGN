import axios from 'axios'

// ── Base axios instance ───────────────────────────────────────────────────────
// All API calls go through this. Swap the baseURL when you deploy.
const client = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})