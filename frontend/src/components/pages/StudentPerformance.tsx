import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import { logsAPI, assessmentsAPI } from '../../api/services'

interface Log { id: number; week_number: number; status: string; submitted_at: string | null }
interface Assessment { id: number; marks: number; feedback: string; log: number; assessed_at: string }

export default function StudentPerformance() {
  const [logs, setLogs] = useState<Log[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [lRes, aRes] = await Promise.all([
          logsAPI.list(),
          assessmentsAPI.list(),
        ])
        setLogs(lRes.data.results ?? lRes.data)
        setAssessments(aRes.data.results ?? aRes.data)
      } catch {}
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const approved  = logs.filter(l => l.status === 'approved').length
  const submitted = logs.filter(l => l.status !== 'draft').length
  const avgMarks  = assessments.length
    ? Math.round(assessments.reduce((a, x) => a + x.marks, 0) / assessments.length)
    : 0

  // Build bar chart data from assessments
  const chartData = assessments.slice(-6).map(a => ({
    label: `W${a.log}`,
    value: a.marks,
  }))
  const maxVal = chartData.length ? Math.max(...chartData.map(d => d.value), 1) : 1

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader size={16} className="animate-spin"/> Loading performance…
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ['Avg Assessment',  avgMarks + '%',   'text-blue-600'  ],
          ['Logs Submitted',  submitted + '',    'text-green-600' ],
          ['Logs Approved',   approved + '',     'text-violet-600'],
          ['Assessments',     assessments.length + '', 'text-amber-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Assessment Scores Trend</h2>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-4 h-44">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-600">{d.value}%</span>
                  <div
                    className={`w-full rounded-t-lg ${i === chartData.length - 1 ? 'bg-blue-600' : 'bg-blue-100'}`}
                    style={{ height: (d.value / maxVal) * 140 }}
                  />
                  <span className="text-xs text-gray-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log status breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Log Status Breakdown</h2>
        </div>
        <div className="p-5 space-y-4">
          {(['draft', 'submitted', 'reviewed', 'approved'] as const).map(status => {
            const count = logs.filter(l => l.status === status).length
            const pct = logs.length ? Math.round((count / logs.length) * 100) : 0
            const colors: Record<string, string> = {
              draft: 'bg-gray-400', submitted: 'bg-blue-500',
              reviewed: 'bg-violet-500', approved: 'bg-green-500',
            }
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 capitalize">{status}</span>
                  <span className="font-bold">{count} log{count !== 1 ? 's' : ''} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors[status]}`} style={{ width: pct + '%' }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent assessments */}
      {assessments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">Recent Assessments</h2>
          </div>
          <div className="p-4 space-y-3">
            {assessments.slice(0, 5).map(a => (
              <div key={a.id} className="p-4 border-2 border-gray-100 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold">Log #{a.log}</span>
                  <span className="text-sm font-black text-blue-600">{a.marks}/100</span>
                </div>
                {a.feedback && (
                  <p className="text-xs text-gray-500 leading-relaxed">{a.feedback}</p>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(a.assessed_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!assessments.length && !logs.length && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-gray-400 text-sm">No performance data yet.</div>
          <div className="text-gray-300 text-xs mt-1">Start submitting logs to see your performance here.</div>
        </div>
      )}
    </div>
  )
}