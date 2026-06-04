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
 