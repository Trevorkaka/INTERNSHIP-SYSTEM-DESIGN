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

interface LayoutProps {
  children: ReactNode
  page: string
  setPage: (page: string) => void
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  student: [
    { id: 'dashboard',   label: 'Dashboard',      icon: <LayoutDashboard size={16}/> },
    { id: 'activities',  label: 'Activity Logs',  icon: <FileText size={16}/> },
    { id: 'evaluations', label: 'Evaluations',    icon: <ClipboardCheck size={16}/> },
    { id: 'performance', label: 'Performance',    icon: <BarChart2 size={16}/> },
  ],
