import { useState } from 'react'
import { ClipboardCheck, FileText, BarChart2, Download } from 'lucide-react'

function EvalModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">Mid-Term Evaluation — Alex Johnson</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Student info */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
            {[['Student', 'Alex Johnson'], ['Company', 'Tech Innovations Inc.'], ['Position', 'Software Dev Intern']].map(([l, v]) => (
              <div key={l}>
                <p className="text-xs text-gray-400">{l}</p>
                <p className="text-sm font-semibold mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Criteria */}
          <div className="grid grid-cols-2 gap-3">
            {['Learning Objectives Achievement', 'Professional Development', 'Application of Theory', 'Critical Thinking'].map(label => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors">
                  <option>Exceeds Expectations</option>
                  <option>Meets Expectations</option>
                  <option>Partially Meets</option>
                  <option>Does Not Meet</option>
                </select>
              </div>
            ))}
          </div>

          {/* Comments */}
          {['Academic Assessment Comments', 'Strengths Identified', 'Areas for Improvement', 'Recommendations'].map(label => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <textarea rows={3} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors resize-y"
                placeholder={`Enter ${label.toLowerCase()}…`}/>
            </div>
          ))}

          {/* Grade */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Overall Grade</label>
            <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors">
              <option>A — Excellent</option>
              <option>B — Good</option>
              <option>C — Satisfactory</option>
              <option>D — Pass</option>
              <option>F — Fail</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Save as Draft</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Submit Evaluation</button>
        </div>
      </div>
    </div>
  )
}

export default function AcademicSupervisorDashboard() {
  const [showEvalModal, setShowEvalModal] = useState(false)

  const stats = [
    { label: 'Assigned Students',     value: '12', color: 'text-blue-600'   },
    { label: 'Pending Evaluations',   value: '4',  color: 'text-amber-600'  },
    { label: 'Completed Evaluations', value: '28', color: 'text-green-600'  },
    { label: 'Avg Performance',       value: '83%',color: 'text-violet-600' },
  ]

  const students = [
    { id: '1', name: 'Alex Johnson',    company: 'Tech Innovations Inc.',  position: 'Software Dev Intern', progress: 72, score: 87, status: 'on-track' },
    { id: '2', name: 'Sophia Williams', company: 'Digital Solutions Ltd.', position: 'Marketing Intern',    progress: 68, score: 91, status: 'on-track' },
    { id: '3', name: 'James Lee',       company: 'Green Energy Corp',      position: 'Research Intern',     progress: 58, score: 76, status: 'at-risk'  },
  ]

  const pending = [
    { id: 1, student: 'Alex Johnson',    type: 'Mid-Term Evaluation', due: '15 May 2026', priority: 'high'   },
    { id: 2, student: 'Sophia Williams', type: 'Progress Check',      due: '20 May 2026', priority: 'medium' },
    { id: 3, student: 'James Lee',       type: 'Mid-Term Evaluation', due: '15 May 2026', priority: 'high'   },
  ]

  const recent = [
    { action: 'Submitted evaluation for Emily Davis',     time: '2 hours ago' },
    { action: 'Reviewed activity logs for Alex Johnson',  time: '5 hours ago' },
    { action: 'Approved final report for Michael Brown',  time: '1 day ago'   },
  ]

  const quickActions = [
    { label: 'Evaluate Student',      icon: <ClipboardCheck size={15} className="text-blue-600"/> },
    { label: 'Review Activity Logs',  icon: <FileText size={15} className="text-blue-600"/> },
    { label: 'View Analytics',        icon: <BarChart2 size={15} className="text-blue-600"/> },
    { label: 'Generate Report',       icon: <Download size={15} className="text-blue-600"/> },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Students */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">My Students</h2>
          </div>
          <div className="p-4 space-y-3">
            {students.map(s => (
              <div key={s.id} className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold">{s.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.company} · {s.position}</div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${s.status === 'on-track' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-bold">{s.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: s.progress + '%' }}/>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-gray-400">Performance</span>
                    <span className={`font-bold ${s.score >= 85 ? 'text-green-600' : s.score >= 75 ? 'text-amber-600' : 'text-red-600'}`}>{s.score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Pending evals */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold">Pending Evaluations</h2>
            </div>
            <div className="p-4 space-y-2">
              {pending.map(p => (
                <div key={p.id} onClick={() => setShowEvalModal(true)}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
                  <div className="text-sm font-bold">{p.student}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.type}</div>
                  <div className="text-xs text-gray-400 mt-1">Due {p.due}</div>
                </div>
              ))}
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

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Quick Actions</h2>
        </div>
        <div className="p-4 grid grid-cols-4 gap-3">
          {quickActions.map(({ label, icon }) => (
            <button key={label} className="flex items-center gap-2.5 p-3.5 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-left transition-all">
              {icon}
              <span className="text-sm font-semibold text-gray-800">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {showEvalModal && <EvalModal onClose={() => setShowEvalModal(false)} />}
    </div>
  )
}
