import { useState } from "react"
import api from '../../utils/api';
//import axios from "axios"

export default function Login({onLogin}){
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

     async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/auth/login/', { username, password })
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      onLogin && onLogin(res.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }
  return(
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <h3>Sign in</h3>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <div>
        <button type="submit">Sign in</button>
      </div>
    </form>
  )
}
