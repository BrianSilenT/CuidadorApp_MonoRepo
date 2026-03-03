import { useState, useEffect, useMemo } from 'react'
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
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('ultima_visita')
  const [formData, setFormData] = useState({
    paciente_id: '',
    condicion: '',
    estado: 'Estable',
    notas: ''
  })

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [logsRes, pacRes] = await Promise.all([
        logPacienteService.getAll(),
        pacienteService.getAll()
      ])
      setLogs(unwrapList(logsRes.data))
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
      await logPacienteService.create(formData)
      setShowModal(false)
      setFormData({ paciente_id: '', condicion: '', estado: 'Estable', notas: '' })
      loadData()
    } catch {
      alert('Error al crear registro clínico.')
    }
  }

  const patientLatestLogs = useMemo(() => {
    const rows = pacientes.map((p) => {
      const pLogs = logs
        .filter((l) => l.paciente?.id === p.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      return {
        ...p,
        latestLog: pLogs[0] || null,
        allLogs: pLogs
      }
    })

    const filtered = rows.filter((p) => p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))

    if (sortBy === 'nombre') {
      return filtered.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    }

    return filtered.sort((a, b) => {
      const dateA = a.latestLog?.fecha ? new Date(a.latestLog.fecha) : new Date(0)
      const dateB = b.latestLog?.fecha ? new Date(b.latestLog.fecha) : new Date(0)
      return dateB - dateA
    })
  }, [pacientes, logs, searchTerm, sortBy])

  const updatesToday = logs.filter((l) => new Date(l.fecha).toDateString() === new Date().toDateString()).length
  const criticalStatus = patientLatestLogs.filter((p) => p.latestLog?.estado === 'Crítico').length

  const openCreateForPaciente = (paciente) => {
    setFormData((prev) => ({
      ...prev,
      paciente_id: paciente.id,
      condicion: paciente.latestLog?.condicion || '',
      estado: paciente.latestLog?.estado || 'Estable',
      notas: ''
    }))
    setShowModal(true)
  }

  return (
    <CaregiverLayout title="Registros de pacientes">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-sm text-[#4c739a] mb-1">Resumen &gt; Registros de pacientes</div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Registros de pacientes</h1>
            <p className="text-[#4c739a] mt-1">Consulta historial clínico y agrega notas de atención diarias.</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => {
                setSearchTerm('')
                setSortBy('ultima_visita')
              }}
            >
              <span className="material-symbols-outlined mr-2 text-sm">filter_list</span>
              Limpiar filtros
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Nuevo registro
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">Pacientes asignados</p>
              <p className="text-2xl font-bold text-[#0d141b]">{pacientes.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">Actualizaciones hoy</p>
              <p className="text-2xl font-bold text-[#0d141b]">{updatesToday}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined">error</span>
            </div>
            <div>
              <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider">Estado crítico</p>
              <p className="text-2xl font-bold text-[#0d141b]">{criticalStatus}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e7edf3] flex justify-between items-center bg-white">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-sm">search</span>
              <input
                type="text"
                placeholder="Buscar paciente..."
                className="pl-9 pr-4 py-2 border border-[#e7edf3] rounded-lg text-sm w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#4c739a]">Ordenar por:</span>
              <select
                className="border-none bg-transparent font-semibold text-[#0d141b] focus:ring-0 cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="ultima_visita">Última visita</option>
                <option value="nombre">Nombre</option>
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
                  <th className="px-6 py-4 font-semibold">PACIENTE</th>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">CONDICIÓN</th>
                  <th className="px-6 py-4 font-semibold">ÚLTIMA VISITA</th>
                  <th className="px-6 py-4 font-semibold">ESTADO</th>
                  <th className="px-6 py-4 font-semibold text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7edf3]">
                {patientLatestLogs.map((p) => {
                  const initials = p.nombre?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'PT'
                  const lastVisit = p.latestLog
                    ? new Date(p.latestLog.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Sin visitas'
                  const condition = p.latestLog?.condicion || 'Sin especificar'
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
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => setSelectedPaciente(p)} className="text-[#2b8cee] font-semibold hover:underline text-sm">Ver historial</button>
                          <button onClick={() => openCreateForPaciente(p)} className="flex items-center gap-1 px-3 py-1.5 border border-[#e7edf3] rounded-lg text-sm font-semibold hover:bg-gray-50">
                            <span className="material-symbols-outlined text-[16px]">edit_note</span>
                            Nueva nota
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
            <span>Mostrando {patientLatestLogs.length} de {patientLatestLogs.length} resultados</span>
            <span>Vista única</span>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Nuevo registro del paciente</h2>
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
                  <label className="block text-sm font-semibold mb-1">Condición</label>
                  <input
                    type="text"
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.condicion}
                    onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                    placeholder="Ej: Demencia, Diabetes tipo 2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Estado</label>
                  <select
                    className="w-full border border-[#e7edf3] rounded-lg p-2"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Estable">Estable</option>
                    <option value="Activo">Activo</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Notas de atención</label>
                  <textarea
                    className="w-full border border-[#e7edf3] rounded-lg p-2 h-24"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowModal(false)} type="button">Cancelar</Button>
                  <Button variant="primary" type="submit">Guardar registro</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedPaciente && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Historial de {selectedPaciente.nombre}</h2>
                <button onClick={() => setSelectedPaciente(null)} className="text-[#4c739a] hover:text-[#0d141b]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {selectedPaciente.allLogs?.length ? (
                <div className="space-y-3">
                  {selectedPaciente.allLogs.map((item) => (
                    <div key={item.id} className="border border-[#e7edf3] rounded-lg p-4">
                      <p className="text-xs text-[#4c739a] mb-1">{new Date(item.fecha).toLocaleString('es-ES')}</p>
                      <p className="text-sm font-semibold text-[#0d141b]">{item.condicion} · {item.estado}</p>
                      <p className="text-sm text-[#4c739a] mt-2 whitespace-pre-line">{item.notas}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState label="Este paciente no tiene registros aún." />
              )}
            </div>
          </div>
        )}
      </div>
    </CaregiverLayout>
  )
}
