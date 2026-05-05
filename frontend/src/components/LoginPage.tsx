import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const demos = [
    { label: 'Student Intern',        username: 'alexjohnson',   email: 'student@iles.edu' },
    { label: 'Workplace Supervisor',  username: 'sarahmartinez', email: 'workplace@company.com' },
    { label: 'Academic Supervisor',   username: 'drmichaelchen', email: 'academic@iles.edu' },
    { label: 'Administrator',         username: 'jenwilliams',   email: 'admin@iles.edu' },
  ]


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="bg-white rounded-2xl p-10 w-full max-w-md relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
            IL
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">ILES</div>
            <div className="text-xs text-gray-400 mt-0.5">Internship Logging & Evaluation System</div>
          </div>
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your username"
              required
              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
            />

          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
            />
          </div>