import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'student',
    student_number: '',
    staff_number: '',
    department: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

   const roles = [
    { value: 'student', label: 'Student Intern' },
    { value: 'academic_supervisor', label: 'Academic Supervisor' },
    { value: 'workplace_supervisor', label: 'Workplace Supervisor' },
  ]

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Remove empty optional fields
      const submitData = { ...formData }
      if (!submitData.department) delete submitData.department
      if (!submitData.student_number) delete submitData.student_number
      if (!submitData.staff_number) delete submitData.staff_number

      const response = await client.post('/api/auth/signup/', submitData)
      
      setSuccess(true)


       setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err: any) {
      const errorData = err.response?.data || {}
      setErrors(errorData)
    } finally {
      setLoading(false)
    }
  }


   const showStudentNumber = formData.role === 'student'
  const showStaffNumber = ['academic_supervisor', 'workplace_supervisor'].includes(formData.role)

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

        {success && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <div className="font-semibold">✓ Account created successfully!</div>
            <div className="text-xs mt-1">Redirecting to dashboard...</div>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-800 mb-1">Create Account</h2>
        <p className="text-sm text-gray-500 mb-6">Join the internship management system</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
                required
                className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none focus:bg-white transition-colors bg-gray-50 ${
                  errors.first_name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
                required
                className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none focus:bg-white transition-colors bg-gray-50 ${
                  errors.last_name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="unique username"
              required
              className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none focus:bg-white transition-colors bg-gray-50 ${
                errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {errors.username && (
              <p className="text-xs text-red-600 mt-1">
                {Array.isArray(errors.username) ? errors.username[0] : errors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none focus:bg-white transition-colors bg-gray-50 ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {Array.isArray(errors.email) ? errors.email[0] : errors.email}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
          </div>

          {/* Conditional Role Fields */}
          {showStudentNumber && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student Number *</label>
              <input
                type="text"
                name="student_number"
                value={formData.student_number}
                onChange={handleChange}
                placeholder="e.g., STU-2024-001"
                required={showStudentNumber}
                className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none focus:bg-white transition-colors bg-gray-50 ${
                  errors.student_number ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.student_number && (
                <p className="text-xs text-red-600 mt-1">
                  {Array.isArray(errors.student_number) ? errors.student_number[0] : errors.student_number}
                </p>
              )}
            </div>
          )}

           {showStaffNumber && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Staff Number *</label>
              <input
                type="text"
                name="staff_number"
                value={formData.staff_number}
                onChange={handleChange}
                placeholder="e.g., STAFF-2024-001"
                required={showStaffNumber}
                className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none focus:bg-white transition-colors bg-gray-50 ${
                  errors.staff_number ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.staff_number && (
                <p className="text-xs text-red-600 mt-1">
                  {Array.isArray(errors.staff_number) ? errors.staff_number[0] : errors.staff_number}
                </p>
              )}
            </div>
          )}

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department (Optional)</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
              className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars"
                required
                className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none focus:bg-white transition-colors bg-gray-50 ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm</label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none focus:bg-white transition-colors bg-gray-50 ${
                  errors.password_confirm ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.password_confirm && (
                <p className="text-xs text-red-600 mt-1">
                  {Array.isArray(errors.password_confirm) ? errors.password_confirm[0] : errors.password_confirm}
                </p>
              )}
            </div>
          </div>

          {/* General error */}
          {errors.non_field_errors && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <span>⚠</span>
              <div>
                {Array.isArray(errors.non_field_errors) 
                  ? errors.non_field_errors[0] 
                  : errors.non_field_errors}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors mt-6"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

      