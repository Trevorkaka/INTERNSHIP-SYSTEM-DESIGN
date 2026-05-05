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
  workplace_supervisor: [
    { id: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={16}/> },
    { id: 'interns',   label: 'My Interns', icon: <Users size={16}/> },
    { id: 'reviews',   label: 'Reviews',    icon: <ClipboardCheck size={16}/> },
  ],
  academic_supervisor: [
    { id: 'dashboard',   label: 'Dashboard',   icon: <LayoutDashboard size={16}/> },
    { id: 'students',    label: 'My Students', icon: <Users size={16}/> },
    { id: 'evaluations', label: 'Evaluations', icon: <ClipboardCheck size={16}/> },
    { id: 'analytics',   label: 'Analytics',   icon: <BarChart2 size={16}/> },
  ],

  admin: [
    { id: 'dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={16}/> },
    { id: 'placements', label: 'Placements', icon: <Building2 size={16}/> },
    { id: 'oversight',  label: 'Oversight',  icon: <BookOpen size={16}/> },
    { id: 'analytics',  label: 'Analytics',  icon: <BarChart2 size={16}/> },
    { id: 'settings',   label: 'Settings',   icon: <Settings size={16}/> },
  ],
}

const ROLE_LABEL: Record<string, string> = {
  student: 'Student Intern',
  workplace_supervisor: 'Workplace Supervisor',
  academic_supervisor: 'Academic Supervisor',
  admin: 'Administrator',
}
