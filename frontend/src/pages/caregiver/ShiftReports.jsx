import { useState, useEffect, useMemo } from 'react'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Button from '../../components/common/Button'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { guardiaService, pacienteService, unwrapList } from '../../services/api'

export default function ShiftReports() {
  const [guardias, setGuardias] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    paciente_id: '',
    care_type: 'Medication Management',
    informe: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [guardiasRes, pacRes] = await Promise.all([
        guardiaService.getAll(),
        pacienteService.getAll()
      ])
      setGuardias(unwrapList(guardiasRes.data))
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
      // Find the active shift for this patient or create a new one
      const activeShift = guardias.find(g => g.paciente?.id === parseInt(formData.paciente_id) && g.estado !== 'Completado')
      
      if (activeShift) {
        await guardiaService.update(activeShift.id, {
          estado: 'Completado',
          informe: formData.informe,
          horas_trabajadas: 4 // Default for demo
        })
      } else {
        await guardiaService.create({
          paciente_id: formData.paciente_id,
          fecha: new Date().toISOString().split('T')[0],
          hora_inicio: '08:00',
          hora_fin: '12:00',
          estado: 'Completado',
          informe: formData.informe,
          horas_trabajadas: 4
        })
      }
      
      setFormData({ paciente_id: '', care_type: 'Medication Management', informe: '' })
      loadData()
    } catch (err) {
      alert('Error al guardar el reporte')
    }
  }

  const totalHoursWeek = useMemo(() => guardias.filter(g => g.estado === 'Completado').reduce((sum, g) => sum + (g.horasTrabajadas || 0), 0), [guardias])
  const pendingReports = useMemo(() => guardias.filter(g => g.estado === 'En Progreso' || (g.estado === 'Completado' && !g.informe)).length, [guardias])
  const shiftsCompleted = useMemo(() => guardias.filter(g => g.estado === 'Completado').length, [guardias])

  const sortedGuardias = useMemo(() => {
    return [...guardias].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [guardias])

  const upcomingShifts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return sortedGuardias.filter(g => g.fecha >= today && g.estado === 'Programado').slice(0, 2)
  }, [sortedGuardias])

  return (
    <CaregiverLayout title="Shift Logging & Reports">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Shift Logging & Reports</h1>
            <p className="text-[#4c739a] mt-1">Track your active hours and submit daily care documentation.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white">
              <span className="material-symbols-outlined mr-2 text-sm">download</span>
              Export CSV
            </Button>
            <Button variant="primary">
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Log New Shift
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">TOTAL HOURS (WEEK)</p>
              <span className="material-symbols-outlined text-blue-600">schedule</span>
            </div>
            <p className="text-3xl font-bold text-[#0d141b] mb-2">{totalHoursWeek}h</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">PENDING REPORTS</p>
              <span className="material-symbols-outlined text-amber-600">assignment_late</span>
            </div>
            <p className="text-3xl font-bold text-[#0d141b] mb-2">{pendingReports}</p>
            <span className="text-[#4c739a] text-xs font-semibold">Action required soon</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">SHIFTS COMPLETED</p>
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <p className="text-3xl font-bold text-[#0d141b] mb-2">{shiftsCompleted}</p>
            <span className="text-[#4c739a] text-xs font-semibold">Past 30 days</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#e7edf3] flex justify-between items-center bg-white">
                <div className="flex gap-6">
                  <button className="text-[#2b8cee] font-bold border-b-2 border-[#2b8cee] pb-4 -mb-4">Recent Shifts</button>
                  <button className="text-[#4c739a] font-semibold hover:text-[#0d141b] pb-4 -mb-4">Calendar</button>
                  <button className="text-[#4c739a] font-semibold hover:text-[#0d141b] pb-4 -mb-4">Reports Archive</button>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600">
                    <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-[#4c739a]">
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-8"><LoadingState label="Cargando turnos..." /></div>
              ) : error ? (
                <div className="p-8"><ErrorState message={error} /></div>
              ) : sortedGuardias.length === 0 ? (
                <div className="p-8"><EmptyState label="No hay turnos registrados." /></div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f6f7f8] text-[#4c739a] text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">PATIENT</th>
                      <th className="px-6 py-4 font-semibold">DATE & TIME</th>
                      <th className="px-6 py-4 font-semibold">STATUS</th>
                      <th className="px-6 py-4 font-semibold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7edf3]">
                    {sortedGuardias.slice(0, 4).map((shift) => {
                      const date = new Date(shift.fecha).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      const initials = shift.paciente?.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PT'
                      const isProgress = shift.estado === 'En Progreso'
                      const needsReport = shift.estado === 'Completado' && !shift.informe
                      const isCompleted = shift.estado === 'Completado' && shift.informe
                      
                      return (
                        <tr key={shift.id} className="hover:bg-[#f6f7f8]/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                                {initials}
                              </div>
                              <div>
                                <p className="font-semibold text-[#0d141b]">{shift.paciente?.nombre || 'Unknown'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#0d141b]">{date}</p>
                            <p className={`text-xs ${isProgress ? 'text-blue-600 font-semibold' : 'text-[#4c739a]'}`}>
                              {isProgress ? 'In Progress' : `${shift.horaInicio || '00:00'} - ${shift.horaFin || '00:00'}`}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1 ${
                              isProgress ? 'text-blue-700 bg-blue-50' : 
                              needsReport ? 'text-amber-700 bg-amber-50' : 
                              isCompleted ? 'text-green-700 bg-green-50' :
                              'text-gray-700 bg-gray-100'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                isProgress ? 'bg-blue-600' : 
                                needsReport ? 'bg-amber-600' : 
                                isCompleted ? 'bg-green-600' :
                                'bg-gray-600'
                              }`}></div>
                              {isProgress ? 'IN PROGRESS' : needsReport ? 'NEEDS REPORT' : isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isProgress ? (
                              <button className="text-[#2b8cee] font-semibold hover:underline text-sm">Edit Log</button>
                            ) : needsReport ? (
                              <button className="px-4 py-1.5 bg-[#2b8cee] text-white rounded-lg text-sm font-semibold hover:bg-blue-700">SUBMIT REPORT</button>
                            ) : isCompleted ? (
                              <button className="text-[#4c739a] hover:text-[#0d141b]">
                                <span className="material-symbols-outlined">more_horiz</span>
                              </button>
                            ) : (
                              <button className="text-[#2b8cee] font-semibold hover:underline text-sm">Details</button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Quick Log: Shift Documentation</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#4c739a] mb-2">Patient Name</label>
                    <select 
                      className="w-full border border-[#e7edf3] rounded-lg p-3 bg-[#f6f7f8] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                    <label className="block text-sm font-semibold text-[#4c739a] mb-2">Care Type</label>
                    <select 
                      className="w-full border border-[#e7edf3] rounded-lg p-3 bg-[#f6f7f8] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.care_type}
                      onChange={e => setFormData({...formData, care_type: e.target.value})}
                    >
                      <option value="Medication Management">Medication Management</option>
                      <option value="Physical Therapy">Physical Therapy</option>
                      <option value="Personal Care">Personal Care</option>
                      <option value="Companionship">Companionship</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#4c739a] mb-2">Observations & Care Provided</label>
                  <textarea 
                    className="w-full border border-[#e7edf3] rounded-lg p-3 bg-[#f6f7f8] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                    placeholder="Enter detailed shift report here..."
                    value={formData.informe}
                    onChange={e => setFormData({...formData, informe: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4c739a] mb-2">Upload Supporting Documents (Photos, Receipts, Forms)</label>
                  <div className="border-2 border-dashed border-[#e7edf3] rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined">cloud_upload</span>
                    </div>
                    <p className="font-semibold text-[#0d141b] mb-1">Click to upload or drag and drop files</p>
                    <p className="text-xs text-[#4c739a]">PNG, JPG or PDF (max. 10MB)</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" className="px-6">Save Draft</Button>
                  <Button variant="primary" type="submit" className="px-6">Submit Final Report</Button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
              <h3 className="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-6">UPCOMING SCHEDULE</h3>
              <div className="space-y-6">
                {upcomingShifts.length > 0 ? upcomingShifts.map((shift, idx) => {
                  const date = new Date(shift.fecha)
                  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
                  const day = date.getDate()
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#f6f7f8] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#4c739a]">{month}</span>
                        <span className="text-lg font-bold text-[#0d141b] leading-none">{day}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0d141b]">{idx === 0 ? 'Check-in' : 'Meal Prep'}</h4>
                        <p className="text-sm text-[#4c739a] mt-1">{shift.paciente?.nombre} • {shift.horaInicio || '08:00 AM'}</p>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-[#4c739a]">No upcoming shifts.</p>
                )}
                <Button variant="outline" className="w-full mt-4">View Full Calendar</Button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">help</span>
                </div>
                <h3 className="font-bold text-[#0d141b]">Need assistance?</h3>
              </div>
              <p className="text-sm text-[#4c739a] mb-4">
                Consult the "Shift Guidelines" manual or contact your supervisor if you have questions about logging hours.
              </p>
              <a href="#" className="text-[#2b8cee] font-semibold text-sm hover:underline flex items-center">
                Read Documentation <span className="material-symbols-outlined text-[16px] ml-1">open_in_new</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </CaregiverLayout>
  )
}
