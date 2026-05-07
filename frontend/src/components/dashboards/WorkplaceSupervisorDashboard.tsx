import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import client from '../../api/client'

interface Log {
  id: number
  week_number: number
  status: string
  activities: string
  challenges: string
  solutions: string
  submitted_at: string | null
  student: number
}

interface Student {
  id: number
  registration_number: string
  course: string
  user: { id: number; username: string; first_name: string; last_name: string }
}

function ReviewModal({ log, student, onClose, onDone }: {
  log: Log; student: Student | undefined; onClose: () => void; onDone: () => void
}) {
  const [marks, setMarks] = useState(80)
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleApprove = async () => {
    setSaving(true)
    setError('')
    try {
      // Submit assessment
      await client.post('/api/assessments/', { log: log.id, marks, feedback })
      // Review the log
      await client.post(`/api/weekly-logs/${log.id}/review/`)
      onDone()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit review.')
    } finally {
      setSaving(false)
    }
  }

  const name = student ? `${student.user.first_name} ${student.user.last_name}` : `Student #${log.student}`

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">Review — {name} · Week {log.week_number}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>}

          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
            {[['Intern', name], ['Week', 'Week ' + log.week_number],
              ['Submitted', log.submitted_at ? new Date(log.submitted_at).toLocaleDateString() : '—'],
              ['Status', log.status]].map(([l, v]) => (
              <div key={l}><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-semibold mt-0.5 capitalize">{v}</p></div>
            ))}
          </div>

          {[['Activities', log.activities], ['Challenges', log.challenges], ['Solutions', log.solutions]].map(([h, c]) => c ? (
            <div key={h} className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{h}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{c}</p>
            </div>
          ) : null)}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Assessment Marks (out of 100)</label>
            <input type="number" min="0" max="100" value={marks}
              onChange={e => setMarks(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Feedback Comments</label>
            <textarea rows={4} value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Provide feedback on this week's performance…"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleApprove} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Submitting…' : 'Submit Review & Mark Reviewed'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WorkplaceSupervisorDashboard() {
  const [logs, setLogs] = useState<Log[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lRes, sRes] = await Promise.all([
        client.get('/api/weekly-logs/'),
        client.get('/api/students/'),
      ])
      setLogs(lRes.data.results ?? lRes.data)
      setStudents(sRes.data.results ?? sRes.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const getStudent = (id: number) => students.find(s => s.id === id)

  const pending  = logs.filter(l => l.status === 'submitted')
  const reviewed = logs.filter(l => l.status === 'reviewed' || l.status === 'approved').length

  // Unique students
  const myStudents = [...new Map(logs.map(l => [l.student, l])).values()]

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader size={16} className="animate-spin"/> Loading…
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ['Intern Students',   myStudents.length + '',  'text-blue-600'  ],
          ['Pending Reviews',   pending.length + '',     'text-amber-600' ],
          ['Reviewed Logs',     reviewed + '',           'text-green-600' ],
          ['Total Logs',        logs.length + '',        'text-violet-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* My interns */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">My Interns</h2>
          </div>
          <div className="p-4 space-y-3">
            {myStudents.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">No interns assigned yet.</div>
            )}
            {myStudents.map(l => {
              const st = getStudent(l.student)
              const name = st ? `${st.user.first_name} ${st.user.last_name}` : `Student #${l.student}`
              const studentLogs = logs.filter(x => x.student === l.student)
              const pendingCount = studentLogs.filter(x => x.status === 'submitted').length
              return (
                <div key={l.student} className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold">{name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{st?.course ?? 'Unknown course'}</div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><div className="text-xs text-gray-400">Total Logs</div><div className="text-sm font-semibold mt-0.5">{studentLogs.length}</div></div>
                    <div><div className="text-xs text-gray-400">Pending Review</div><div className="text-sm font-semibold mt-0.5">{pendingCount}</div></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending reviews */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Pending Reviews ({pending.length})</h2>
          </div>
          <div className="p-4 space-y-2">
            {pending.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">No pending reviews 🎉</div>
            )}
            {pending.map(log => {
              const st = getStudent(log.student)
              const name = st ? `${st.user.first_name} ${st.user.last_name}` : `Student #${log.student}`
              return (
                <div key={log.id} onClick={() => setSelectedLog(log)}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
                  <div className="text-sm font-bold text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Week {log.week_number}</div>
                  {log.submitted_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      Submitted {new Date(log.submitted_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedLog && (
        <ReviewModal
          log={selectedLog}
          student={getStudent(selectedLog.student)}
          onClose={() => setSelectedLog(null)}
          onDone={fetchData}
        />
      )}
    </div>
  )
}