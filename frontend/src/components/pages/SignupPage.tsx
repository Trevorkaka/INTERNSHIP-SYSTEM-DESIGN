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
      