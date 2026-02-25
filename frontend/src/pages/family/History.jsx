import { useState } from 'react'
import FamilyLayout from '../../components/layouts/FamilyLayout'
import Input from '../../components/common/Input'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import api, { unwrapList } from '../../services/api'

export default function History() {
  const [pacienteId, setPacienteId] = useState('')
  const [historyRows, setHistoryRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadHistory = async (event) => {
    event.preventDefault()
    setError('')

    const id = Number(pacienteId)
    if (!id || id <= 0) {
      setError('Debes ingresar un ID de paciente válido (número mayor a 0).')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/guardias/paciente/${id}`)
      setHistoryRows(unwrapList(response.data))
    } catch {
      setError('No se pudo cargar el historial. Verifica el ID de paciente y permisos de la sesión.')
      setHistoryRows([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <FamilyLayout title="Historial de Servicios">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Historial de Servicios"
          description="Archivo completo de sesiones anteriores, asignaciones de cuidadores y reportes detallados."
          breadcrumb={[
            { label: 'Familia', path: '/family/dashboard' },
            { label: 'Historial' }
          ]}
        />

        <div className="bg-white border border-[#e7edf3] rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-end">
            <form onSubmit={loadHistory} className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-auto">
              <Input
                label="ID de Paciente"
                type="number"
                name="pacienteId"
                value={pacienteId}
                onChange={(event) => setPacienteId(event.target.value)}
                placeholder="Ej: 1"
                required
              />
              <button type="submit" className="h-[42px] self-end rounded-lg bg-[#2b8cee] text-white px-4 text-sm font-bold hover:bg-blue-600 transition-colors">
                Buscar
              </button>
            </form>

            <div className="flex gap-2 w-full md:w-auto">
              <button className="h-10 px-4 rounded-lg border border-[#e7edf3] text-sm font-semibold text-[#4c739a] hover:bg-[#f6f7f8]">Servicios Recientes</button>
              <button className="h-10 px-4 rounded-lg border border-[#e7edf3] text-sm font-semibold text-[#4c739a] hover:bg-[#f6f7f8]">Exportar CSV</button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e7edf3] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading && <LoadingState label="Cargando historial..." />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && historyRows.length === 0 && (
              <EmptyState label="Sin resultados todavía para el paciente indicado." />
            )}

            {!loading && !error && historyRows.length > 0 && (
              <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-[#f6f7f8] border-b border-[#e7edf3]">
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Fecha</th>
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Horario</th>
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Paciente</th>
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Cuidador</th>
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Horas</th>
                      <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#4c739a]">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.map((item) => (
                      <tr key={item.id} className="border-b border-[#e7edf3] hover:bg-[#f6f7f8] transition-colors">
                        <td className="py-4 px-4 text-sm font-medium">{item.fecha || 'N/A'}</td>
                        <td className="py-4 px-4 text-sm text-[#4c739a]">09:00 AM - 01:00 PM</td>
                        <td className="py-4 px-4 text-sm text-[#0d141b]">{item.paciente?.nombre || 'Paciente N/A'}</td>
                        <td className="py-4 px-4 text-sm text-[#4c739a]">{item.cuidador?.nombre || 'N/A'}</td>
                        <td className="py-4 px-4 text-sm text-[#4c739a]">{item.horasTrabajadas || 0}h</td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-sm font-semibold text-[#2b8cee] hover:text-blue-700">Ver reporte</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
    </FamilyLayout>
  )
}