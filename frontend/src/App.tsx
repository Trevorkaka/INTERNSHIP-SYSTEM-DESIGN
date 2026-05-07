import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './components/LoginPage'
import StudentDashboard from './components/dashboards/StudentDashboard'
import WorkplaceSupervisorDashboard from './components/dashboards/WorkplaceSupervisorDashboard'
import AcademicSupervisorDashboard from './components/dashboards/AcademicSupervisorDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import StudentActivityLogs from './components/pages/StudentActivityLogs'
import StudentEvaluations from './components/pages/StudentEvaluations'
import StudentPerformance from './components/pages/StudentPerformance'
import AdminPlacements from './components/pages/AdminPlacements'

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white/40 text-sm animate-pulse">Loading ILES…</div>
    </div>
  )

  if (!isAuthenticated) return <LoginPage />

  const renderPage = () => {
    switch (user?.role) {
      case 'student':
        if (page === 'activities')  return <StudentActivityLogs />
        if (page === 'evaluations') return <StudentEvaluations />
        if (page === 'performance') return <StudentPerformance />
        return <StudentDashboard setPage={setPage} />
      case 'workplace_supervisor':
        return <WorkplaceSupervisorDashboard />
      case 'academic_supervisor':
        return <AcademicSupervisorDashboard />
      case 'admin':
        if (page === 'placements') return <AdminPlacements />
        return <AdminDashboard setPage={setPage} />
      default:
        return <div className="p-8 text-red-500">Unknown role: {user?.role}</div>
    }
  }

  return (
    <Layout page={page} setPage={setPage}>
      {renderPage()}
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}