import { useState, ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, FileText, ClipboardCheck, BarChart2,
  Users, Settings, Bell, LogOut, BookOpen, Building2
} from 'lucide-react'


interface NavItem {
  id: string
  label: string
  icon: ReactNode
}