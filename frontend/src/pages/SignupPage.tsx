import { useState, FormEvent } from 'react'
import client from '../api/client'

interface Props {
  onNavigateToLogin: () => void
}

export default function SignupPage({ onNavigateToLogin }: Props) {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    first_name: '', last_name: '', role: 'student',
    registration_number: '', course: '', year_of_study: '1',
    department: '', company_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      // Step 1: Create user via Django internship register endpoint
      await client.post('/api/auth/register/', {
        username:   form.username,
        email:      form.email,
        password:   form.password,
        first_name: form.first_name,
        last_name:  form.last_name,
        role:       form.role,
        // Role-specific fields
        ...(form.role === 'student' && {
          registration_number: form.registration_number,
          course:              form.course,
          year_of_study:       Number(form.year_of_study),
        }),
        ...(form.role === 'academic_supervisor' && {
          department: form.department,
        }),
        ...(form.role === 'workplace_supervisor' && {
          company_name: form.company_name,
        }),
      })
      setSuccess(true)
    } catch (err: any) {
      const data = err.response?.data
      if (data) {
        const messages = Object.values(data).flat().join(' ')
        setError(messages || 'Registration failed.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Account Created!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your account has been created successfully.
          {form.role === 'student' && ' An administrator will assign your supervisors.'}
          {form.role !== 'admin' && ' You can now log in.'}
        </p>
        <button onClick={onNavigateToLogin}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors">
          Go to Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"/>

      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">IL</div>
            <div>
              <div className="text-xl font-black tracking-tight">Create Account</div>
              <div className="text-xs text-gray-400">ILES — Internship System</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">⚠ {error}</div>
          )}

          {/* Role selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['student',              '🎓 Student'],
                ['workplace_supervisor', '🏢 Workplace Supervisor'],
                ['academic_supervisor',  '📚 Academic Supervisor'],
              ].map(([value, label]) => (
                <button type="button" key={value}
                  onClick={() => set('role', value)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all
                    ${form.role === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            {[['first_name','First Name','John'], ['last_name','Last Name','Doe']].map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <input type="text" placeholder={ph} required value={(form as any)[key]}
                  onChange={e => set(key, e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
              </div>
            ))}
          </div>

          {/* Username + Email */}
          {[['username','Username','johndoe','text'], ['email','Email Address','john@example.com','email']].map(([key, label, ph, type]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input type={type} placeholder={ph} required value={(form as any)[key]}
                onChange={e => set(key, e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
          ))}

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            {[['password','Password','••••••••'], ['confirmPassword','Confirm Password','••••••••']].map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <input type="password" placeholder={ph} required value={(form as any)[key]}
                  onChange={e => set(key, e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
              </div>
            ))}
          </div>

          {/* Student-specific fields */}
          {form.role === 'student' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Registration Number</label>
                <input type="text" placeholder="e.g. CS/2022/001" value={form.registration_number}
                  onChange={e => set('registration_number', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Course</label>
                  <input type="text" placeholder="e.g. Computer Science" value={form.course}
                    onChange={e => set('course', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Year of Study</label>
                  <select value={form.year_of_study} onChange={e => set('year_of_study', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors">
                    {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Academic supervisor specific */}
          {form.role === 'academic_supervisor' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department</label>
              <input type="text" placeholder="e.g. Computer Science" value={form.department}
                onChange={e => set('department', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
          )}

          {/* Workplace supervisor specific */}
          {form.role === 'workplace_supervisor' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Company Name</label>
              <input type="text" placeholder="e.g. Tech Innovations Inc." value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors">
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button type="button" onClick={onNavigateToLogin} className="text-blue-600 font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
