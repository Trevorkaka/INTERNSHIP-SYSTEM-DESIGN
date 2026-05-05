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


        {/* Footer */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-2.5 px-1 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials(fullName)}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">{fullName}</div>
              <div className="text-white/35 text-[11px] truncate">{ROLE_LABEL[user?.role ?? '']}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-white/35 hover:text-red-300 hover:bg-red-500/10 text-xs font-medium transition-all"
          >
            <LogOut size={13}/> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-15 bg-white border-b border-gray-200 px-7 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-black tracking-tight text-gray-900">{pageTitle}</h1>

          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center relative transition-colors"
            >
              <Bell size={15} className="text-gray-600"/>
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"/>
              )}
            </button>


            {showNotifs && (
              <div className="absolute top-11 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-bold">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-blue-600 font-medium hover:underline">Mark all read</button>
                </div>
                {notifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => setNotifs(notifs.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-7"
          onClick={() => showNotifs && setShowNotifs(false)}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
