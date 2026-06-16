import { useState, useEffect, useMemo } from 'react'
import { Clock, FileText, TrendingUp, CheckSquare, AlertCircle, Loader } from 'lucide-react'
import { logsAPI } from '../../api/services'
import client from '../../api/client'

interface Props {
  setPage: (page: string) => void
}

interface Log {
  id: number
  week_number: number
  status: string
  activities: string
  submitted_at: string | null
}

interface Placement {
  id: number
  company_name: string
  position: string
  start_date: string
  end_date: string
  student: number
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
    try {
      const res = await logsAPI.create({
        week_number: Number(form.week_number),
        activities: form.activities,
        challenges: form.challenges,
        solutions: form.solutions,
      })
      if (!asDraft) await logsAPI.submit(res.data.id)
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
            <p className="text-xs text-blue-700">Submit your log weekly. Your workplace supervisor will review it.</p>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Week Number</label>
            <input type="number" placeholder="e.g. 13" min="1" max="52"
              value={form.week_number}
              onChange={e => setForm({ ...form, week_number: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Activities & Tasks Completed</label>
            <textarea rows={4} placeholder="Describe your activities this week…"
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
            <textarea rows={3} placeholder="How did you resolve challenges?"
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

export default function StudentDashboard({ setPage }: Props) {
  const [logs, setLogs] = useState<Log[]>([])
  const [placement, setPlacement] = useState<Placement | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lRes, pRes] = await Promise.all([
        logsAPI.list(),
        client.get('/api/placements/'),
      ])
      const allLogs = lRes.data.results ?? lRes.data
      setLogs(allLogs)
      const placements = pRes.data.results ?? pRes.data
      if (placements.length) setPlacement(placements[0])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  // Memoize all stat and progress calculations to avoid recalculating on every re-render
  const { submitted, approved, draft, recentLogs, progress, stats } = useMemo(() => {
    const submittedCount = logs.filter(l => l.status !== 'draft').length
    const approvedCount  = logs.filter(l => l.status === 'approved').length
    const draftCount     = logs.filter(l => l.status === 'draft').length
    const recent         = logs.slice(0, 3)
    const prog           = placement
      ? Math.min(100, Math.max(0, Math.round(
          ((Date.now() - new Date(placement.start_date).getTime()) /
           (new Date(placement.end_date).getTime() - new Date(placement.start_date).getTime())) * 100
        )))
      : 0

    const statsList = [
      { label: 'Logs Submitted',  value: submittedCount + '',  sub: draftCount + ' draft',        color: 'text-blue-600',   bg: 'bg-blue-50',   icon: <FileText size={18} className="text-blue-600"/> },
      { label: 'Logs Approved',   value: approvedCount + '',   sub: 'out of ' + logs.length, color: 'text-green-600',  bg: 'bg-green-50',  icon: <CheckSquare size={18} className="text-green-600"/> },
      { label: 'Progress',        value: prog + '%',           sub: 'internship completion',  color: 'text-violet-600', bg: 'bg-violet-50', icon: <TrendingUp size={18} className="text-violet-600"/> },
      { label: 'Total Logs',      value: logs.length + '',    sub: 'all time',              color: 'text-amber-600',  bg: 'bg-amber-50',  icon: <Clock size={18} className="text-amber-600"/> },
    ]

    return {
      submitted: submittedCount,
      approved: approvedCount,
      draft: draftCount,
      recentLogs: recent,
      progress: prog,
      stats: statsList
    }
  }, [logs, placement])

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      submitted: 'bg-blue-100 text-blue-700',
      reviewed: 'bg-blue-100 text-blue-700',
      draft: 'bg-gray-100 text-gray-500',
    }
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`
  }

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
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Logs + quick info */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Recent Activity Logs</h2>
            <div className="flex gap-2">
              <button onClick={() => setPage('activities')} className="px-3 py-1.5 border-2 border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">View All</button>
              <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">+ New Log</button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {recentLogs.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                No logs yet. Click <strong>+ New Log</strong> to get started.
              </div>
            )}
            {recentLogs.map(log => (
              <div key={log.id} onClick={() => setPage('activities')}
                className="p-4 border-2 border-gray-100 hover:border-blue-300 rounded-xl cursor-pointer transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold">Week {log.week_number}</span>
                  <span className={statusBadge(log.status)}>{log.status}</span>
                </div>
                {log.submitted_at && (
                  <div className="text-xs text-gray-400">Submitted {new Date(log.submitted_at).toLocaleDateString()}</div>
                )}
                {log.activities && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">{log.activities}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Log Status Overview</h2>
          </div>
          <div className="p-4 space-y-4">
            {(['draft', 'submitted', 'reviewed', 'approved'] as const).map(status => {
              const count = logs.filter(l => l.status === status).length
              const pct = logs.length ? Math.round((count / logs.length) * 100) : 0
              const colors: Record<string, string> = {
                draft: 'bg-gray-300', submitted: 'bg-blue-500',
                reviewed: 'bg-violet-500', approved: 'bg-green-500',
              }
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500 capitalize font-medium">{status}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[status]}`} style={{ width: pct + '%' }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Placement info */}
      {placement ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Current Internship Placement</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-5 mb-5">
              {[
                ['Company',    placement.company_name],
                ['Position',   placement.position],
                ['Start Date', placement.start_date],
                ['End Date',   placement.end_date],
                ['Progress',   progress + '%'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="text-sm font-semibold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Overall Progress</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: progress + '%' }}/>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-gray-400 text-sm">No internship placement assigned yet.</div>
          <div className="text-gray-300 text-xs mt-1">Contact your administrator to get placed.</div>
        </div>
      )}

      {showModal && <NewLogModal onClose={() => setShowModal(false)} onSaved={fetchData} />}
    </div>
  )
}