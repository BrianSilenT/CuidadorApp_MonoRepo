import { useState, useEffect } from 'react'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Button from '../../components/common/Button'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { logPacienteService, pacienteService, unwrapList } from '../../services/api'

export default function PatientLogs() {
  const [logs, setLogs] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    paciente_id: '',
    condicion: '',
    estado: 'Estable',
    notas: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [logsRes, pacRes] = await Promise.all([
        logPacienteService.getAll(),
        pacienteService.getAll()
      ])
      setLogs(unwrapList(logsRes.data))
      setPacientes(unwrapList(pacRes.data))
    } catch (err) {
      setError('Error al cargar los datos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await logPacienteService.create(formData)
      setShowModal(false)
      setFormData({ paciente_id: '', condicion: '', estado: 'Estable', notas: '' })
      loadData()
    } catch (err) {
      alert('Error al crear log')
    }
  }

  // Group logs by patient to show the latest status
  const patientLatestLogs = pacientes.map(p => {
    const pLogs = logs.filter(l => l.paciente?.id === p.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    return {
      ...p,
      latestLog: pLogs[0] || null
    }
  })

  const updatesToday = logs.filter(l => new Date(l.fecha).toDateString() === new Date().toDateString()).length
  const criticalStatus = patientLatestLogs.filter(p => p.latestLog?.estado === 'Crítico').length

  return (
    <CaregiverLayout title="Patient Logs">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-sm text-[#4c739a] mb-1">Overview &gt; Patient Logs</div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Patient Logs</h1>
            <p className="text-[#4c739a] mt-1">Review patient history and add daily care notes.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white">
              <span className="material-symbols-outlined mr-2 text-sm">filter_list</span>
              Filter
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              New Entry
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">Total Patients</p>
              <p className="text-2xl font-bold text-[#0d141b]">{pacientes.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">Updates Today</p>
              <p className="text-2xl font-bold text-[#0d141b]">{updatesToday}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined">error</span>
            </div>
            <div>
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">Critical Status</p>
              <p className="text-2xl font-bold text-[#0d141b]">{criticalStatus}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e7edf3] flex justify-between items-center bg-white">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-sm">search</span>
              <input type="text" placeholder="Search patients..." className="pl-9 pr-4 py-2 border border-[#e7edf3] rounded-lg text-sm w-64" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#4c739a]">Sort by:</span>
              <select className="border-none bg-transparent font-semibold text-[#0d141b] focus:ring-0 cursor-pointer">
                <option>Last Visit</option>
                <option>Name</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8"><LoadingState label="Cargando pacientes..." /></div>
          ) : error ? (
            <div className="p-8"><ErrorState message={error} /></div>
          ) : patientLatestLogs.length === 0 ? (
            <div className="p-8"><EmptyState label="No hay pacientes registrados." /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f7f8] text-[#4c739a] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">PATIENT NAME</th>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">CONDITION</th>
                  <th className="px-6 py-4 font-semibold">LAST VISIT</th>
                  <th className="px-6 py-4 font-semibold">STATUS</th>
                  <th className="px-6 py-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7edf3]">
                {patientLatestLogs.map((p) => {
                  const initials = p.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PT'
                  const lastVisit = p.latestLog ? new Date(p.latestLog.fecha).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No visits'
                  const condition = p.latestLog?.condicion || 'Not specified'
                  const status = p.latestLog?.estado || 'Estable'
                  
                  return (
                    <tr key={p.id} className="hover:bg-[#f6f7f8]/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0d141b]">{p.nombre}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#4c739a]">#{p.id}</td>
                      <td className="px-6 py-4 text-[#0d141b]">{condition}</td>
                      <td className="px-6 py-4 text-[#4c739a]">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          {lastVisit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1 ${
                          status === 'Crítico' ? 'text-red-600 bg-red-50' : 
                          status === 'Estable' ? 'text-blue-600 bg-blue-50' : 
                          'text-green-600 bg-green-50'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            status === 'Crítico' ? 'bg-red-600' : 
                            status === 'Estable' ? 'bg-blue-600' : 
                            'bg-green-600'
                          }`}></div>
                          {status === 'Crítico' ? 'Critical' : status === 'Estable' ? 'Stable' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-[#2b8cee] font-semibold hover:underline text-sm">View Log</button>
                          <button className="flex items-center gap-1 px-3 py-1.5 border border-[#e7edf3] rounded-lg text-sm font-semibold hover:bg-gray-50">
                            <span className="material-symbols-outlined text-[16px]">edit_note</span>
                            Note
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-[#e7edf3] flex justify-between items-center text-sm text-[#4c739a]">
            <span>Showing 1-{patientLatestLogs.length} of {patientLatestLogs.length} results</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#2b8cee] text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">&gt;</button>
            </div>
          </div>
        </div>

        {/* Modal for New Entry */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">New Patient Log Entry</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Patient</label>
                  <select 
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.paciente_id}
                    onChange={e => setFormData({...formData, paciente_id: e.target.value})}
                    required
                  >
                    <option value="">Select Patient</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Condition</label>
                  <input 
                    type="text"
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.condicion}
                    onChange={e => setFormData({...formData, condicion: e.target.value})}
                    placeholder="e.g. Dementia, Diabetes Type 2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Status</label>
                  <select 
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.estado}
                    onChange={e => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="Estable">Stable</option>
                    <option value="Activo">Active</option>
                    <option value="Crítico">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Care Notes</label>
                  <textarea 
                    className="w-full border border-[#e7edf3] rounded-lg p-2 h-24"
                    value={formData.notas}
                    onChange={e => setFormData({...formData, notas: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                  <Button variant="primary" type="submit">Save Entry</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CaregiverLayout>
  )
}
