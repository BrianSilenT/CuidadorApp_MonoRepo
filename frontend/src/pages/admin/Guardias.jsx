import { useEffect, useState, useMemo } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState } from '../../components/common/DataState'
import { guardiaService, unwrapList } from '../../services/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Guardias() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [guardias, setGuardias] = useState([])
  const [selectedGuardia, setSelectedGuardia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const loadGuardias = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await guardiaService.getAll()
      const data = unwrapList(response.data)
      setGuardias(data)
    } catch (err) {
      console.error(err)
      if (err.response && err.response.status === 403) {
        setError('No tienes permisos de administrador para ver esta sección.')
      } else {
        setError('Error al cargar los turnos.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuardias()
  }, [])

  const filteredGuardias = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    return guardias
      .filter(g => {
        if (!g.fecha) return false
        const [year, month, day] = g.fecha.split('-').map(Number)
        const d = new Date(year, month - 1, day)
        
        return activeTab === 'upcoming' ? d >= now : d < now
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha)
        const dateB = new Date(b.fecha)
        return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA
      })
  }, [guardias, activeTab])

  const getStatusBadge = (estado) => {
    const s = (estado || '').toLowerCase()
    if (s.includes('complet') || s.includes('finaliz')) return <Badge variant="success">Completado</Badge>
    if (s.includes('progre') || s.includes('curso')) return <Badge variant="info">En Curso</Badge>
    if (s.includes('cancel')) return <Badge variant="error">Cancelado</Badge>
    return <Badge variant="warning">Programado</Badge>
  }

  const canCancel = (guardia) => {
    const estado = (guardia?.estado || '').toLowerCase()
    return estado !== 'completado' && estado !== 'cancelado'
  }

  const handleCancelGuardia = async (guardia) => {
    const confirmed = window.confirm('¿Deseas cancelar esta cita?')
    if (!confirmed) return

    try {
      await guardiaService.cancel(guardia.id)
      await loadGuardias()
      if (selectedGuardia?.id === guardia.id) {
        setSelectedGuardia((prev) => ({ ...prev, estado: 'Cancelado' }))
      }
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar la cita.')
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader 
          title="Gestión de Turnos" 
          description="Supervisa y administra los turnos de los cuidadores."
          breadcrumb={[
            { label: 'Administración', path: '/admin/dashboard' },
            { label: 'Guardias' }
          ]}
        >
            <div className="flex gap-2">
                 <Button onClick={loadGuardias} variant="secondary">Actualizar</Button>
            </div>
        </PageHeader>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${
                activeTab === 'upcoming'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Próximos Turnos
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Historial
            </button>
          </nav>
        </div>

        {loading ? (
           <div className="py-10 text-center text-gray-500">Cargando turnos...</div>
        ) : error ? (
           <ErrorState message={error} />
        ) : (
           <Card className="overflow-hidden">
             {filteredGuardias.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    No hay turnos para mostrar en esta sección.
                </div>
             ) : (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuidador</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGuardias.map((guardia) => (
                      <tr key={guardia.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {format(new Date(guardia.fecha), 'PP', { locale: es })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {guardia.horaInicio} - {guardia.horaFin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs mr-3">
                                    {guardia.cuidador?.nombre?.[0] || 'C'}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {guardia.cuidador?.nombre} {guardia.cuidador?.apellido}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {guardia.paciente?.nombre} {guardia.paciente?.apellido}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(guardia.estado)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-3">
                              {canCancel(guardia) && (
                                <button onClick={() => handleCancelGuardia(guardia)} className="text-red-600 hover:text-red-800">Cancelar</button>
                              )}
                              <button onClick={() => setSelectedGuardia(guardia)} className="text-indigo-600 hover:text-indigo-900">Ver detalle</button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
             )}
           </Card>
        )}

        {selectedGuardia && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Detalle del turno</h3>
                <button onClick={() => setSelectedGuardia(null)} className="text-[#4c739a] hover:text-[#0d141b]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-2 text-sm text-[#0d141b]">
                <p><strong>Fecha:</strong> {selectedGuardia.fecha}</p>
                <p><strong>Horario:</strong> {selectedGuardia.horaInicio} - {selectedGuardia.horaFin}</p>
                <p><strong>Cuidador:</strong> {selectedGuardia.cuidador?.nombre || 'Sin asignar'}</p>
                <p><strong>Paciente:</strong> {selectedGuardia.paciente?.nombre || 'Sin paciente'}</p>
                <p><strong>Estado:</strong> {selectedGuardia.estado || '-'}</p>
                <p><strong>Ubicación:</strong> {selectedGuardia.ubicacion || 'No especificada'}</p>
              </div>
              {canCancel(selectedGuardia) && (
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => handleCancelGuardia(selectedGuardia)}
                    className="px-4 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Cancelar cita
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
