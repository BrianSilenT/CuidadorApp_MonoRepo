import { useState, useEffect, useMemo } from 'react'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Button from '../../components/common/Button'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { incidenteService, pacienteService, unwrapList } from '../../services/api'
import { downloadCsv } from '../../utils/csv'

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterSeveridad, setFilterSeveridad] = useState('todas')
  const [searchTerm, setSearchTerm] = useState('')
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
    } catch {
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
    } catch {
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

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchEstado = filterEstado === 'todos' || inc.estado === filterEstado
      const matchSeveridad = filterSeveridad === 'todas' || inc.severidad === filterSeveridad
      const patientName = inc.paciente?.nombre || ''
      const caregiverName = inc.cuidador?.nombre || ''
      const matchSearch = `${patientName} ${caregiverName} ${inc.tipo || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      return matchEstado && matchSeveridad && matchSearch
    })
  }, [incidents, filterEstado, filterSeveridad, searchTerm])

  const exportCsv = () => {
    downloadCsv({
      fileName: `incidentes-${new Date().toISOString().split('T')[0]}.csv`,
      headers: ['ID', 'Fecha', 'Cuidador', 'Paciente', 'Tipo', 'Severidad', 'Estado', 'Descripción'],
      rows: filteredIncidents.map((item) => [
        item.id,
        item.fecha || '',
        item.cuidador?.nombre || 'Sin cuidador',
        item.paciente?.nombre || 'Sin paciente',
        item.tipo || '',
        item.severidad || '',
        item.estado || '',
        item.descripcion || ''
      ])
    })
  }

  return (
    <CaregiverLayout title="Reporte de incidencias">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-sm text-[#4c739a] mb-1">Resumen &gt; Incidencias</div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Reporte de incidencias</h1>
            <p className="text-[#4c739a] mt-1">Registra y consulta eventos de seguridad o novedades clínicas relevantes.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white" onClick={exportCsv}>
              <span className="material-symbols-outlined mr-2 text-sm">download</span>
              Exportar
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Reportar incidencia
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e7edf3] flex gap-4 items-center bg-white flex-wrap">
            <span className="text-sm font-semibold text-[#0d141b]">Filtrar por:</span>
            <select className="border border-[#e7edf3] rounded-lg px-3 py-2 text-sm bg-white" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Revisado">Revisado</option>
              <option value="Resuelto">Resuelto</option>
            </select>
            <select className="border border-[#e7edf3] rounded-lg px-3 py-2 text-sm bg-white" value={filterSeveridad} onChange={(e) => setFilterSeveridad(e.target.value)}>
              <option value="todas">Todas las severidades</option>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
            <div className="ml-auto relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-sm">search</span>
              <input
                type="text"
                placeholder="Buscar por paciente, cuidador o tipo..."
                className="pl-9 pr-4 py-2 border border-[#e7edf3] rounded-lg text-sm w-72"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8"><LoadingState label="Cargando incidentes..." /></div>
          ) : error ? (
            <div className="p-8"><ErrorState message={error} /></div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-8"><EmptyState label="No hay incidentes reportados con esos filtros." /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f7f8] text-[#4c739a] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">FECHA</th>
                  <th className="px-6 py-4 font-semibold">CUIDADOR</th>
                  <th className="px-6 py-4 font-semibold">PACIENTE</th>
                  <th className="px-6 py-4 font-semibold">TIPO</th>
                  <th className="px-6 py-4 font-semibold">SEVERIDAD</th>
                  <th className="px-6 py-4 font-semibold">ESTADO</th>
                  <th className="px-6 py-4 font-semibold">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7edf3]">
                {filteredIncidents.map((inc) => {
                  const date = new Date(inc.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
                  const caregiverInitials = inc.cuidador?.nombre?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'CG'

                  return (
                    <tr key={inc.id} className="hover:bg-[#f6f7f8]/50">
                      <td className="px-6 py-4 text-[#4c739a]">{date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {caregiverInitials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0d141b]">{inc.cuidador?.nombre || 'Sin cuidador'}</p>
                            <p className="text-xs text-[#4c739a]">ID: #{inc.cuidador?.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#4c739a]">{inc.paciente?.nombre || 'Sin paciente'}</td>
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
                        <button onClick={() => setSelectedIncident(inc)} className="text-[#2b8cee] font-semibold hover:underline">Ver detalle</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-[#e7edf3] flex justify-between items-center text-sm text-[#4c739a]">
            <span>Mostrando {filteredIncidents.length} resultados</span>
            <span>Vista única</span>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Reportar nueva incidencia</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Paciente</label>
                  <select
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
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
                  <label className="block text-sm font-semibold mb-1">Tipo</label>
                  <select
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="Caída">Caída</option>
                    <option value="Medicación">Medicación</option>
                    <option value="Agresión">Agresión</option>
                    <option value="Equipamiento">Equipamiento</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Severidad</label>
                  <select
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.severidad}
                    onChange={(e) => setFormData({ ...formData, severidad: e.target.value })}
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Descripción</label>
                  <textarea
                    className="w-full border border-[#e7edf3] rounded-lg p-2 h-24"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowModal(false)} type="button">Cancelar</Button>
                  <Button variant="primary" type="submit">Enviar incidencia</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedIncident && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Detalle de incidencia</h2>
                <button onClick={() => setSelectedIncident(null)} className="text-[#4c739a] hover:text-[#0d141b]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-2 text-sm text-[#0d141b]">
                <p><strong>Paciente:</strong> {selectedIncident.paciente?.nombre || 'Sin paciente'}</p>
                <p><strong>Cuidador:</strong> {selectedIncident.cuidador?.nombre || 'Sin cuidador'}</p>
                <p><strong>Fecha:</strong> {new Date(selectedIncident.fecha).toLocaleString('es-ES')}</p>
                <p><strong>Tipo:</strong> {selectedIncident.tipo}</p>
                <p><strong>Severidad:</strong> {selectedIncident.severidad}</p>
                <p><strong>Estado:</strong> {selectedIncident.estado}</p>
                <div className="bg-[#f6f7f8] rounded-lg p-3 whitespace-pre-line">
                  {selectedIncident.descripcion}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CaregiverLayout>
  )
}
