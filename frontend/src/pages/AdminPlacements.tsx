import { useState } from 'react'
import { Search } from 'lucide-react'

interface Placement {
  id: number
  student: string
  reg: string
  company: string
  position: string
  supervisor: string
  start: string
  end: string
  status: string
  progress: number
}

const PLACEMENTS: Placement[] = [
  { id: 1, student: 'Alex Johnson',    reg: 'CS/2022/001',   company: 'Tech Innovations Inc.',  position: 'Software Dev Intern',   supervisor: 'Sarah Martinez', start: '15 Jan 2026', end: '15 Jun 2026', status: 'active', progress: 72 },
  { id: 2, student: 'Emily Davis',     reg: 'CS/2022/045',   company: 'Digital Solutions Ltd.', position: 'Data Science Intern',   supervisor: 'John Smith',     start: '20 Jan 2026', end: '20 Jun 2026', status: 'active', progress: 68 },
  { id: 3, student: 'Michael Brown',   reg: 'BA/2022/012',   company: 'Creative Agency Co.',   position: 'Marketing Intern',      supervisor: 'Lisa Anderson',  start: '1 Feb 2026',  end: '1 Jul 2026',  status: 'active', progress: 58 },
  { id: 4, student: 'Sophia Williams', reg: 'ENG/2022/033',  company: 'Green Energy Corp',     position: 'Research Intern',       supervisor: 'Dr. Park',       start: '10 Jan 2026', end: '10 Jun 2026', status: 'active', progress: 80 },
  { id: 5, student: 'James Lee',       reg: 'CS/2022/078',   company: 'CloudBase Africa',      position: 'DevOps Intern',         supervisor: 'Mark Osei',      start: '15 Jan 2026', end: '15 Jun 2026', status: 'active', progress: 45 },
]

function NewPlacementModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">New Internship Placement</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {[
            ['Student (Username)',   'text', 'e.g. alexjohnson'              ],
            ['Company Name',         'text', 'e.g. Tech Innovations Inc.'    ],
            ['Position / Role',      'text', 'e.g. Software Development Intern'],
          ].map(([label, type, placeholder]) => (
            <div key={label as string}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input type={type as string} placeholder={placeholder as string}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Start Date</label>
              <input type="date" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">End Date</label>
              <input type="date" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
          </div>
          {[
            ['Workplace Supervisor (Username)', 'e.g. sarahmartinez' ],
            ['Academic Supervisor (Username)',  'e.g. drmichaelchen' ],
          ].map(([label, placeholder]) => (
            <div key={label as string}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input type="text" placeholder={placeholder as string}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Create Placement</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPlacements() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = PLACEMENTS.filter(p =>
    p.student.toLowerCase().includes(search.toLowerCase()) ||
    p.company.toLowerCase().includes(search.toLowerCase()) ||
    p.position.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + New Placement
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by student, company or position…"
          className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white transition-colors"/>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['Total Placements', PLACEMENTS.length,                                              'text-blue-600'  ],
          ['Active',           PLACEMENTS.filter(p => p.status === 'active').length,           'text-green-600' ],
          ['Avg Progress',     Math.round(PLACEMENTS.reduce((a, p) => a + p.progress, 0) / PLACEMENTS.length) + '%', 'text-violet-600'],
        ].map(([label, value, color]) => (
          <div key={label as string} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Placement list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">No placements found</div>
          )}
          {filtered.map(p => (
            <div key={p.id}
              className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-bold">
                    {p.student}
                    <span className="text-xs font-normal text-gray-400 ml-2">({p.reg})</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.company} · {p.position}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Supervisor: {p.supervisor} · {p.start} – {p.end}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  {p.status}
                </span>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">Internship Progress</span>
                <span className="font-bold">{p.progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: p.progress + '%' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && <NewPlacementModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
