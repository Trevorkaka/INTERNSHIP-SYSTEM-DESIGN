import { useState, useEffect, FormEvent } from 'react'
import { Search, Loader, Plus, AlertCircle } from 'lucide-react'
import client from '../api/client'
import { placementsAPI, studentsAPI } from '../api/services'

interface Student {
  id: number
  registration_number: string
  course: string
  year_of_study: number
  user: { id: number; first_name: string; last_name: string; email: string; username: string }
}

interface Placement {
  id: number
  student: {
    id: number
    registration_number: string
    user: { first_name: string; last_name: string }
  } | number | any
  company_name: string
  position: string
  start_date: string
  end_date: string
}

export default function AdminPlacements() {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Form state
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [companyName, setCompanyName] = useState('')
  const [position, setPosition] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pRes, sRes] = await Promise.all([
        placementsAPI.list(),
        studentsAPI.list(),
      ])
      setPlacements(pRes.data.results ?? pRes.data)
      setStudents(sRes.data.results ?? sRes.data)
    } catch {
      setError('Failed to fetch placements data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !companyName || !startDate || !endDate) {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await placementsAPI.create({
        student: Number(selectedStudent),
        company_name: companyName,
        position,
        start_date: startDate,
        end_date: endDate,
      })
      setSelectedStudent('')
      setCompanyName('')
      setPosition('')
      setStartDate('')
      setEndDate('')
      setShowModal(false)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create placement.')
    } finally {
      setSaving(false)
    }
  }

  const filteredPlacements = placements.filter(p => {
    const studentName = typeof p.student === 'object' && p.student
      ? `${p.student.user?.first_name} ${p.student.user?.last_name}`.toLowerCase()
      : `student #${p.student}`.toLowerCase()
    return (
      p.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.position && p.position.toLowerCase().includes(search.toLowerCase())) ||
      studentName.includes(search.toLowerCase())
    )
  })

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader size={16} className="animate-spin"/> Loading placements…
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-950">Internship Placements</h1>
          <p className="text-sm text-gray-500 mt-1">Manage where students are carrying out their internships</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> New Placement
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search placements by company, position, or student name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-semibold border-b border-gray-100">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Company Name</th>
                <th className="px-6 py-3.5">Position</th>
                <th className="px-6 py-3.5">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlacements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No placements found.
                  </td>
                </tr>
              )}
              {filteredPlacements.map(p => {
                const sName = typeof p.student === 'object' && p.student
                  ? `${p.student.user?.first_name} ${p.student.user?.last_name}`
                  : `Student #${p.student}`
                const sReg = typeof p.student === 'object' && p.student ? p.student.registration_number : ''
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-950">{sName}</div>
                      {sReg && <div className="text-xs text-gray-400 mt-0.5">{sReg}</div>}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{p.company_name}</td>
                    <td className="px-6 py-4 text-gray-500">{p.position || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {p.start_date} to {p.end_date}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold">New Placement Assignment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Select Student *</label>
                <select
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                >
                  <option value="">— choose student —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.user.first_name} {s.user.last_name} ({s.registration_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Company Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Position / Role</label>
                <input
                  type="text"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  placeholder="e.g. Software Engineer Intern"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creating…' : 'Create Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
