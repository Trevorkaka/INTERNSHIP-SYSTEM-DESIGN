import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import client from '../api/client'

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Represents the authenticated User structure returned by the backend.
 * Features a strongly-typed list of roles supporting permission/page-rendering guards.
 */
interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'academic_supervisor' | 'workplace_supervisor' | 'admin'
}

/**
 * Describes the structure of the authentication context state and actions.
 */
interface AuthContextType {
  user: User | null // The currently authenticated user, or null if unauthenticated
  isAuthenticated: boolean // Pre-computed boolean flag indicating if user is signed in
  isLoading: boolean // High-level loading state to block rendering during hydration
  login: (username: string, password: string) => Promise<void> // Direct login routine
  logout: () => Promise<void> // Revocation and cleanup routine
}

// ── Context ───────────────────────────────────────────────────────────────────
/**
 * React Context containing the auth state. Initialized with null.
 */
const AuthContext = createContext<AuthContextType | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
/**
 * AuthProvider wraps the whole React router/application to maintain global state.
 * Restores user state from localStorage upon initialization to prevent login loss on refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydration phase: restores the authenticated state on mounting.
  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')
    if (stored && token) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {
        // Safe-guard against JSON corruption in localStorage
        localStorage.clear()
      }
    }
    setIsLoading(false)
  }, [])
  
  /**
   * authenticates the user with the backend, stores JWT tokens, and sets state.
   */
  const login = async (username: string, password: string) => {
    const { data } = await client.post('/api/auth/login/', { username, password })
  
    // Store tokens and profile information in localStorage for hydration persistence
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
  
    setUser(data.user)
  }

  /**
   * Performs logout by notifying the backend to blacklist the current refresh token,
   * then purges all client-side authentication details and state.
   */
  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        // Call backend API to blacklist refresh token
        await client.post('/api/auth/logout/', { refresh })
      }
    } catch {
      // Even if network request or API fails, we proceed with clearing client data
    } finally {
      // Purge local storage and reset react state
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

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * Custom React hook to consume the Auth context.
 * Throws an explicit error if called outside the AuthProvider context wrapper.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

