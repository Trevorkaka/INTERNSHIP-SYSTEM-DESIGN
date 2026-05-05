import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './components/LoginPage'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
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
