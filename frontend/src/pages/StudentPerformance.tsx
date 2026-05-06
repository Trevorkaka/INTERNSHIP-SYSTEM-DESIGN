const WEEKS   = ['W7', 'W8', 'W9', 'W10', 'W11', 'W12']
const SCORES  = [72,   75,   78,   80,    85,    87  ]

export default function StudentPerformance() {
  const max = Math.max(...SCORES)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ['Current Score',  '87%',  'text-blue-600'  ],
          ['Hours Logged',   '156h', 'text-green-600' ],
          ['Logs Approved',  '22',   'text-violet-600'],
          ['Target',         '90%',  'text-amber-600' ],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Performance Trend</h2>
        </div>
        <div className="p-5">
          <div className="flex items-end gap-4 h-44">
            {WEEKS.map((w, i) => (
              <div key={w} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-blue-600">{SCORES[i]}%</span>
                <div
                  className={`w-full rounded-t-lg transition-all ${i === WEEKS.length - 1 ? 'bg-blue-600' : 'bg-blue-100'}`}
                  style={{ height: (SCORES[i] / max) * 140 }}
                />
                <span className="text-xs text-gray-400">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            title: 'Strengths',
            color: 'text-green-600',
            dot: 'bg-green-500',
            items: ['JWT authentication', 'Responsive design', 'API development', 'Team collaboration'],
          },
          {
            title: 'Areas to Improve',
            color: 'text-amber-600',
            dot: 'bg-amber-500',
            items: ['Documentation practices', 'Unit test coverage', 'Time estimation'],
          },
          {
            title: 'Supervisor Notes',
            color: 'text-blue-600',
            dot: 'bg-blue-500',
            items: ['Shows strong initiative', 'Proactive communication', 'Good problem-solving skills'],
          },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className={`text-sm font-bold ${section.color}`}>{section.title}</h2>
            </div>
            <div className="p-4 space-y-3">
              {section.items.map(item => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${section.dot}`}/>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Internship progress */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Internship Completion</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            ['Hours Completed',       '156 / 320', 48.75, 'bg-blue-600'  ],
            ['Logs Submitted',        '22 / 24',   91.67, 'bg-green-500' ],
            ['Evaluations Received',  '6 / 8',     75,    'bg-violet-500'],
          ].map(([label, value, pct]) => (
            <div key={label as string}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">{label}</span>
                <span className="font-bold">{value} <span className="text-gray-400 font-normal">({(pct as number).toFixed(0)}%)</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: pct + '%' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
