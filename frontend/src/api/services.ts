import client from './client'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username: string, password: string) =>
    client.post('/api/auth/login/', { username, password }),

  logout: (refresh: string) =>
    client.post('/api/auth/logout/', { refresh }),

  refresh: (refresh: string) =>
    client.post('/api/auth/refresh/', { refresh }),
}

// ── Students ──────────────────────────────────────────────────────────────────
export const studentsAPI = {
  list: (params?: Record<string, string>) =>
    client.get('/api/students/', { params }),

  retrieve: (id: number) =>
    client.get(`/api/students/${id}/`),

  me: () =>
    client.get('/api/students/', { params: { limit: 1 } }),
}

// ── Weekly Logs ───────────────────────────────────────────────────────────────
export const logsAPI = {
  list: (params?: Record<string, string>) =>
    client.get('/api/weekly-logs/', { params }),

  retrieve: (id: number) =>
    client.get(`/api/weekly-logs/${id}/`),

  create: (data: {
    week_number: number
    activities: string
    challenges: string
    solutions: string
  }) => client.post('/api/weekly-logs/', data),

  update: (id: number, data: object) =>
    client.patch(`/api/weekly-logs/${id}/`, data),

  submit: (id: number) =>
    client.post(`/api/weekly-logs/${id}/submit/`),

  review: (id: number) =>
    client.post(`/api/weekly-logs/${id}/review/`),

  approve: (id: number) =>
    client.post(`/api/weekly-logs/${id}/approve/`),
}

// ── Assessments ───────────────────────────────────────────────────────────────
export const assessmentsAPI = {
  list: (params?: Record<string, string>) =>
    client.get('/api/assessments/', { params }),

  create: (data: {
    log: number
    marks: number
    feedback: string
  }) => client.post('/api/assessments/', data),
}

// ── Evaluations ───────────────────────────────────────────────────────────────
export const evaluationsAPI = {
  list: (params?: Record<string, string>) =>
    client.get('/api/evaluations/', { params }),

  create: (data: {
    log: number
    criteria: number
    score: number
    feedback: string
  }) => client.post('/api/evaluations/', data),

  criteriaList: () =>
    client.get('/api/evaluation-criteria/'),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () =>
    client.get('/api/notifications/'),

  markRead: (id: number) =>
    client.post(`/api/notifications/${id}/mark_as_read/`),

  markAllRead: () =>
    client.post('/api/notifications/mark_all_as_read/'),
}

// ── Placements ────────────────────────────────────────────────────────────────
export const placementsAPI = {
  list: (params?: Record<string, string>) =>
    client.get('/api/placements/', { params }),

  create: (data: {
    student: number
    company_name: string
    position: string
    start_date: string
    end_date: string
  }) => client.post('/api/placements/', data),
}

// ── Supervisors ───────────────────────────────────────────────────────────────
export const supervisorsAPI = {
  academic: () =>
    client.get('/api/academic-supervisors/'),

  workplace: () =>
    client.get('/api/workplace-supervisors/'),
}