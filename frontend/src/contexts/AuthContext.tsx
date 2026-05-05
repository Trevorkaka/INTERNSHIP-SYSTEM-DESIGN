import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import client from '../api/client'

// ── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'academic_supervisor' | 'workplace_supervisor' | 'admin'
}


interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}
// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // On app load, restore user from localStorage if tokens exist
  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])
  
  const login = async (username: string, password: string) => {
    const { data } = await client.post('/api/auth/login/', { username, password })
  
    // Store tokens and user in localStorage
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
  
    setUser(data.user)
  }



  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        await client.post('/api/auth/logout/', { refresh })
      }
    } catch {
      // Even if logout API fails, clear local state
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}