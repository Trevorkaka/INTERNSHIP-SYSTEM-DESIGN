import { useState, useEffect } from 'react'
import { Search, Loader, UserCheck } from 'lucide-react'
import client from '../api/client'

interface Student {
  id: number
  registration_number: string
  course: string
  year_of_study: number
  academic_supervisor: number | null
  work_place_supervisor: number | null
  user: { id: number; first_name: string; last_name: string; email: string; username: string }
}

interface Supervisor {
  id: number
  user: { id: number; first_name: string; last_name: string; username: string; role: string }
  department?: string
  company_name?: string
}

function AssignModal({ student, academicSupervisors, workplaceSupervisors, onClose, onSaved }: {
  student: Student
  academicSupervisors: Supervisor[]
  workplaceSupervisors: Supervisor[]
  onClose: () => void
  onSaved: () => void
}) {
  const [academic, setAcademic]   = useState<string>(student.academic_supervisor?.toString() ?? '')
  const [workplace, setWorkplace] = useState<string>(student.work_place_supervisor?.toString() ?? '')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const name = `${student.user.first_name} ${student.user.last_name}`

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const body: Record<string, number> = {}
      if (academic)  body.academic_supervisor    = Number(academic)
      if (workplace) body.work_place_supervisor  = Number(workplace)

      await client.patch(`/api/students/${student.id}/assign_supervisors/`, body)
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign supervisors.')
    } finally {
      setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">Assign Supervisors — {name}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>}

          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{student.course} · Year {student.year_of_study} · {student.registration_number}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Academic Supervisor</label>
            <select value={academic} onChange={e => setAcademic(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors">
              <option value="">— None assigned —</option>
              {academicSupervisors.map(s => (
                <option key={s.id} value={s.user.id}>
                  {s.user.first_name} {s.user.last_name} ({s.department ?? 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Workplace Supervisor</label>
            <select value={workplace} onChange={e => setWorkplace(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors">
              <option value="">— None assigned —</option>
              {workplaceSupervisors.map(s => (
                <option key={s.id} value={s.user.id}>
                  {s.user.first_name} {s.user.last_name} ({s.company_name ?? 'N/A'})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Assignment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSupervisorAssignment() {
  const [students,              setStudents]              = useState<Student[]>([])
  const [academicSupervisors,   setAcademicSupervisors]   = useState<Supervisor[]>([])
  const [workplaceSupervisors,  setWorkplaceSupervisors]  = useState<Supervisor[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<Student | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sRes, aRes, wRes] = await Promise.all([
        client.get('/api/students/'),
        client.get('/api/academic-supervisors/'),
        client.get('/api/workplace-supervisors/'),
      ])
      setStudents(sRes.data.results ?? sRes.data)
      setAcademicSupervisors(aRes.data.results ?? aRes.data)
      setWorkplaceSupervisors(wRes.data.results ?? wRes.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const getSupervisorName = (id: number | null, list: Supervisor[]) => {
    if (!id) return '—'
    const s = list.find(x => x.user.id === id)
    return s ? `${s.user.first_name} ${s.user.last_name}` : '—'
  }

  const filtered = students.filter(s => {
    const name = `${s.user.first_name} ${s.user.last_name} ${s.registration_number} ${s.course}`
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const unassigned = students.filter(s => !s.academic_supervisor || !s.work_place_supervisor).length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['Total Students',  students.length + '',  'text-blue-600'  ],
          ['Unassigned',      unassigned + '',        'text-amber-600' ],
          ['Fully Assigned',  (students.length - unassigned) + '', 'text-green-600'],
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
          placeholder="Search students by name, registration number or course…"
          className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white transition-colors"/>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold">Students & Supervisor Assignments</h2>
        </div>
        <div className="p-4 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
              <Loader size={16} className="animate-spin"/> Loading students…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">No students found.</div>
          )}
          {!loading && filtered.map(s => {
            const name       = `${s.user.first_name} ${s.user.last_name}`
            const hasAcad    = !!s.academic_supervisor
            const hasWork    = !!s.work_place_supervisor
            const fullyAssigned = hasAcad && hasWork

            return (
              <div key={s.id} className={`p-4 rounded-xl border-2 transition-all
                ${fullyAssigned ? 'border-gray-100 hover:border-blue-200' : 'border-amber-100 bg-amber-50/40 hover:border-amber-300'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{name}</span>
                      {!fullyAssigned && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Needs Assignment</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.course} · Year {s.year_of_study} · {s.registration_number}</div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className={`text-xs p-2 rounded-lg ${hasAcad ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="text-gray-400 mb-0.5">Academic Supervisor</div>
                        <div className={`font-semibold ${hasAcad ? 'text-green-700' : 'text-gray-400'}`}>
                          {getSupervisorName(s.academic_supervisor, academicSupervisors)}
                        </div>
                      </div>
                      <div className={`text-xs p-2 rounded-lg ${hasWork ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="text-gray-400 mb-0.5">Workplace Supervisor</div>
                        <div className={`font-semibold ${hasWork ? 'text-green-700' : 'text-gray-400'}`}>
                          {getSupervisorName(s.work_place_supervisor, workplaceSupervisors)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(s)}
                    className="ml-4 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0">
                    <UserCheck size={12}/>
                    Assign
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <AssignModal
          student={selected}
          academicSupervisors={academicSupervisors}
          workplaceSupervisors={workplaceSupervisors}
          onClose={() => setSelected(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  )
}
