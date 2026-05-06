import { useState } from 'react'
import { Users, ClipboardCheck, Star, MessageSquare } from 'lucide-react'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    approved:  'bg-green-100 text-green-700',
    reviewed:  'bg-blue-100 text-blue-700',
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`
}

interface PendingLog {
  id: number
  intern: string
  week: string
  date: string
  hours: number
  submitted: string
}

function ReviewModal({ log, onClose }: { log: PendingLog; onClose: () => void }) {
  const [rating, setRating] = useState(0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">Review — {log.intern} · {log.week}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
            {[['Intern', log.intern], ['Week', log.week], ['Period', log.date], ['Hours', log.hours + 'h']].map(([l, v]) => (
              <div key={l}>
                <p className="text-xs text-gray-400">{l}</p>
                <p className="text-sm font-semibold mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Log content */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Activities This Week</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Developed and tested new user authentication module using React and Django.
              Implemented JWT token-based authentication with refresh token rotation.
              Collaborated with senior developers on code reviews and debugging sessions.
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Performance Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)}
                  className={`w-10 h-10 rounded-xl border-2 text-lg transition-all
                    ${rating >= n ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:border-amber-300'}`}>
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Criteria */}
          <div className="grid grid-cols-2 gap-3">
            {[['Technical Skills'], ['Communication'], ['Initiative'], ['Teamwork']].map(([label]) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Satisfactory</option>
                  <option>Needs Improvement</option>
                </select>
              </div>
            ))}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Supervisor Comments</label>
            <textarea rows={4} placeholder="Provide feedback on performance, strengths, and areas for improvement…"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Request Revision</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">Approve & Submit</button>
        </div>
      </div>
    </div>
  )
}

export default function WorkplaceSupervisorDashboard() {
  const [selectedLog, setSelectedLog] = useState<PendingLog | null>(null)

  const stats = [
    { label: 'Active Interns',     value: '5',   color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Pending Reviews',    value: '8',   color: 'text-amber-600',  bg: 'bg-amber-50'  },
    { label: 'Completed Reviews',  value: '42',  color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Avg Performance',    value: '85%', color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  const interns = [
    { id: '1', name: 'Alex Johnson',   position: 'Software Development Intern', hours: 156, pending: 1, score: 87, status: 'active' },
    { id: '2', name: 'Emily Davis',    position: 'Data Science Intern',         hours: 148, pending: 2, score: 92, status: 'active' },
    { id: '3', name: 'Michael Brown',  position: 'UX Design Intern',            hours: 128, pending: 0, score: 78, status: 'active' },
  ]

  const pending: PendingLog[] = [
    { id: 1, intern: 'Alex Johnson',  week: 'Week 12', date: '28 Apr – 2 May', hours: 40, submitted: '3 May 2026'  },
    { id: 2, intern: 'Emily Davis',   week: 'Week 12', date: '28 Apr – 2 May', hours: 38, submitted: '3 May 2026'  },
    { id: 3, intern: 'Emily Davis',   week: 'Week 11', date: '21–25 Apr',      hours: 40, submitted: '27 Apr 2026' },
  ]

  const quickActions = [
    { label: 'Review Activity Logs',      icon: <ClipboardCheck size={15} className="text-blue-600"/> },
    { label: 'Submit Performance Review', icon: <Star size={15} className="text-blue-600"/> },
    { label: 'Send Feedback',             icon: <MessageSquare size={15} className="text-blue-600"/> },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Interns */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">My Interns</h2>
          </div>
          <div className="p-4 space-y-3">
            {interns.map(intern => (
              <div key={intern.id} className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold">{intern.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{intern.position}</div>
                  </div>
                  <span className={statusBadge(intern.status)}>{intern.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[['Hours', intern.hours + 'h'], ['Performance', intern.score + '%'], ['Pending', intern.pending + ' log' + (intern.pending !== 1 ? 's' : '')]].map(([l, v]) => (
                    <div key={l}>
                      <div className="text-xs text-gray-400">{l}</div>
                      <div className="text-sm font-semibold mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending reviews */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Pending Reviews</h2>
          </div>
          <div className="p-4 space-y-2">
            {pending.map(r => (
              <div key={r.id} onClick={() => setSelectedLog(r)}
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
                <div className="text-sm font-bold text-gray-900">{r.intern}</div>
                <div className="text-xs text-gray-500 mt-0.5">{r.week} · {r.date}</div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>{r.hours}h</span>
                  <span>Submitted {r.submitted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Quick Actions</h2>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {quickActions.map(({ label, icon }) => (
            <button key={label} className="flex items-center gap-2.5 p-3.5 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-left transition-all">
              {icon}
              <span className="text-sm font-semibold text-gray-800">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedLog && <ReviewModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  )
}
