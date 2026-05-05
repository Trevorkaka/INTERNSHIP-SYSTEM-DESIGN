const EVALS = [
    {
      id: 1,
      type: 'Mid-Term Evaluation',
      evaluator: 'Dr. Michael Chen',
      role: 'Academic Supervisor',
      date: '15 Apr 2026',
      score: 87,
      criteria: [
        ['Learning Objectives',    88],
        ['Professional Development', 85],
        ['Theory Application',     90],
        ['Critical Thinking',      84],
      ],
      feedback: 'Alex demonstrates excellent application of theoretical concepts. Strong analytical skills and proactive approach to challenges.',
    },
    {
      id: 2,
      type: 'Week 10 Assessment',
      evaluator: 'Sarah Martinez',
      role: 'Workplace Supervisor',
      date: '20 Apr 2026',
      score: 82,
      criteria: [
        ['Technical Skills',  85],
        ['Communication',     80],
        ['Initiative',        82],
        ['Teamwork',          81],
      ],
      feedback: 'Consistent performance. API work was particularly impressive. Could improve on documentation practices.',
    },
  ]
  
  export default function StudentEvaluations() {
    return (
      <div className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Overall Score',          '85%', 'text-blue-600'  ],
            ['Evaluations Received',   '6',   'text-green-600' ],
            ['Pending',                '2',   'text-amber-600' ],
          ].map(([label, value, color]) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
  
        {/* Evaluation cards */}
        {EVALS.map(ev => (
          <div key={ev.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold">{ev.type}</h2>
                <div className="text-xs text-gray-400 mt-1">{ev.evaluator} · {ev.role} · {ev.date}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black tracking-tight text-blue-600">{ev.score}%</div>
                <div className="text-xs text-gray-400 mt-0.5">Overall Score</div>
              </div>
            </div>
  
            <div className="p-5 space-y-4">
              {/* Criteria bars */}
              <div className="grid grid-cols-2 gap-4">
                {ev.criteria.map(([name, score]) => (
                  <div key={name as string}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500 font-medium">{name}</span>
                      <span className="font-bold">{score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: score + '%' }}/>
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Feedback */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Evaluator Feedback</div>
                <p className="text-sm text-gray-700 leading-relaxed">{ev.feedback}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  