import { useState } from 'react'
import { Clock, FileText, TrendingUp, CheckSquare, AlertCircle } from 'lucide-react'

interface Props {
  setPage: (page: string) => void
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    submitted: 'bg-blue-100 text-blue-700',
    pending:   'bg-yellow-100 text-yellow-700',
    reviewed:  'bg-blue-100 text-blue-700',
    draft:     'bg-gray-100 text-gray-500',
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`
}

function NewLogModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">New Activity Log</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0"/>
            <p className="text-xs text-blue-700">Logs must be submitted weekly and approved by your workplace supervisor before the deadline.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Week Number</label>
            <input type="number" placeholder="e.g. 13" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Start Date</label>
              <input type="date" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">End Date</label>
              <input type="date" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Activities & Tasks Completed</label>
            <textarea rows={4} placeholder="Describe your activities and responsibilities this week…" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Challenges Faced</label>
            <textarea rows={3} placeholder="What challenges did you encounter?" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Solutions & Learning Outcomes</label>
            <textarea rows={3} placeholder="How did you resolve challenges? What did you learn?" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Save as Draft</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Submit Log</button>
        </div>
      </div>
    </div>
  )
}

export default function StudentDashboard({ setPage }: Props) {
  const [showModal, setShowModal] = useState(false)

  const stats = [
    { label: 'Total Hours',      value: '156',  sub: '+12 this week',        color: 'text-blue-600',   bg: 'bg-blue-50',   icon: <Clock size={18} className="text-blue-600"/> },
    { label: 'Logs Submitted',   value: '24',   sub: '3 pending review',     color: 'text-green-600',  bg: 'bg-green-50',  icon: <FileText size={18} className="text-green-600"/> },
    { label: 'Performance',      value: '87%',  sub: '+5% from last month',  color: 'text-violet-600', bg: 'bg-violet-50', icon: <TrendingUp size={18} className="text-violet-600"/> },
    { label: 'Completed Tasks',  value: '18/20',sub: '90% completion rate',  color: 'text-amber-600',  bg: 'bg-amber-50',  icon: <CheckSquare size={18} className="text-amber-600"/> },
  ]

  const logs = [
    { id: 1, week: 'Week 12', date: '28 Apr – 2 May 2026', hours: 40, status: 'approved' },
    { id: 2, week: 'Week 11', date: '21–25 Apr 2026',       hours: 38, status: 'approved' },
    { id: 3, week: 'Week 10', date: '14–18 Apr 2026',       hours: 40, status: 'pending'  },
  ]

  const deadlines = [
    { task: 'Submit Week 13 Activity Log',         due: '9 May 2026',  priority: 'high'   },
    { task: 'Complete Mid-Term Self-Evaluation',   due: '15 May 2026', priority: 'medium' },
    { task: 'Review Supervisor Feedback',          due: '20 May 2026', priority: 'low'    },
  ]

  const placementDetails = [
    ['Company',              'Tech Innovations Inc.'],
    ['Position',             'Software Development Intern'],
    ['Duration',             'Jan 15 – Jun 15, 2026'],
    ['Workplace Supervisor', 'Sarah Martinez'],
    ['Academic Supervisor',  'Dr. Michael Chen'],
    ['Required Hours',       '320 hours'],
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Logs + Deadlines */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Recent Activity Logs</h2>
            <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
              + New Log
            </button>
          </div>
          <div className="p-4 space-y-2">
            {logs.map(log => (
              <div key={log.id} onClick={() => setPage('activities')}
                className="p-4 border-2 border-gray-100 hover:border-blue-300 hover:shadow-sm rounded-xl cursor-pointer transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold">{log.week}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">{log.hours}h</span>
                    <span className={statusBadge(log.status)}>{log.status}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">{log.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Upcoming Deadlines</h2>
          </div>
          <div className="p-4 space-y-4">
            {deadlines.map((d, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${d.priority === 'high' ? 'bg-red-500' : d.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}/>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{d.task}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Due {d.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Placement info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Current Internship</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-5 mb-5">
            {placementDetails.map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className="text-sm font-semibold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Overall Progress</span>
              <span className="font-bold">48.75%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '48.75%' }}/>
            </div>
          </div>
        </div>
      </div>

      {showModal && <NewLogModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
