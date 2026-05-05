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