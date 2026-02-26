import { useState, useEffect } from 'react'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Button from '../../components/common/Button'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { incidenteService, pacienteService, unwrapList } from '../../services/api'

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    paciente_id: '',
    tipo: 'Caída',
    severidad: 'Baja',
    descripcion: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [incRes, pacRes] = await Promise.all([
        incidenteService.getAll(),
        pacienteService.getAll()
      ])
      setIncidents(unwrapList(incRes.data))
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
      await incidenteService.create(formData)
      setShowModal(false)
      setFormData({ paciente_id: '', tipo: 'Caída', severidad: 'Baja', descripcion: '' })
      loadData()
    } catch (err) {
      alert('Error al crear incidente')
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Alta': return 'text-red-600 bg-red-50'
      case 'Media': return 'text-amber-600 bg-amber-50'
      case 'Baja': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'text-amber-600 bg-amber-50'
      case 'Revisado': return 'text-blue-600 bg-blue-50'
      case 'Resuelto': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <CaregiverLayout title="Incident Reports">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-sm text-[#4c739a] mb-1">Overview &gt; Incidents</div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Incident Reports</h1>
            <p className="text-[#4c739a] mt-1">Review and manage safety incidents reported by care staff.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white">
              <span className="material-symbols-outlined mr-2 text-sm">download</span>
              Export
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Report Incident
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e7edf3] flex gap-4 items-center bg-white">
            <span className="text-sm font-semibold text-[#0d141b]">Filter by:</span>
            <select className="border border-[#e7edf3] rounded-lg px-3 py-2 text-sm bg-white">
              <option>All Statuses</option>
            </select>
            <select className="border border-[#e7edf3] rounded-lg px-3 py-2 text-sm bg-white">
              <option>All Severity</option>
            </select>
            <select className="border border-[#e7edf3] rounded-lg px-3 py-2 text-sm bg-white">
              <option>Last 30 Days</option>
            </select>
            <div className="ml-auto relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-sm">search</span>
              <input type="text" placeholder="Search incidents by name..." className="pl-9 pr-4 py-2 border border-[#e7edf3] rounded-lg text-sm w-64" />
            </div>
          </div>

          {loading ? (
            <div className="p-8"><LoadingState label="Cargando incidentes..." /></div>
          ) : error ? (
            <div className="p-8"><ErrorState message={error} /></div>
          ) : incidents.length === 0 ? (
            <div className="p-8"><EmptyState label="No hay incidentes reportados." /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f7f8] text-[#4c739a] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">DATE</th>
                  <th className="px-6 py-4 font-semibold">CAREGIVER</th>
                  <th className="px-6 py-4 font-semibold">PATIENT</th>
                  <th className="px-6 py-4 font-semibold">TYPE</th>
                  <th className="px-6 py-4 font-semibold">SEVERITY</th>
                  <th className="px-6 py-4 font-semibold">STATUS</th>
                  <th className="px-6 py-4 font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7edf3]">
                {incidents.map((inc) => {
                  const date = new Date(inc.fecha).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  const caregiverInitials = inc.cuidador?.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CG'
                  
                  return (
                    <tr key={inc.id} className="hover:bg-[#f6f7f8]/50">
                      <td className="px-6 py-4 text-[#4c739a]">{date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {caregiverInitials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0d141b]">{inc.cuidador?.nombre || 'Unknown'}</p>
                            <p className="text-xs text-[#4c739a]">ID: #{inc.cuidador?.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#4c739a]">{inc.paciente?.nombre || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full border border-[#e7edf3] text-xs font-medium text-[#4c739a] bg-white">
                          {inc.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1 ${getSeverityColor(inc.severidad)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${inc.severidad === 'Alta' ? 'bg-red-600' : inc.severidad === 'Media' ? 'bg-amber-600' : 'bg-green-600'}`}></div>
                          {inc.severidad}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1 ${getStatusColor(inc.estado)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${inc.estado === 'Pendiente' ? 'bg-amber-600' : inc.estado === 'Revisado' ? 'bg-blue-600' : 'bg-green-600'}`}></div>
                          {inc.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {inc.estado === 'Pendiente' ? (
                          <button className="text-[#2b8cee] font-semibold hover:underline">Review</button>
                        ) : (
                          <button className="text-[#4c739a] hover:text-[#0d141b]">
                            <span className="material-symbols-outlined">more_horiz</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-[#e7edf3] flex justify-between items-center text-sm text-[#4c739a]">
            <span>Showing 1-{incidents.length} of {incidents.length} results</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#2b8cee] text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">&gt;</button>
            </div>
          </div>
        </div>

        {/* Modal for New Incident */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Report New Incident</h2>
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
                  <label className="block text-sm font-semibold mb-1">Type</label>
                  <select 
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="Caída">Fall</option>
                    <option value="Medicación">Medication</option>
                    <option value="Agresión">Aggression</option>
                    <option value="Equipamiento">Equipment</option>
                    <option value="Otro">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Severity</label>
                  <select 
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.severidad}
                    onChange={e => setFormData({...formData, severidad: e.target.value})}
                  >
                    <option value="Baja">Low</option>
                    <option value="Media">Medium</option>
                    <option value="Alta">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea 
                    className="w-full border border-[#e7edf3] rounded-lg p-2 h-24"
                    value={formData.descripcion}
                    onChange={e => setFormData({...formData, descripcion: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                  <Button variant="primary" type="submit">Submit Report</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CaregiverLayout>
  )
}
