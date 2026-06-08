import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import WelcomePage from './pages/WelcomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StudentDashboard from './components/dashboards/StudentDashboard'
import WorkplaceSupervisorDashboard from './components/dashboards/WorkplaceSupervisorDashboard'
import AcademicSupervisorDashboard from './components/dashboards/AcademicSupervisorDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import StudentActivityLogs from './pages/StudentActivityLogs'
import StudentEvaluations from './pages/StudentEvaluations'
import StudentPerformance from './pages/StudentPerformance'
import AdminPlacements from './pages/AdminPlacements'
import AdminSupervisorAssignment from './pages/AdminSupervisorAssignment'

type Screen = 'welcome' | 'login' | 'signup'

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [page,   setPage]   = useState('dashboard')
  const [screen, setScreen] = useState<Screen>('welcome')

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white/40 text-sm animate-pulse">Loading ILES…</div>
    </div>
  )

  // Not logged in — show welcome → login/signup flow
  if (!isAuthenticated) {
    if (screen === 'welcome') return <WelcomePage onEnter={() => setScreen('login')} />
    if (screen === 'signup')  return <SignupPage onNavigateToLogin={() => setScreen('login')} />
    return <LoginPage onNavigateToSignup={() => setScreen('signup')} />
  }

  // Logged in — render by role
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
        if (page === 'placements')   return <AdminPlacements />
        if (page === 'supervisors')  return <AdminSupervisorAssignment />
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
