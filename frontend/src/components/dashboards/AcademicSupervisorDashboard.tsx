import { useState, useEffect } from 'react'
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
 
  const studentLogs = logs.filter(l => l.student === student.id && l.status === 'submitted')
  const name = `${student.user.first_name} ${student.user.last_name}`
 
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
 
export default function AcademicSupervisorDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
 
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
 
  const pendingLogs = logs.filter(l => l.status === 'submitted')
  const reviewedLogs = logs.filter(l => ['reviewed', 'approved'].includes(l.status)).length
 
  const quickActions = [
    { label: 'Evaluate Student',     icon: <ClipboardCheck size={15} className="text-blue-600" /> },
    { label: 'Review Activity Logs', icon: <FileText size={15} className="text-blue-600" /> },
    { label: 'View Analytics',       icon: <BarChart2 size={15} className="text-blue-600" /> },
    { label: 'Generate Report',      icon: <Download size={15} className="text-blue-600" /> },
  ]
 
  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader size={16} className="animate-spin" /> Loading…
    </div>
  )