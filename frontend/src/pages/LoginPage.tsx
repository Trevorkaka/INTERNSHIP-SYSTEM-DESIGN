import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  onNavigateToSignup: () => void
}

export default function LoginPage({ onNavigateToSignup }: Props) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const demos = [
    { label: 'Student',              username: 'alexjohnson',   hint: 'student@iles.edu'       },
    { label: 'Workplace Supervisor', username: 'sarahmartinez', hint: 'workplace@company.com'  },
    { label: 'Academic Supervisor',  username: 'drmichaelchen', hint: 'academic@iles.edu'      },
    { label: 'Administrator',        username: 'jenwilliams',   hint: 'admin@iles.edu'         },
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
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
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"/>

      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">IL</div>
          <div>
            <div className="text-2xl font-black tracking-tight">ILES</div>
            <div className="text-xs text-gray-400 mt-0.5">Internship Logging & Evaluation System</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="your username" required
              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              ⚠ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <button onClick={onNavigateToSignup} className="text-blue-600 font-semibold hover:underline">
            Create one
          </button>
        </p>

        {/* Demo accounts */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3 font-medium">Quick demo access (password: password123):</p>
          <div className="grid grid-cols-2 gap-2">
            {demos.map(d => (
              <button key={d.username}
                onClick={() => { setUsername(d.username); setPassword('password123') }}
                className="p-2.5 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg text-left transition-all">
                <div className="text-xs font-semibold text-gray-800">{d.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{d.hint}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
