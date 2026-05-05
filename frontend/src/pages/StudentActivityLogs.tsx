import { useState } from 'react'
import { Search, AlertCircle } from 'lucide-react'

interface Log {
  id: number
  week: string
  date: string
  hours: number
  status: string
  supervisor: string
  activities: string
  challenges: string
  solutions: string
  submitted: string | null
  reviewed: string | null
  comments: string | null
  rating: number | null
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    approved:           'bg-green-100 text-green-700',
    submitted:          'bg-blue-100 text-blue-700',
    pending:            'bg-yellow-100 text-yellow-700',
    reviewed:           'bg-blue-100 text-blue-700',
    draft:              'bg-gray-100 text-gray-500',
    revision_requested: 'bg-red-100 text-red-700',
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
            <input type="number" placeholder="e.g. 13" min="1" max="52"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
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
            <textarea rows={4} placeholder="Describe your activities and responsibilities this week…"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Challenges Faced</label>
            <textarea rows={3} placeholder="What challenges did you encounter?"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Solutions & Learning Outcomes</label>
            <textarea rows={3} placeholder="How did you resolve challenges? What did you learn?"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
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

function DetailModal({ log, onClose }: { log: Log; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">{log.week} — Detail</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Meta grid */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
            {[
              ['Period',     log.date],
              ['Hours',      log.hours + 'h'],
              ['Status',     log.status.replace('_', ' ')],
              ['Supervisor', log.supervisor],
              ['Submitted',  log.submitted ?? '—'],
              ['Reviewed',   log.reviewed  ?? '—'],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-xs text-gray-400">{l}</div>
                <div className="text-sm font-semibold mt-0.5 capitalize">{v}</div>
              </div>
            ))}
          </div>

          {/* Content sections */}
          {([
            ['Activities & Tasks', log.activities],
            ['Challenges Faced',   log.challenges],
            ['Solutions & Outcomes', log.solutions],
          ] as [string, string][]).map(([heading, content]) => content ? (
            <div key={heading}>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{heading}</div>
              <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">{content}</div>
            </div>
          ) : null)}

          {/* Feedback */}
          {log.comments && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1.5">Supervisor Feedback</div>
              <div className="text-sm text-green-800 leading-relaxed">{log.comments}</div>
              {log.rating && (
                <div className="mt-2 text-sm text-green-600">{'⭐'.repeat(log.rating)} ({log.rating}/5)</div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Close</button>
          {log.status === 'draft' && (
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Submit Log</button>
          )}
        </div>
      </div>
    </div>
  )
}

const LOGS: Log[] = [
  { id: 1, week: 'Week 12', date: '28 Apr – 2 May 2026', hours: 40, status: 'approved',  supervisor: 'Sarah Martinez', activities: 'Developed JWT authentication module. Implemented token refresh rotation. Participated in code reviews.', challenges: 'Understanding refresh token lifecycle.', solutions: 'Studied OAuth 2.0 spec and discussed with senior dev.', submitted: '3 May 2026',   reviewed: '4 May 2026',   comments: 'Excellent work. Strong security understanding.', rating: 5 },
  { id: 2, week: 'Week 11', date: '21–25 Apr 2026',       hours: 38, status: 'approved',  supervisor: 'Sarah Martinez', activities: 'UI components for dashboard. Responsive design. Bug fixes in form validation.', challenges: 'Cross-browser CSS inconsistencies.', solutions: 'Used CSS reset and tested on multiple browsers.', submitted: '27 Apr 2026',  reviewed: '28 Apr 2026',  comments: 'Good progress. UI looks professional.', rating: 4 },
  { id: 3, week: 'Week 10', date: '14–18 Apr 2026',       hours: 40, status: 'pending',   supervisor: 'Sarah Martinez', activities: 'Sprint planning. Database schema design. REST API endpoints.', challenges: 'Designing normalized schema.', solutions: 'Referred to ER diagram best practices.', submitted: '20 Apr 2026',  reviewed: null,            comments: null, rating: null },
  { id: 4, week: 'Week 9',  date: '7–11 Apr 2026',        hours: 42, status: 'revision_requested', supervisor: 'Sarah Martinez', activities: 'Payment gateway integration.', challenges: 'API rate limiting.', solutions: 'Implemented exponential backoff.', submitted: '13 Apr 2026',  reviewed: '14 Apr 2026',  comments: 'Please add more detail about specific integration challenges.', rating: null },
  { id: 5, week: 'Week 8',  date: '31 Mar – 4 Apr 2026',  hours: 38, status: 'draft',     supervisor: 'Sarah Martinez', activities: '', challenges: '', solutions: '', submitted: null, reviewed: null, comments: null, rating: null },
]

export default function StudentActivityLogs() {
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<Log | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = LOGS.filter(l =>
    (filter === 'all' || l.status === filter) &&
    (l.week.toLowerCase().includes(search.toLowerCase()) ||
     l.activities.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-end">
        <button onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + New Log
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search logs…"
            className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white transition-colors"/>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white cursor-pointer">
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="revision_requested">Revision Requested</option>
        </select>
      </div>

      {/* Log list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">No logs found</div>
          )}
          {filtered.map(log => (
            <div key={log.id} onClick={() => setSelected(log)}
              className="p-4 border-2 border-gray-100 hover:border-blue-300 hover:shadow-sm rounded-xl cursor-pointer transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold">{log.week}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">{log.hours}h</span>
                  <span className={statusBadge(log.status)}>{log.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 mb-1.5">{log.date}</div>
              {log.activities && (
                <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">{log.activities}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showNew   && <NewLogModal onClose={() => setShowNew(false)} />}
      {selected  && <DetailModal log={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
