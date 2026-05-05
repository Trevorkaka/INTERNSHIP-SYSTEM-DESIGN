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