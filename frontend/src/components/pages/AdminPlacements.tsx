import { useState, useEffect } from 'react'
import { Search, Loader } from 'lucide-react'
import client from '../../api/client'

interface Placement {
  id: number
  company_name: string
  position: string
  start_date: string
  end_date: string
  student: number
}

interface Student {
  id: number
  registration_number: string
  course: string
  user: { id: number; username: string; first_name: string; last_name: string; email: string }
}

function NewPlacementModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    student_username: '', company_name: '', position: '',
    start_date: '', end_date: '',
    workplace_supervisor: '', academic_supervisor: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.company_name || !form.position || !form.start_date || !form.end_date) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      // Find student by username
      const stuRes = await client.get(`/api/students/?search=${form.student_username}`)
      const students = stuRes.data.results ?? stuRes.data
      if (!students.length) { setError('Student not found.'); setSaving(false); return }
      const studentId = students[0].id

      await client.post('/api/placements/', {
        student: studentId,
        company_name: form.company_name,
        position: form.position,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create placement.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">New Internship Placement</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm text-gray-500">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>}
          {[
            ['Student Username', 'student_username', 'text', 'e.g. alexjohnson'],
            ['Company Name',     'company_name',     'text', 'e.g. Tech Innovations Inc.'],
            ['Position / Role',  'position',         'text', 'e.g. Software Development Intern'],
          ].map(([label, key, type, ph]) => (
            <div key={key as string}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input type={type as string} placeholder={ph as string}
                value={(form as any)[key as string]}
                onChange={e => setForm({ ...form, [key as string]: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {[['Start Date', 'start_date'], ['End Date', 'end_date']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <input type="date"
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"/>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Placement'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPlacements() {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pRes, sRes] = await Promise.all([
        client.get('/api/placements/'),
        client.get('/api/students/'),
      ])
      setPlacements(pRes.data.results ?? pRes.data)
      setStudents(sRes.data.results ?? sRes.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const getStudent = (id: number) => students.find(s => s.id === id)

  const filtered = placements.filter(p => {
    const st = getStudent(p.student)
    const name = st ? `${st.user.first_name} ${st.user.last_name}` : ''
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      p.company_name.toLowerCase().includes(search.toLowerCase()) ||
      p.position.toLowerCase().includes(search.toLowerCase())
    )
  })

  const active = placements.length

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + New Placement
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['Total Placements', placements.length + '', 'text-blue-600'  ],
          ['Active',           active + '',            'text-green-600' ],
          ['Students',         students.length + '',   'text-violet-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by student, company or position…"
          className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white transition-colors"/>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
              <Loader size={16} className="animate-spin"/> Loading placements…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">
              No placements yet. Click <strong>+ New Placement</strong> to add one.
            </div>
          )}
          {!loading && filtered.map(p => {
            const st = getStudent(p.student)
            const name = st ? `${st.user.first_name} ${st.user.last_name}` : `Student #${p.student}`
            const reg  = st?.registration_number ?? ''
            const start = new Date(p.start_date)
            const end   = new Date(p.end_date)
            const total = end.getTime() - start.getTime()
            const elapsed = Date.now() - start.getTime()
            const progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))

            return (
              <div key={p.id} className="p-4 border-2 border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-bold">
                      {name}
                      {reg && <span className="text-xs font-normal text-gray-400 ml-2">({reg})</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.company_name} · {p.position}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p.start_date} – {p.end_date}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">active</span>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: progress + '%' }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && <NewPlacementModal onClose={() => setShowModal(false)} onSaved={fetchData} />}
    </div>
  )
}