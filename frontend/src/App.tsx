import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './components/LoginPage'

// ── Dashboards ────────────────────────────────────────────────────────────────
// Import each dashboard — we'll build these next
import StudentDashboard from './components/dashboards/StudentDashboard'
import WorkplaceSupervisorDashboard from './components/dashboards/WorkplaceSupervisorDashboard'
import AcademicSupervisorDashboard from './components/dashboards/AcademicSupervisorDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'

// ── Pages ─────────────────────────────────────────────────────────────────────
import StudentActivityLogs from './components/pages/StudentActivityLogs'
import StudentEvaluations from './components/pages/StudentEvaluations'
import StudentPerformance from './components/pages/StudentPerformance'
import AdminPlacements from './components/pages/AdminPlacements'

// ── Router ────────────────────────────────────────────────────────────────────
function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Layout page={page} setPage={setPage}>
      <div className="rounded-3xl border border-dashed border-slate-300/30 bg-white/80 p-8 shadow-lg text-slate-700">
        <h2 className="text-2xl font-semibold mb-4">Welcome to ILES</h2>
        <p className="text-sm text-slate-500">
          Select a page from the sidebar to continue.
        </p>
      </div>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
