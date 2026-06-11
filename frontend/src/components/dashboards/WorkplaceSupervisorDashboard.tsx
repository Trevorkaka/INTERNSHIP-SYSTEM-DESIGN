import { useState, useEffect, useMemo } from 'react'
import { Loader, ClipboardCheck, Star, MessageSquare, RefreshCw } from 'lucide-react'
import { logsAPI, assessmentsAPI } from '../../api/services'
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

/**
 * ReviewModal Component
 * Facilitates the workplace supervisor's review of a single weekly internship log.
 * Supervisors grade the student (out of 100), write qualitative feedback,
 * and submit the assessment to mark the log as reviewed.
 */
function ReviewModal({ log, student, onClose, onDone }: {
  log: Log; student?: Student; onClose: () => void; onDone: () => void
}) {
  const [marks, setMarks] = useState(80)
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const name = student
    ? `${student.user.first_name} ${student.user.last_name}`
    : `Student #${log.student}`

  // Submits the workplace grading and comments, then triggers the status transition in the database
  const handleApprove = async () => {
    if (!feedback.trim()) { setError('Please provide feedback comments.'); return }
    setSaving(true); setError('')
    try {
      await assessmentsAPI.create({ log: log.id, marks, feedback })
      await logsAPI.review(log.id)
      onDone(); onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to submit review.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">Review Log — {name} · Week {log.week_number}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>}

          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
            {[['Intern', name], ['Week', 'Week ' + log.week_number],
              ['Submitted', log.submitted_at ? new Date(log.submitted_at).toLocaleDateString() : '—'],
              ['Status', log.status]].map(([l, v]) => (
              <div key={l as string}>
                <p className="text-xs text-gray-400">{l}</p>
                <p className="text-sm font-semibold mt-0.5 capitalize">{v}</p>
              </div>
            ))}
          </div>

          {([['Activities', log.activities], ['Challenges', log.challenges], ['Solutions', log.solutions]] as [string, string][]).map(([h, c]) =>
            c ? (
              <div key={h} className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{h}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{c}</p>
              </div>
            ) : null
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Assessment Marks (out of 100)</label>
            <input type="number" min="0" max="100" value={marks}
              onChange={e => setMarks(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Feedback Comments <span className="text-red-500">*</span></label>
            <textarea rows={4} value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Provide specific feedback on this week's performance…"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"/>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleApprove} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * WorkplaceSupervisorDashboard Component
 * Renders the dashboard for industry supervisor mentors. Includes:
 * - Summary statistics (assigned interns, pending logbook reviews).
 * - Intern directories with aggregated weekly metrics.
 * - Drilldown review actions.
 */
export default function WorkplaceSupervisorDashboard() {
  const [logs, setLogs] = useState<Log[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true); setError('')
    try {
      const [lRes, sRes] = await Promise.all([
        client.get('/api/weekly-logs/'),
        client.get('/api/students/'),
      ])
      setLogs(lRes.data.results ?? lRes.data)
      setStudents(sRes.data.results ?? sRes.data)
    } catch (err: any) {
      setError('Failed to load data: ' + (err.response?.data?.detail || err.message))
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const getStudent = (id: number) => students.find(s => s.id === id)

  // Memoize basic statistics and unique intern listings to optimize component re-render schedules.
  const { pending, reviewed, uniqueStudentIds } = useMemo(() => {
    return {
      pending: logs.filter(l => l.status === 'submitted'),
      reviewed: logs.filter(l => ['reviewed', 'approved'].includes(l.status)).length,
      uniqueStudentIds: [...new Set(logs.map(l => l.student))]
    }
  }, [logs])

  // Precompute aggregated stats for interns in real-time to prevent slow, layout-blocking O(N) tasks.
  const internsWithStats = useMemo(() => {
    return uniqueStudentIds.map(sid => {
      const st = students.find(s => s.id === sid)
      const name = st ? `${st.user.first_name} ${st.user.last_name}` : `Student #${sid}`
      const studentLogs = logs.filter(l => l.student === sid)
      const pendingCount = studentLogs.filter(l => l.status === 'submitted').length
      const approvedCount = studentLogs.filter(l => l.status === 'approved').length
      return {
        sid,
        st,
        name,
        studentLogs,
        pendingCount,
        approvedCount
      }
    })
  }, [uniqueStudentIds, students, logs])

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader size={16} className="animate-spin"/> Loading dashboard…
    </div>
  )

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center justify-between">
          {error}
          <button onClick={fetchData} className="flex items-center gap-1 text-xs font-semibold hover:underline">
            <RefreshCw size={12}/> Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ['My Interns',      uniqueStudentIds.length + '', 'text-blue-600'  ],
          ['Pending Reviews', pending.length + '',          'text-amber-600' ],
          ['Reviewed Logs',   reviewed + '',                'text-green-600' ],
          ['Total Logs',      logs.length + '',             'text-violet-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4">
        {/* Interns */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">My Interns</h2>
          </div>
          <div className="p-4 space-y-3">
            {uniqueStudentIds.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                No interns assigned yet. Make sure the admin has linked students to you.
              </div>
            )}
            {internsWithStats.map(intern => {
              return (
                <div key={intern.sid} className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold">{intern.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{intern.st?.course ?? '—'} · {intern.st?.registration_number ?? '—'}</div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><div className="text-gray-400">Total Logs</div><div className="font-semibold mt-0.5">{intern.studentLogs.length}</div></div>
                    <div><div className="text-gray-400">Pending</div><div className="font-semibold mt-0.5 text-amber-600">{intern.pendingCount}</div></div>
                    <div><div className="text-gray-400">Approved</div><div className="font-semibold mt-0.5 text-green-600">{intern.approvedCount}</div></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending reviews */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">
              Pending Reviews
              {pending.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{pending.length}</span>
              )}
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {pending.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                {logs.length === 0 ? 'No logs submitted yet.' : 'All caught up! 🎉'}
              </div>
            )}
            {pending.map(log => {
              const st = getStudent(log.student)
              const name = st ? `${st.user.first_name} ${st.user.last_name}` : `Student #${log.student}`
              return (
                <div key={log.id} onClick={() => setSelectedLog(log)}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all">
                  <div className="text-sm font-bold text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Week {log.week_number}</div>
                  {log.submitted_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      Submitted {new Date(log.submitted_at).toLocaleDateString()}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-blue-600 font-semibold">Click to review →</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Quick Actions</h2>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {[
            ['Review Activity Logs', <ClipboardCheck size={15} className="text-blue-600"/>, () => pending[0] && setSelectedLog(pending[0])],
            ['Submit Performance Review', <Star size={15} className="text-blue-600"/>, () => pending[0] && setSelectedLog(pending[0])],
            ['Send Feedback', <MessageSquare size={15} className="text-blue-600"/>, () => pending[0] && setSelectedLog(pending[0])],
          ].map(([label, icon]) => (
            <button key={label as string}
              className="flex items-center gap-2.5 p-3.5 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-left transition-all">
              {icon}
              <span className="text-sm font-semibold text-gray-800">{label}</span>
            </button>
          ))}
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