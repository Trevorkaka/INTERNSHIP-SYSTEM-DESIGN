import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import { evaluationsAPI } from '../../api/services'

interface Evaluation {
  id: number
  score: number
  feedback: string
  created_at: string
  criteria: number
  log: number
  evaluator: number
}

interface Criteria {
  id: number
  name: string
  max_score: number
}

export default function StudentEvaluations() {
  const [evals, setEvals] = useState<Evaluation[]>([])
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [evRes, crRes] = await Promise.all([
          evaluationsAPI.list(),
          evaluationsAPI.criteriaList(),
        ])
        setEvals(evRes.data.results ?? evRes.data)
        setCriteria(crRes.data.results ?? crRes.data)
      } catch {
        setError('Failed to load evaluations.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const getCriteriaName = (id: number) =>
    criteria.find(c => c.id === id)?.name ?? `Criteria #${id}`

  const getCriteriaMax = (id: number) =>
    criteria.find(c => c.id === id)?.max_score ?? 100

  const avgScore = evals.length
    ? Math.round(evals.reduce((a, e) => a + e.score, 0) / evals.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['Overall Score',        avgScore + '%',       'text-blue-600'  ],
          ['Evaluations Received', evals.length + '',    'text-green-600' ],
          ['Criteria Tracked',     criteria.length + '', 'text-violet-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Loading / error */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader size={16} className="animate-spin"/> Loading evaluations…
        </div>
      )}
      {error && <div className="text-center text-red-500 py-10">{error}</div>}

      {/* No data */}
      {!loading && !error && evals.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-gray-400 text-sm">No evaluations yet.</div>
          <div className="text-gray-300 text-xs mt-1">Your supervisors will submit evaluations here.</div>
        </div>
      )}

      {/* Evaluation cards */}
      {!loading && evals.map(ev => {
        const max = getCriteriaMax(ev.criteria)
        const pct = Math.round((ev.score / max) * 100)
        return (
          <div key={ev.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold">{getCriteriaName(ev.criteria)}</h2>
                <div className="text-xs text-gray-400 mt-1">
                  Log #{ev.log} · {new Date(ev.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black tracking-tight text-blue-600">{ev.score}/{max}</div>
                <div className="text-xs text-gray-400 mt-0.5">{pct}%</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{getCriteriaName(ev.criteria)}</span>
                  <span className="font-bold">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: pct + '%' }}/>
                </div>
              </div>
              {ev.feedback && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Feedback</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{ev.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}