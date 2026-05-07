import { useState, useEffect } from 'react'
import { Users, Building2, Download, Settings, Loader } from 'lucide-react'
import client from '../../api/client'

interface Props {
  setPage: (page: string) => void
}

export default function AdminDashboard({ setPage }: Props) {
  const [students, setStudents]     = useState<any[]>([])
  const [placements, setPlacements] = useState<any[]>([])
  const [logs, setLogs]             = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [sRes, pRes, lRes] = await Promise.all([
          client.get('/api/students/'),
          client.get('/api/placements/'),
          client.get('/api/weekly-logs/'),
        ])
        setStudents(sRes.data.results ?? sRes.data)
        setPlacements(pRes.data.results ?? pRes.data)
        setLogs(lRes.data.results ?? lRes.data)
      } catch {}
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const pendingLogs  = logs.filter(l => l.status === 'submitted').length
  const approvedLogs = logs.filter(l => l.status === 'approved').length
  const draftLogs    = logs.filter(l => l.status === 'draft').length

  const stats = [
    { label: 'Total Students',   value: students.length + '',   sub: 'registered',         color: 'text-blue-600'   },
    { label: 'Active Placements',value: placements.length + '', sub: 'internships',         color: 'text-green-600'  },
    { label: 'Pending Reviews',  value: pendingLogs + '',       sub: 'logs awaiting review',color: 'text-amber-600'  },
    { label: 'Total Logs',       value: logs.length + '',       sub: approvedLogs + ' approved', color: 'text-violet-600' },
  ]

  const quickActions = [
    { label: 'Manage Placements', icon: <Users size={15} className="text-blue-600"/>,     onClick: () => setPage('placements') },
    { label: 'Add Company',       icon: <Building2 size={15} className="text-blue-600"/>, onClick: () => setPage('placements') },
    { label: 'Export Reports',    icon: <Download size={15} className="text-blue-600"/>,  onClick: () => {} },
    { label: 'System Settings',   icon: <Settings size={15} className="text-blue-600"/>,  onClick: () => setPage('settings') },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader size={16} className="animate-spin"/> Loading dashboard…
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Recent placements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Recent Placements</h2>
            <button onClick={() => setPage('placements')} className="text-xs font-semibold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="p-4 space-y-3">
            {placements.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">No placements yet.</div>
            )}
            {placements.slice(0, 5).map((p: any) => {
              const start = new Date(p.start_date)
              const end   = new Date(p.end_date)
              const progress = Math.min(100, Math.max(0,
                Math.round(((Date.now() - start.getTime()) / (end.getTime() - start.getTime())) * 100)
              ))
              return (
                <div key={p.id} className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold">{p.company_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.position}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.start_date} – {p.end_date}</div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">active</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: progress + '%' }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Log status summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Log Status Overview</h2>
          </div>
          <div className="p-4 space-y-4">
            {[
              ['Draft',     draftLogs,    'bg-gray-300'   ],
              ['Submitted', pendingLogs,  'bg-amber-400'  ],
              ['Reviewed',  logs.filter(l => l.status === 'reviewed').length,  'bg-blue-500' ],
              ['Approved',  approvedLogs, 'bg-green-500'  ],
            ].map(([label, count, color]) => (
              <div key={label as string}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500 capitalize font-medium">{label}</span>
                  <span className="font-bold">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`}
                    style={{ width: logs.length ? ((count as number) / logs.length * 100) + '%' : '0%' }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Students list */}
          <div className="px-5 pb-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pt-4 border-t border-gray-100">Registered Students</div>
            {students.slice(0, 4).map((s: any) => (
              <div key={s.id} className="flex items-center gap-2.5 py-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                  {s.user?.first_name?.[0] ?? '?'}{s.user?.last_name?.[0] ?? ''}
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.user?.first_name} {s.user?.last_name}</div>
                  <div className="text-xs text-gray-400">{s.course} · {s.registration_number}</div>
                </div>
              </div>
            ))}
            {students.length > 4 && (
              <div className="text-xs text-blue-600 font-medium mt-1">+{students.length - 4} more students</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Quick Actions</h2>
        </div>
        <div className="p-4 grid grid-cols-4 gap-3">
          {quickActions.map(({ label, icon, onClick }) => (
            <button key={label} onClick={onClick}
              className="flex items-center gap-2.5 p-3.5 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-left transition-all">
              {icon}
              <span className="text-sm font-semibold text-gray-800">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            title: 'Submission Rate',
            rows: [
              ['Total Logs Created', logs.length],
              ['Submitted',          logs.filter(l => l.status !== 'draft').length],
              ['Approved',           approvedLogs],
            ],
          },
          {
            title: 'Review Progress',
            rows: [
              ['Awaiting Review',    pendingLogs],
              ['Under Review',       logs.filter(l => l.status === 'reviewed').length],
              ['Fully Approved',     approvedLogs],
            ],
          },
          {
            title: 'System Overview',
            rows: [
              ['Total Students',     students.length],
              ['Active Placements',  placements.length],
              ['Total Activity Logs',logs.length],
            ],
          },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold">{section.title}</h2>
            </div>
            <div className="p-4 space-y-3">
              {section.rows.map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}