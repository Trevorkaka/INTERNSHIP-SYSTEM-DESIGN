import { useState, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './pages/Layout'

/**
 * Lazy load pages and dashboard components for bundle size optimization.
 * This ensures code-splitting is applied: routes/dashboards are only downloaded
 * to the client when they are actually rendered, reducing the initial load time.
 */
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

// Defines the UI step state before authentication is complete
type Screen = 'welcome' | 'login' | 'signup'

/**
 * AppRouter Component
 * Acts as the centralized routing controller for the application.
 * Depending on the authentication state, loading indicators, and active roles,
 * it serves corresponding views and wraps authenticated sections in a standard Layout.
 */
function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  // Handles navigation within authenticated screens (e.g. dashboards vs subpages)
  const [page,   setPage]   = useState('dashboard')
  
  // Handles navigation within unauthenticated landing screens
  const [screen, setScreen] = useState<Screen>('welcome')

  // Block rendering while restoring state from localStorage in the AuthProvider
  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white/40 text-sm animate-pulse">Loading ILES…</div>
    </div>
  )

  // --- NOT LOGGED IN FLOW ---
  // Renders the marketing landing / welcome page and redirects to login/signup forms.
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

  // --- LOGGED IN ROLE-BASED RENDERING & ROUTING GUARDS ---
  // Maps the user's role to their designated workflow dashboard or specific subpage.
  const renderPage = () => {
    switch (user?.role) {
      case 'student':
        if (page === 'activities')  return <StudentActivityLogs />
        if (page === 'evaluations') return <StudentEvaluations />
        if (page === 'performance') return <StudentPerformance />
        return <StudentDashboard setPage={setPage} />

      case 'workplace_supervisor':
        if (page === 'interns')  return <WorkplaceSupervisorDashboard filter="interns" />
        if (page === 'reviews')  return <WorkplaceSupervisorDashboard filter="reviews" />
        return <WorkplaceSupervisorDashboard />

      case 'academic_supervisor':
        return <AcademicSupervisorDashboard />

      case 'admin':
        if (page === 'placements')   return <AdminPlacements />
        if (page === 'supervisors')  return <AdminSupervisorAssignment />
        return <AdminDashboard setPage={setPage} />

      default:
        // Safeguard against backend-defined roles not registered on frontend routing switch
        return <div className="p-8 text-red-500">Unknown role: {user?.role}</div>
    }
  }

  return (
    <Layout page={page} setPage={setPage}>
      {/* Suspense handles lazy components loading spinners as pages are loaded over HTTP */}
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

/**
 * Root Application Entrypoint Component
 * Injects global contexts (like Authentication) around the core router.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
