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
