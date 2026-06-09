import { useState, useEffect } from 'react'
import { Loader, ClipboardCheck } from 'lucide-react'
import { evaluationsAPI } from '../api/services'

interface Evaluation {
  id: number
  log: {
    week_number: number
  } | number | any
  criteria: {
    name: string
    max_score: number
  } | number | any
  score: number
  feedback: string
  created_at?: string
}

export default function StudentEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await evaluationsAPI.list()
        setEvaluations(res.data.results ?? res.data)
      } catch {
        setError('Failed to fetch evaluations.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvaluations()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader size={16} className="animate-spin"/> Loading evaluations…
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-950">My Evaluations</h1>
        <p className="text-sm text-gray-500 mt-1">Feedback and performance reviews from your academic supervisors</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {evaluations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          <ClipboardCheck size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-medium">No evaluations received yet.</p>
          <p className="text-xs text-gray-400 mt-1">Once your supervisor reviews and evaluates your weekly logs, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluations.map(ev => {
            const weekNum = typeof ev.log === 'object' && ev.log ? ev.log.week_number : ev.log
            const critName = typeof ev.criteria === 'object' && ev.criteria ? ev.criteria.name : 'Evaluation Criteria'
            const maxScore = typeof ev.criteria === 'object' && ev.criteria ? ev.criteria.max_score : 100
            const pct = Math.round((ev.score / maxScore) * 100)

            return (
              <div key={ev.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between hover:border-blue-200 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                        Week {weekNum} Log
                      </span>
                      <h2 className="text-sm font-bold text-gray-900 mt-2">{critName}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-blue-600">{ev.score}<span className="text-xs text-gray-400 font-normal">/{maxScore}</span></div>
                      <div className="text-xs text-gray-400 font-medium mt-0.5">{pct}%</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3 border border-gray-100 whitespace-pre-line mt-4">
                    {ev.feedback || "No additional feedback provided."}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
