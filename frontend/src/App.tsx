import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const EmailSentPage = lazy(() => import('./pages/EmailSentPage'))

/**
 * AppRouter Component
 * Acts as the centralized routing controller for the application.
 * Depending on the authentication state, loading indicators, and active roles,
 * it serves corresponding views and wraps authenticated sections in a standard Layout.
 */
function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  // Define setPage for compatibility with dashboard/sub-components
  const setPage = (p: string) => {
    navigate('/' + p)
  }

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
        <Routes>
          <Route path="/" element={<WelcomePage onEnter={() => navigate('/login')} />} />
          <Route path="/signup" element={<SignupPage onNavigateToLogin={() => navigate('/login')} />} />
          <Route path="/login" element={<LoginPage onNavigateToSignup={() => navigate('/signup')} />} />
          <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage />} />
          <Route path="/email-sent" element={<EmailSentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    )
  }

  // --- LOGGED IN ROLE-BASED RENDERING & ROUTING GUARDS ---
  // Maps the user's role to their designated workflow dashboard or specific subpage.
  const renderPage = (page: string) => {
    switch (user?.role) {
      case 'student':
        if (page === 'activities')  return <StudentActivityLogs />
        if (page === 'evaluations') return <StudentEvaluations />
        if (page === 'performance') return <StudentPerformance />
        return <StudentDashboard setPage={setPage} />

      case 'workplace_supervisor':
        if (page === 'interns')  return <WorkplaceSupervisorDashboard filter="interns" setPage={setPage} />
        if (page === 'reviews')  return <WorkplaceSupervisorDashboard filter="reviews" setPage={setPage} />
        return <WorkplaceSupervisorDashboard filter="all" setPage={setPage} />

      case 'academic_supervisor':
        if (page === 'students')    return <AcademicSupervisorDashboard filter="students" setPage={setPage} />
        if (page === 'evaluations') return <AcademicSupervisorDashboard filter="evaluations" setPage={setPage} />
        if (page === 'analytics')   return <AcademicSupervisorDashboard filter="analytics" setPage={setPage} />
        return <AcademicSupervisorDashboard filter="all" setPage={setPage} />

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
    <Layout>
      {/* Suspense handles lazy components loading spinners as pages are loaded over HTTP */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading page…
        </div>
      }>
        <Routes>
          {/* Default authenticated redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Explicit dynamic paths matching our navigation model */}
          <Route path="/dashboard" element={renderPage('dashboard')} />
          <Route path="/activities" element={renderPage('activities')} />
          <Route path="/evaluations" element={renderPage('evaluations')} />
          <Route path="/performance" element={renderPage('performance')} />
          <Route path="/placements" element={renderPage('placements')} />
          <Route path="/supervisors" element={renderPage('supervisors')} />
          
          {/* Other navigation IDs routing to role dashboard or appropriate page */}
          <Route path="/interns" element={renderPage('interns')} />
          <Route path="/reviews" element={renderPage('reviews')} />
          <Route path="/students" element={renderPage('students')} />
          <Route path="/analytics" element={renderPage('analytics')} />
          <Route path="/oversight" element={renderPage('oversight')} />
          <Route path="/settings" element={renderPage('settings')} />
          
          {/* Fallback for any other path */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
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
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  )
}
