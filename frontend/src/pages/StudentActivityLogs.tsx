import { useState, useEffect } from 'react'
import { Search, AlertCircle, Loader } from 'lucide-react'
import { logsAPI } from '../api/services'

interface Log {
  id: number
  week_number: number
  activities: string
  challenges: string
  solutions: string
  status: string
  submitted_at: string | null
  student: number
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

function NewLogModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ week_number: '', activities: '', challenges: '', solutions: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (asDraft: boolean) => {
    if (!form.week_number || !form.activities) {
      setError('Week number and activities are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await logsAPI.create({
        week_number: Number(form.week_number),
        activities:  form.activities,
        challenges:  form.challenges,
        solutions:   form.solutions,
      })
      if (!asDraft) {
        await logsAPI.submit(res.data.id)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save log.')
    } finally {
      setSaving(false)
    }
  }

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
            <p className="text-xs text-blue-700">Logs must be submitted weekly and approved by your supervisor before the deadline.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Week Number</label>
            <input type="number" placeholder="e.g. 13" min="1" max="52"
              value={form.week_number}
              onChange={e => setForm({ ...form, week_number: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Activities & Tasks Completed</label>
            <textarea rows={4} placeholder="Describe your activities and responsibilities this week…"
              value={form.activities}
              onChange={e => setForm({ ...form, activities: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Challenges Faced</label>
            <textarea rows={3} placeholder="What challenges did you encounter?"
              value={form.challenges}
              onChange={e => setForm({ ...form, challenges: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Solutions & Learning Outcomes</label>
            <textarea rows={3} placeholder="How did you resolve challenges? What did you learn?"
              value={form.solutions}
              onChange={e => setForm({ ...form, solutions: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={() => handleSubmit(true)} disabled={saving}
            className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Save as Draft
          </button>
          <button onClick={() => handleSubmit(false)} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Submitting…' : 'Submit Log'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ log, onClose, onRefresh }: { log: Log; onClose: () => void; onRefresh: () => void }) {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await logsAPI.submit(log.id)
      onRefresh()
      onClose()
    } catch {
      alert('Failed to submit log.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">Week {log.week_number} — Detail</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
            {[
              ['Status',    log.status.replace('_', ' ')],
              ['Submitted', log.submitted_at ? new Date(log.submitted_at).toLocaleDateString() : '—'],
              ['Week',      'Week ' + log.week_number],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-xs text-gray-400">{l}</div>
                <div className="text-sm font-semibold mt-0.5 capitalize">{v}</div>
              </div>
            ))}
          </div>

          {([['Activities & Tasks', log.activities], ['Challenges Faced', log.challenges], ['Solutions & Outcomes', log.solutions]] as [string, string][]).map(([heading, content]) =>
            content ? (
              <div key={heading}>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{heading}</div>
                <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">{content}</div>
              </div>
            ) : null
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Close</button>
          {log.status === 'draft' && (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit Log'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StudentActivityLogs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<Log | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter] = useState('all')

  // Debounce search term to prevent network/API flooding on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (filter !== 'all') params.status = filter
      if (debouncedSearch) params.search = debouncedSearch
      const res = await logsAPI.list(params)
      setLogs(res.data.results ?? res.data)
    } catch {
      setError('Failed to load logs. Make sure Django is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [filter, debouncedSearch])

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
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
              <Loader size={16} className="animate-spin"/> Loading logs…
            </div>
          )}
          {error && (
            <div className="text-center text-red-500 text-sm py-10">{error}</div>
          )}
          {!loading && !error && logs.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">
              No logs yet. Click <strong>+ New Log</strong> to create your first one.
            </div>
          )}
          {!loading && logs.map(log => (
            <div key={log.id} onClick={() => setSelected(log)}
              className="p-4 border-2 border-gray-100 hover:border-blue-300 hover:shadow-sm rounded-xl cursor-pointer transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold">Week {log.week_number}</span>
                <span className={statusBadge(log.status)}>{log.status.replace('_', ' ')}</span>
              </div>
              {log.submitted_at && (
                <div className="text-xs text-gray-400 mb-1">
                  Submitted {new Date(log.submitted_at).toLocaleDateString()}
                </div>
              )}
              {log.activities && (
                <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">{log.activities}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showNew  && <NewLogModal onClose={() => setShowNew(false)} onSaved={fetchLogs} />}
      {selected && <DetailModal log={selected} onClose={() => setSelected(null)} onRefresh={fetchLogs} />}
    </div>
  )
}
