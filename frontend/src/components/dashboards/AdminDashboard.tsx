import { Users, Building2, Download, Settings } from 'lucide-react'
import React from 'react'

interface Props {
  setPage: (page: string) => void
}

export default function AdminDashboard({ setPage }: Props) {
  const stats = [
    { label: 'Total Placements',  value: '248', sub: '+12 this month',       color: 'text-blue-600'   },
    { label: 'Partner Companies', value: '64',  sub: '+3 new',               color: 'text-green-600'  },
    { label: 'Avg Performance',   value: '84%', sub: '+2% this semester',    color: 'text-violet-600' },
    { label: 'At-Risk Students',  value: '8',   sub: 'Requires attention',   color: 'text-red-600'    },
  ]

  const placements = [
    { id: 1, student: 'Alex Johnson',    company: 'Tech Innovations Inc.',  supervisor: 'Sarah Martinez',  start: '15 Jan 2026', status: 'active', progress: 72 },
    { id: 2, student: 'Emily Davis',     company: 'Digital Solutions Ltd.', supervisor: 'John Smith',      start: '20 Jan 2026', status: 'active', progress: 68 },
    { id: 3, student: 'Michael Brown',   company: 'Creative Agency Co.',    supervisor: 'Lisa Anderson',   start: '1 Feb 2026',  status: 'active', progress: 58 },
  ]

  const actions = [
    { id: 'a1', action: 'Approve new company partnership request', priority: 'high',   date: '5 May 2026'  },
    { id: 'a2', action: 'Review 8 at-risk student cases',          priority: 'high',   date: '6 May 2026'  },
    { id: 'a3', action: 'Process end-of-semester evaluations',     priority: 'medium', date: '15 May 2026' },
    { id: 'a4', action: 'Update internship policies',              priority: 'low',    date: '20 May 2026' },
  ]

  const depts = [
    { name: 'Computer Science',         students: 82, score: 87, color: 'bg-blue-500'   },
    { name: 'Business Administration', students: 64, score: 83, color: 'bg-green-500'  },
    { name: 'Engineering',              students: 56, score: 85, color: 'bg-violet-500' },
    { name: 'Design & Media',           students: 46, score: 81, color: 'bg-amber-500'  },
  ]

  const quickActions = [
    { label: 'Manage Placements', icon: <Users size={15} className="text-blue-600"/>,    onClick: () => setPage('placements') },
    { label: 'Add Company',       icon: <Building2 size={15} className="text-blue-600"/>, onClick: () => {} },
    { label: 'Export Reports',    icon: <Download size={15} className="text-blue-600"/>,  onClick: () => {} },
    { label: 'System Settings',   icon: <Settings size={15} className="text-blue-600"/>,  onClick: () => setPage('settings') },
  ]

  const summaryCards = [
    {
      title: 'Completion Rates',
      rows: [
        ['Successfully Completed', '92%', 92, 'bg-green-500'],
        ['In Progress',            '6%',   6, 'bg-blue-500' ],
        ['Discontinued',           '2%',   2, 'bg-red-500'  ],
      ],
    },
    {
      title: 'Review Status',
      rows: [
        ['Pending Reviews',       '23',        null, null],
        ['Pending Evaluations',   '12',        null, null],
        ['Completed This Week',   '56',        null, null],
        ['Avg Response Time',     '2.3 days',  null, null],
      ],
    },
    {
      title: 'System Health',
      rows: [
        ['Active Users Today', '187',      null, 'text-green-600'],
        ['System Uptime',      '99.8%',    null, 'text-green-600'],
        ['Sync Status',        'Current',  null, 'text-green-600'],
        ['Last Backup',        '2 hrs ago',null, null            ],
      ],
    },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Recent placements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Recent Placements</h2>
            <button onClick={() => setPage('placements')} className="text-xs font-semibold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="p-4 space-y-3">
            {placements.map((p) => (
              <div key={p.id} className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-bold">{p.student}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.company}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Supervisor: {p.supervisor}</div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{p.status}</span>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">Started {p.start}</span>
                  <span className="font-bold">{p.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progress}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Pending Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {actions.map((a) => (
              <div key={a.id} className={`p-3 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity
                ${a.priority === 'high'   ? 'bg-red-50 border-red-200'     :
                  a.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-gray-50 border-gray-200'}`}>
                <div className="text-sm font-semibold text-gray-900">{a.action}</div>
                <div className="text-xs text-gray-400 mt-1">Due: {a.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department performance */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Performance by Department</h2>
        </div>
        <div className="p-5 space-y-4">
          {depts.map(d => (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <div className={`w-2.5 h-2.5 rounded-full ${d.color}`}/>
                  {d.name}
                  <span className="text-xs font-normal text-gray-400">({d.students} students)</span>
                </div>
                <span className="text-sm font-bold">{d.score}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.score}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Quick Actions</h2>
        </div>
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon, onClick }) => (
            <button key={label} onClick={onClick}
              className="flex items-center gap-2.5 p-3.5 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-left transition-all">
              {icon}
              <span className="text-sm font-semibold text-gray-800">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {summaryCards.map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold">{section.title}</h2>
            </div>
            <div className="p-4 space-y-3">
              {section.rows.map(([label, value, pct, color]: any, idx: any) => (
                <div key={`${section.title}-${idx}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{label as string}</span>
                    <span className={`font-bold ${(color as string)?.startsWith('text-') ? color : 'text-gray-900'}`}>
                      {value as string}
                    </span>
                  </div>
                  {pct !== null && (
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${(color as string)?.startsWith('bg-') ? color : 'bg-blue-600'}`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}