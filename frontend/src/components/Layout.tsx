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


function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const MOCK_NOTIFS = [
  { id: 1, title: 'Log Approved', message: 'Week 12 log approved by Sarah Martinez', time: '10 min ago', read: false },
  { id: 2, title: 'Assessment Feedback', message: 'You received 42/50 marks on Week 11', time: '2 hrs ago', read: false },
  { id: 3, title: 'Log Reviewed', message: 'Your Week 10 log has been reviewed', time: '1 day ago', read: true },
]

export default function Layout({ children, page, setPage }: LayoutProps) {
  const { user, logout } = useAuth()
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)

  const navItems = NAV_BY_ROLE[user?.role ?? ''] ?? []
  const pageTitle = navItems.find(n => n.id === page)?.label ?? 'ILES'
  const unread = notifs.filter(n => !n.read).length
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username || ''

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })))


  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-gray-950 flex flex-col flex-shrink-0 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-black">IL</div>
            <div>
              <div className="text-white font-black text-lg tracking-tight leading-none">ILES</div>
              <div className="text-white/30 text-[10px] mt-0.5 tracking-wide">Internship System</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-2 pb-2 pt-1">Navigation</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg w-full text-left text-sm font-medium transition-all
                ${page === item.id
                  ? 'bg-blue-600/20 text-white'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/6'}`}
            >
              <span className={page === item.id ? 'text-blue-400' : ''}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>