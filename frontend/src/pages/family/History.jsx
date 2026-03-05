import { useState, useEffect, useMemo } from 'react'
import FamilyLayout from '../../components/layouts/FamilyLayout'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { guardiaService, unwrapList, pacienteService } from '../../services/api'
import { downloadCsv } from '../../utils/csv'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function History() {
  const [historyRows, setHistoryRows] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  
  // Filters
  const [filterPaciente, setFilterPaciente] = useState('')
  const [filterFechaMonth, setFilterFechaMonth] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
        const [guardiasRes, pacientesRes] = await Promise.all([
            guardiaService.getMine(),
            pacienteService.getAll()
        ])
        
        const guardias = unwrapList(guardiasRes.data).sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
        setHistoryRows(guardias)
        setPacientes(unwrapList(pacientesRes.data))
        
    } catch (err) {
        console.error(err)
        setError('No se pudo cargar el historial. Verifica tu conexión.')
    } finally {
        setLoading(false)
    }
  }

  const filteredRows = useMemo(() => {
    return historyRows.filter(row => {
        const matchesPaciente = filterPaciente ? (row.pacienteId === Number(filterPaciente) || row.paciente?.id === Number(filterPaciente)) : true
        const matchesMonth = filterFechaMonth ? row.fecha.startsWith(filterFechaMonth) : true
        return matchesPaciente && matchesMonth
    })
  }, [historyRows, filterPaciente, filterFechaMonth])

  const exportCsv = () => {
    downloadCsv({
      fileName: `historial-familiar-${format(new Date(), 'yyyyMMdd')}.csv`,
      headers: ['ID', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Paciente', 'Cuidador', 'Horas', 'Estado', 'Informe'],
      rows: filteredRows.map((item) => [
        item.id,
        item.fecha || '',
        item.horaInicio || item.hora_inicio || '',
        item.horaFin || item.hora_fin || '',
        item.paciente?.nombre || 'Desconocido',
        item.cuidador?.nombre || 'Pendiente',
        item.horasTrabajadas || 0,
        item.estado || 'Pendiente',
        (item.informe || '').replace(/\n/g, ' ')
      ])
    })
  }

  const canCancel = (item) => {
    const estado = (item.estado || '').toLowerCase()
    return estado !== 'completado' && estado !== 'cancelado'
  }

  const handleCancelShift = async (item) => {
    const confirmed = window.confirm('¿Deseas cancelar esta cita?')
    if (!confirmed) return

    try {
      await guardiaService.cancel(item.id)
      await loadData()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar la cita.')
    }
  }

  return (
    <FamilyLayout title="Historial de Servicios">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Historial de Servicios"
          description="Registro completo de todas las sesiones de cuidado realizadas y futuras."
          breadcrumb={[
            { label: 'Familia', path: '/family/dashboard' },
            { label: 'Historial' }
          ]}
        />

        <div className="bg-white border border-[#e7edf3] rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
             <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                {/* Paciente Filter */}
                <div className="w-full md:w-48">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por Paciente</label>
                    <select 
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-[#2b8cee] focus:border-[#2b8cee]"
                        value={filterPaciente}
                        onChange={(e) => setFilterPaciente(e.target.value)}
                    >
                        <option value="">Todos los pacientes</option>
                        {pacientes.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                </div>
                
                {/* Month Filter */}
                <div className="w-full md:w-48">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por Mes</label>
                    <input 
                        type="month" 
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm"
                        value={filterFechaMonth}
                        onChange={(e) => setFilterFechaMonth(e.target.value)}
                    />
                </div>
                
                <div className="self-end pb-0.5">
                    <button onClick={() => {setFilterPaciente(''); setFilterFechaMonth('')}} className="text-sm text-[#2b8cee] hover:underline font-bold">
                        Limpiar filtros
                    </button>
                </div>
             </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button type="button" onClick={exportCsv} disabled={filteredRows.length === 0} className="h-10 px-4 rounded-lg border border-[#e7edf3] text-sm font-semibold text-[#4c739a] hover:bg-[#f6f7f8] disabled:opacity-50 flex items-center gap-2">
                <span className="material-icons text-sm">download</span> Exportar CSV
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e7edf3] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading && <LoadingState label="Cargando historial completo..." />}
            {!loading && error && <ErrorState message={error} />}
            
            {!loading && !error && filteredRows.length === 0 && (
              <EmptyState label="No se encontraron sesiones con los filtros seleccionados." />
            )}

            {!loading && !error && filteredRows.length > 0 && (
              <table className="w-full min-w-[900px]">
                  <thead className="bg-[#f6f7f8] border-b border-[#e7edf3]">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Fecha</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Horario</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Paciente</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Cuidador</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Estado</th>
                      <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRows.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f6f7f8] transition-colors group">
                        <td className="py-4 px-6 text-sm font-bold text-[#0d141b]">
                            <div>{format(parseISO(item.fecha), 'dd MMM yyyy', { locale: es })}</div>
                            <div className="text-xs text-gray-400 font-normal capitalize">{format(parseISO(item.fecha), 'EEEE', { locale: es })}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono font-bold">
                                {item.horaInicio || item.hora_inicio}
                            </span>
                             <span className="mx-1 text-gray-400">-</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono font-bold">
                                {item.horaFin || item.hora_fin}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">{item.horasTrabajadas} hrs</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-[#0d141b] font-medium">
                            {item.paciente?.nombre || <span className="text-red-400 italic">Desconocido</span>}
                        </td>
                        <td className="py-4 px-6 text-sm">
                            {item.cuidador ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                        {item.cuidador.nombre.charAt(0)}
                                    </div>
                                    <span className="font-medium text-gray-700">{item.cuidador.nombre}</span>
                                </div>
                            ) : (
                                <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold border border-yellow-100">Pendiente</span>
                            )}
                        </td>
                        <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                item.estado === 'Completado' ? 'bg-green-100 text-green-800 border-green-200' :
                                item.estado === 'Cancelado' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                                {item.estado}
                            </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            {item.informe ? (
                              <button
                                onClick={() => setSelectedReport(item)}
                                className="text-xs font-bold text-[#2b8cee] hover:text-blue-700 border border-[#2b8cee] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                              >
                                Ver reporte
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Sin reporte</span>
                            )}
                            {canCancel(item) && (
                              <button
                                onClick={() => handleCancelShift(item)}
                                className="text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                              >
                                Cancelar cita
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
            
            {!loading && !error && filteredRows.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t text-xs text-gray-500 text-right">
                    Mostrando {filteredRows.length} registros
                </div>
            )}
          </div>
        </div>

        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#0d141b]">Reporte de atención</h3>
                <button onClick={() => setSelectedReport(null)} className="text-[#4c739a] hover:text-[#0d141b]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-2 text-sm text-[#0d141b] mb-4">
                <p><strong>Fecha:</strong> {selectedReport.fecha}</p>
                <p><strong>Paciente:</strong> {selectedReport.paciente?.nombre || 'Sin paciente'}</p>
                <p><strong>Cuidador:</strong> {selectedReport.cuidador?.nombre || 'Sin cuidador'}</p>
              </div>
              <div className="bg-[#f6f7f8] rounded-lg p-4 text-sm text-[#0d141b] whitespace-pre-line">
                {selectedReport.informe}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setSelectedReport(null)} className="px-4 py-2 rounded-lg border border-[#e7edf3] text-sm font-semibold text-[#4c739a] hover:bg-[#f6f7f8]">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FamilyLayout>
  )
}