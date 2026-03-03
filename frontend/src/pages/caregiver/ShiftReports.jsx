import { useState, useEffect, useMemo, useRef } from 'react'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Button from '../../components/common/Button'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { guardiaService, pacienteService, unwrapList } from '../../services/api'
import { downloadCsv } from '../../utils/csv'

export default function ShiftReports() {
  const [guardias, setGuardias] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedShift, setSelectedShift] = useState(null)
  const [editingShiftId, setEditingShiftId] = useState(null)
  const [formData, setFormData] = useState({
    paciente_id: '',
    care_type: 'Administración de medicación',
    medicamentos: '',
    novedades: '',
    informe: ''
  })
  const formRef = useRef(null)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [guardiasRes, pacRes] = await Promise.all([
        guardiaService.getAll(),
        pacienteService.getAll()
      ])
      setGuardias(unwrapList(guardiasRes.data))
      setPacientes(unwrapList(pacRes.data))
    } catch {
      setError('Error al cargar los datos.')
    } finally {
      setLoading(false)
    }
  }

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem('caregiver_shift_report_draft')
      if (!raw) return
      const draft = JSON.parse(raw)
      setFormData((prev) => ({ ...prev, ...draft }))
    } catch {
      localStorage.removeItem('caregiver_shift_report_draft')
    }
  }

  useEffect(() => {
    loadData()
    loadDraft()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const informeCompuesto = [
        `Tipo de atención: ${formData.care_type}`,
        `Medicamentos administrados: ${formData.medicamentos || 'No aplica'}`,
        `Novedades/incidentes: ${formData.novedades || 'Sin novedades'}`,
        '',
        `Detalle del turno: ${formData.informe}`
      ].join('\n')

      const activeShift = editingShiftId
        ? guardias.find((g) => g.id === editingShiftId)
        : guardias.find((g) => g.paciente?.id === parseInt(formData.paciente_id, 10) && g.estado !== 'Completado')

      if (activeShift) {
        await guardiaService.update(activeShift.id, {
          estado: 'Completado',
          informe: informeCompuesto,
          horas_trabajadas: activeShift.horasTrabajadas || 4
        })
      } else {
        await guardiaService.create({
          paciente_id: formData.paciente_id,
          fecha: new Date().toISOString().split('T')[0],
          hora_inicio: '08:00',
          hora_fin: '12:00',
          estado: 'Completado',
          informe: informeCompuesto,
          horas_trabajadas: 4
        })
      }

      setFormData({ paciente_id: '', care_type: 'Administración de medicación', medicamentos: '', novedades: '', informe: '' })
      setEditingShiftId(null)
      localStorage.removeItem('caregiver_shift_report_draft')
      loadData()
    } catch {
      alert('Error al guardar el reporte.')
    }
  }

  const handleEditShift = (shift) => {
    setEditingShiftId(shift.id)
    setFormData({
      paciente_id: shift.paciente?.id || '',
      care_type: 'Administración de medicación',
      medicamentos: '',
      novedades: '',
      informe: shift.informe || ''
    })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const exportCsv = () => {
    downloadCsv({
      fileName: `reportes-turno-${new Date().toISOString().split('T')[0]}.csv`,
      headers: ['ID', 'Fecha', 'Paciente', 'Estado', 'Hora inicio', 'Hora fin', 'Horas trabajadas', 'Informe'],
      rows: sortedGuardias.map((item) => [
        item.id,
        item.fecha || '',
        item.paciente?.nombre || 'Sin paciente',
        item.estado || '',
        item.horaInicio || '',
        item.horaFin || '',
        item.horasTrabajadas || 0,
        (item.informe || '').replace(/\n/g, ' ')
      ])
    })
  }

  const saveDraft = () => {
    localStorage.setItem('caregiver_shift_report_draft', JSON.stringify(formData))
    alert('Borrador guardado en este navegador.')
  }

  const handleCancelShift = async (shift) => {
    const confirmed = window.confirm('¿Deseas cancelar este turno?')
    if (!confirmed) return

    try {
      await guardiaService.cancel(shift.id)
      if (editingShiftId === shift.id) {
        setEditingShiftId(null)
      }
      if (selectedShift?.id === shift.id) {
        setSelectedShift(null)
      }
      await loadData()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar el turno.')
    }
  }

  const totalHoursWeek = useMemo(() => guardias.filter((g) => g.estado === 'Completado').reduce((sum, g) => sum + (g.horasTrabajadas || 0), 0), [guardias])
  const pendingReports = useMemo(() => guardias.filter((g) => g.estado === 'En Progreso' || (g.estado === 'Completado' && !g.informe)).length, [guardias])
  const shiftsCompleted = useMemo(() => guardias.filter((g) => g.estado === 'Completado').length, [guardias])

  const sortedGuardias = useMemo(() => {
    return [...guardias].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [guardias])

  return (
    <CaregiverLayout title="Registro y reportes de turno">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Registro y reportes de turno</h1>
            <p className="text-[#4c739a] mt-1">Registra lo realizado en cada atención.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white" onClick={exportCsv}>
              <span className="material-symbols-outlined mr-2 text-sm">download</span>
              Exportar CSV
            </Button>
            <Button variant="primary" onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Nuevo reporte
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">HORAS TOTALES (SEMANA)</p>
              <span className="material-symbols-outlined text-blue-600">schedule</span>
            </div>
            <p className="text-3xl font-bold text-[#0d141b] mb-2">{totalHoursWeek}h</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">REPORTES PENDIENTES</p>
              <span className="material-symbols-outlined text-amber-600">assignment_late</span>
            </div>
            <p className="text-3xl font-bold text-[#0d141b] mb-2">{pendingReports}</p>
            <span className="text-[#4c739a] text-xs font-semibold">Requiere acción</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">TURNOS COMPLETADOS</p>
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <p className="text-3xl font-bold text-[#0d141b] mb-2">{shiftsCompleted}</p>
            <span className="text-[#4c739a] text-xs font-semibold">Últimos 30 días</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#e7edf3] flex justify-between items-center bg-white">
              <span className="text-[#2b8cee] font-bold border-b-2 border-[#2b8cee] pb-4 -mb-4">Turnos recientes</span>
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
                    <th className="px-6 py-4 font-semibold">PACIENTE</th>
                    <th className="px-6 py-4 font-semibold">FECHA Y HORA</th>
                    <th className="px-6 py-4 font-semibold">ESTADO</th>
                    <th className="px-6 py-4 font-semibold text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7edf3]">
                  {sortedGuardias.map((shift) => {
                    const date = new Date(shift.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
                    const initials = shift.paciente?.nombre?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'PT'
                    const isProgress = shift.estado === 'En Progreso'
                    const needsReport = shift.estado === 'Completado' && !shift.informe
                    const isCompleted = shift.estado === 'Completado' && shift.informe
                    const canCancel = shift.estado !== 'Completado' && shift.estado !== 'Cancelado'

                    return (
                      <tr key={shift.id} className="hover:bg-[#f6f7f8]/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-[#0d141b]">{shift.paciente?.nombre || 'Sin paciente'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#0d141b]">{date}</p>
                          <p className={`text-xs ${isProgress ? 'text-blue-600 font-semibold' : 'text-[#4c739a]'}`}>
                            {isProgress ? 'En progreso' : `${shift.horaInicio || '00:00'} - ${shift.horaFin || '00:00'}`}
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
                            {isProgress ? 'EN PROGRESO' : needsReport ? 'REQUIERE REPORTE' : isCompleted ? 'COMPLETADO' : 'PROGRAMADO'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isProgress ? (
                            <div className="flex justify-end items-center gap-3">
                              <button onClick={() => handleEditShift(shift)} className="text-[#2b8cee] font-semibold hover:underline text-sm">Editar registro</button>
                              {canCancel && <button onClick={() => handleCancelShift(shift)} className="text-red-600 font-semibold hover:underline text-sm">Cancelar</button>}
                            </div>
                          ) : needsReport ? (
                            <button onClick={() => handleEditShift(shift)} className="px-4 py-1.5 bg-[#2b8cee] text-white rounded-lg text-sm font-semibold hover:bg-blue-700">ENVIAR REPORTE</button>
                          ) : (
                            <div className="flex justify-end items-center gap-3">
                              {canCancel && <button onClick={() => handleCancelShift(shift)} className="text-red-600 font-semibold hover:underline text-sm">Cancelar</button>}
                              <button onClick={() => setSelectedShift(shift)} className="text-[#2b8cee] font-semibold hover:underline text-sm">
                                {isCompleted ? 'Ver reporte' : 'Detalles'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div ref={formRef} className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Registro rápido de atención</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#4c739a] mb-2">Paciente</label>
                  <select
                    className="w-full border border-[#e7edf3] rounded-lg p-3 bg-[#f6f7f8] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.paciente_id}
                    onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
                    required
                  >
                    <option value="">Selecciona paciente</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4c739a] mb-2">Tipo de atención</label>
                  <select
                    className="w-full border border-[#e7edf3] rounded-lg p-3 bg-[#f6f7f8] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.care_type}
                    onChange={(e) => setFormData({ ...formData, care_type: e.target.value })}
                  >
                    <option value="Administración de medicación">Administración de medicación</option>
                    <option value="Terapia física">Terapia física</option>
                    <option value="Cuidado personal">Cuidado personal</option>
                    <option value="Acompañamiento">Acompañamiento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#4c739a] mb-2">Medicamentos administrados</label>
                  <input
                    className="w-full border border-[#e7edf3] rounded-lg p-3 bg-[#f6f7f8] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.medicamentos}
                    onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                    placeholder="Ej: Paracetamol 500mg a las 09:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4c739a] mb-2">Novedades o incidencias</label>
                  <input
                    className="w-full border border-[#e7edf3] rounded-lg p-3 bg-[#f6f7f8] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.novedades}
                    onChange={(e) => setFormData({ ...formData, novedades: e.target.value })}
                    placeholder="Ej: Presión arterial elevada"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4c739a] mb-2">Observaciones y actividades realizadas</label>
                <textarea
                  className="w-full border border-[#e7edf3] rounded-lg p-3 bg-[#f6f7f8] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                  placeholder="Describe la atención realizada"
                  value={formData.informe}
                  onChange={(e) => setFormData({ ...formData, informe: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={saveDraft} type="button" className="px-6">Guardar borrador</Button>
                <Button variant="primary" type="submit" className="px-6">
                  {editingShiftId ? 'Actualizar reporte' : 'Enviar reporte final'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {selectedShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#0d141b]">Detalle de reporte</h3>
                <p className="text-sm text-[#4c739a]">Paciente: {selectedShift.paciente?.nombre || 'Sin paciente'} · {selectedShift.fecha}</p>
              </div>
              <button onClick={() => setSelectedShift(null)} className="text-[#4c739a] hover:text-[#0d141b]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-[#f6f7f8] rounded-lg p-4 whitespace-pre-line text-sm text-[#0d141b]">
              {selectedShift.informe || 'Este turno aún no tiene informe.'}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedShift(null)} type="button">Cerrar</Button>
              <Button variant="primary" onClick={() => { setSelectedShift(null); handleEditShift(selectedShift) }} type="button">Editar reporte</Button>
            </div>
          </div>
        </div>
      )}
    </CaregiverLayout>
  )
}
