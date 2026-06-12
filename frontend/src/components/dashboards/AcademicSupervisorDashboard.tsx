import { useState, useEffect, useMemo } from 'react'
import { Loader, ClipboardCheck, FileText, BarChart2, Download } from 'lucide-react'
import { evaluationsAPI } from '../../api/services'
import client from '../../api/client'

interface Student {
  id: number
  registration_number: string
  course: string
  year_of_study: number
  user: { id: number; username: string; first_name: string; last_name: string }
}
 
interface Log {
  id: number
  week_number: number
  status: string
  student: number
  submitted_at: string | null
}
 
interface Criteria {
  id: number
  name: string
  max_score: number
}

/**
 * EvalModal Component
 * Allows academic supervisors to score and evaluate a specific submitted weekly log book
 * against academic rubric criteria.
 * Once successfully saved, it requests the backend to review the corresponding log.
 */
function EvalModal({ student, logs, criteria, onClose, onDone }: {
  student: Student; logs: Log[]; criteria: Criteria[];
  onClose: () => void; onDone: () => void
}) {
  const [selectedLog, setSelectedLog] = useState<number | ''>('')
  const [selectedCriteria, setSelectedCriteria] = useState<number | ''>('')
  const [score, setScore] = useState(80)
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Filter for logs belonging to this specific student that have been submitted but not yet fully evaluated.
  const studentLogs = logs.filter(l => l.student === student.id && l.status === 'submitted')
  const name = `${student.user.first_name} ${student.user.last_name}`
  
  // Submits the evaluation record to the backend and marks the weekly log as reviewed.
  const handleSubmit = async () => {
    if (!selectedLog || !selectedCriteria) { setError('Please select a log and criteria.'); return }
    setSaving(true)
    setError('')
    try {
      await evaluationsAPI.create({
        log: Number(selectedLog),
        criteria: Number(selectedCriteria),
        score,
        feedback,
      })
      await client.post(`/api/weekly-logs/${selectedLog}/review/`)
      onDone()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit evaluation.')
    } finally {
      setSaving(false)
    }
  }
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">Evaluate — {name}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>}
 
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Select Log to Evaluate</label>
            <select value={selectedLog} onChange={e => setSelectedLog(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors">
              <option value="">— choose a log —</option>
              {studentLogs.map(l => (
                <option key={l.id} value={l.id}>Week {l.week_number} (submitted)</option>
              ))}
            </select>
            {studentLogs.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No submitted logs available for this student.</p>
            )}
          </div>
 
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Evaluation Criteria</label>
            <select value={selectedCriteria} onChange={e => setSelectedCriteria(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors">
              <option value="">— choose criteria —</option>
              {criteria.map(c => (
                <option key={c.id} value={c.id}>{c.name} (max {c.max_score})</option>
              ))}
            </select>
          </div>
 
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Score (max {criteria.find(c => c.id === selectedCriteria)?.max_score ?? 100})
            </label>
            <input type="number" min="0"
              max={criteria.find(c => c.id === selectedCriteria)?.max_score ?? 100}
              value={score} onChange={e => setScore(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Feedback</label>
            <textarea rows={4} value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Provide academic feedback and recommendations…"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Submitting…' : 'Submit Evaluation'}
          </button>
        </div>
      </div>
    </div>
  )
}
 
/**
 * AcademicSupervisorDashboard Component
 * Core command center for academic mentors. Enables:
 * - Tracking assigned students and their progress metrics.
 * - Reviewing and scoring students' weekly submissions with custom rubrics.
 * - Pre-rendering computed metrics using react useMemo hooks to prevent performance lags.
 */
export default function AcademicSupervisorDashboard({ filter = 'all' }: { filter?: string }) {
  const [students, setStudents] = useState<Student[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const recent = [
    { action: 'Submitted evaluation for Emily Davis',     time: '2 hours ago' },
    { action: 'Reviewed activity logs for Alex Johnson',  time: '5 hours ago' },
    { action: 'Approved final report for Michael Brown',  time: '1 day ago'   },
  ]

  const quickActions = [
    { label: 'Evaluate Student',      icon: <ClipboardCheck size={15} className="text-blue-600"/>, action: () => students[0] && setSelectedStudent(students[0]) },
    { label: 'Review Activity Logs',  icon: <FileText size={15} className="text-blue-600"/>,       action: () => students[0] && setSelectedStudent(students[0]) },
    { label: 'View Analytics',        icon: <BarChart2 size={15} className="text-blue-600"/>,       action: () => {} },
    { label: 'Generate Report',       icon: <Download size={15} className="text-blue-600"/>,        action: () => {} },
  ]

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sRes, lRes, cRes] = await Promise.all([
        client.get('/api/students/'),
        client.get('/api/weekly-logs/'),
        evaluationsAPI.criteriaList(),
      ])
      setStudents(sRes.data.results ?? sRes.data)
      setLogs(lRes.data.results ?? lRes.data)
      setCriteria(cRes.data.results ?? cRes.data)
    } catch {}
    finally { setLoading(false) }
  }
 
  useEffect(() => { fetchData() }, [])
 
  // Memoize log statistics to prevent unnecessary array filtering operations on modal toggles/re-renders.
  const { pendingLogs, reviewedLogs } = useMemo(() => {
    return {
      pendingLogs: logs.filter(l => l.status === 'submitted'),
      reviewedLogs: logs.filter(l => ['reviewed', 'approved'].includes(l.status)).length
    }
  }, [logs])

  // Memoize student statistics calculation to avoid nested iteration loops on every re-render.
  // Precomputes individual student progress percentage based on approved logs.
  const studentsWithStats = useMemo(() => {
    return students.map(s => {
      const name = `${s.user.first_name} ${s.user.last_name}`
      const studentLogs = logs.filter(l => l.student === s.id)
      const submittedCount = studentLogs.filter(l => l.status === 'submitted').length
      const approvedCount  = studentLogs.filter(l => l.status === 'approved').length
      const progress = studentLogs.length
        ? Math.round((approvedCount / studentLogs.length) * 100) : 0
      return {
        ...s,
        name,
        studentLogs,
        submittedCount,
        approvedCount,
        progress
      }
    })
  }, [students, logs])
 
  //const quickActions = [
   // { label: 'Evaluate Student',     icon: <ClipboardCheck size={15} className="text-blue-600" /> },
   // { label: 'Review Activity Logs', icon: <FileText size={15} className="text-blue-600" /> },
    //{ label: 'View Analytics',       icon: <BarChart2 size={15} className="text-blue-600" /> },
    //{ label: 'Generate Report',      icon: <Download size={15} className="text-blue-600" /> },
  //]
 
  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader size={16} className="animate-spin" /> Loading…
    </div>
  )

  return (
    <div className="space-y-6">
 
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ['My Students',   students.length + '',    'text-blue-600'  ],
          ['Pending Evals', pendingLogs.length + '',  'text-amber-600' ],
          ['Reviewed Logs', reviewedLogs + '',         'text-green-600' ],
          ['Criteria Set',  criteria.length + '',      'text-violet-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
 
  {/* Main grid - students view */}
  {(filter === 'all' || filter === 'students') && (
    <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Left Column: My Students list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">My Students</h2>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto">
            {students.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">No students assigned yet.</div>
            )}
            {studentsWithStats.map(s => {
              return (
                <div key={s.id} className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold">{s.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.course} · Year {s.year_of_study}</div>
                      <div className="text-xs text-gray-300 mt-0.5">{s.registration_number}</div>
                    </div>
                    <button onClick={() => setSelectedStudent(s)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                      Evaluate
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                    <div><div className="text-gray-400">Total Logs</div><div className="font-semibold mt-0.5">{s.studentLogs.length}</div></div>
                    <div><div className="text-gray-400">Pending</div><div className="font-semibold mt-0.5 text-amber-600">{s.submittedCount}</div></div>
                    <div><div className="text-gray-400">Approved</div><div className="font-semibold mt-0.5 text-green-600">{s.approvedCount}</div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Approval Progress</span>
                      <span className="font-bold">{s.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: s.progress + '%' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Pending submissions & Recent activity */}
        <div className="flex flex-col gap-4">
          {/* Pending submissions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold">Pending Submissions ({pendingLogs.length})</h2>
            </div>
            <div className="p-4 space-y-2">
              {pendingLogs.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">All caught up! 🎉</div>
              )}
              {pendingLogs.map(log => {
                const st = students.find(s => s.id === log.student)
                const name = st ? `${st.user.first_name} ${st.user.last_name}` : `Student #${log.student}`
                return (
                  <div key={log.id}
                    onClick={() => { const s = students.find(x => x.id === log.student); if (s) setSelectedStudent(s) }}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
                    <div className="text-sm font-bold">{name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Week {log.week_number}</div>
                    {log.submitted_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(log.submitted_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {recent.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"/>
                  <div>
                    <div className="text-sm text-gray-800">{r.action}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{r.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
        </div>
      </div>
  )}

  {/* Evaluations view */}
  {filter === 'evaluations' && (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100"></div>
        <h2 className="text-sm font-bold">Pending Evaluations ({pendingLogs.length})</h2>
    </div>
    <div className="p-4 space-y-3">
      {pendingLogs.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-8">No pending evaluations. All caught up! 🎉</div>
      )}
      {pendingLogs.map(log => {
        const st = students.find(s => s.id === log.student)
        const name = st ? `${st.user.first_name} ${st.user.last_name}` : `Student #${log.student}`
         return (
          <div key={log.id}
            onClick={() => { const s = students.find(x => x.id === log.student); if (s) setSelectedStudent(s) }}
            className="p-4 border-2 border-amber-100 hover:border-amber-300 rounded-xl cursor-pointer transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{name}</div>
                <div className="text-xs text-gray-500 mt-0.5">Week {log.week_number}</div>
                {log.submitted_at && (
                   <div className="text-xs text-gray-400 mt-1">
                      Submitted {new Date(log.submitted_at).toLocaleDateString()}
                   </div>
                  )}

              </div>
              <button
                onClick={e => { e.stopPropagation(); const s = students.find(x => x.id === log.student); if (s) setSelectedStudent(s) }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"></button>



  {/* Analytics placeholder */}
  {filter === 'analytics' && (
    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
      <BarChart2 size={40} className="mx-auto mb-3 text-gray-300"/>
      <p className="text-sm font-semibold">Analytics coming soon</p>
    </div>
  )}
  


      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Quick Actions</h2>
        </div>
        <div className="p-4 grid grid-cols-4 gap-3">
          {quickActions.map(({ label, icon, action }) => (
            <button key={label} onClick={action} className="flex items-center gap-2.5 p-3.5 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-left transition-all">
              {icon}
              <span className="text-sm font-semibold text-gray-800">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <EvalModal
          student={selectedStudent}
          logs={logs}
          criteria={criteria}
          onClose={() => setSelectedStudent(null)}
          onDone={fetchData}
        />
      )}
 
    </div>
  )
}