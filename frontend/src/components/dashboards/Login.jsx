import { useState } from "react"
import axios from "axios"

export default function Login({onLogin}){
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

     async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await axios.post('/api/auth/login/', { username, password })
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      onLogin && onLogin(res.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

}
