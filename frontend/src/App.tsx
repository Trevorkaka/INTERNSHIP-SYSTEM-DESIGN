import { useState, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './pages/Layout'

// Lazy load pages and dashboard components for bundle optimization
const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const StudentDashboard = lazy(() => import('./components/dashboards/StudentDashboard'))
const WorkplaceSupervisorDashboard = lazy(() => import('./components/dashboards/WorkplaceSupervisorDashboard'))
const AcademicSupervisorDashboard = lazy(() => import('./components/dashboards/AcademicSupervisorDashboard'))
const AdminDashboard = lazy(() => import('./components/dashboards/AdminDashboard'))
const StudentActivityLogs = lazy(() => import('./pages/StudentActivityLogs'))
const StudentEvaluations = lazy(() => import('./pages/StudentEvaluations'))
const StudentPerformance = lazy(() => import('./pages/StudentPerformance'))
const AdminPlacements = lazy(() => import('./pages/AdminPlacements'))
const AdminSupervisorAssignment = lazy(() => import('./pages/AdminSupervisorAssignment'))

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
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-white/40 text-sm animate-pulse">Loading ILES…</div>
        </div>
      }>
        {screen === 'welcome' && <WelcomePage onEnter={() => setScreen('login')} />}
        {screen === 'signup' && <SignupPage onNavigateToLogin={() => setScreen('login')} />}
        {screen === 'login' && <LoginPage onNavigateToSignup={() => setScreen('signup')} />}
      </Suspense>
    )
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
      <Suspense fallback={
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading page…
        </div>
      }>
        {renderPage()}
      </Suspense>
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
