import { useMemo, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { cuidadorService } from '../../services/api'
import useResourceList from '../../hooks/useResourceList'

export default function SolicitudesCuidadores() {
  const [processingId, setProcessingId] = useState(null)

  const {
    items: cuidadores,
    loading,
    error,
    setError,
    refresh
  } = useResourceList({
    fetcher: cuidadorService.getAll,
    errorMessage: 'No se pudieron cargar las solicitudes de cuidadores.'
  })

  const solicitudes = useMemo(
    () => cuidadores.filter((item) => item.activo === false),
    [cuidadores]
  )

  const aprobarSolicitud = async (cuidador) => {
    setProcessingId(cuidador.id)
    setError('')
    try {
      await cuidadorService.update(cuidador.id, {
        nombre: cuidador.nombre,
        documento: cuidador.documento,
        telefono: cuidador.telefono,
        activo: true
      })
      await refresh()
    } catch {
      setError('No se pudo aprobar la solicitud del cuidador.')
    } finally {
      setProcessingId(null)
    }
  }

  const rechazarSolicitud = async (cuidadorId) => {
    const confirmed = window.confirm('¿Rechazar y eliminar esta solicitud de cuidador?')
    if (!confirmed) return

    setProcessingId(cuidadorId)
    setError('')
    try {
      await cuidadorService.delete(cuidadorId)
      await refresh()
    } catch {
      setError('No se pudo rechazar la solicitud del cuidador.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <AdminLayout title="Solicitudes de Cuidadores">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Solicitudes de Registro"
          description="Aprueba o rechaza cuidadores antes de permitir su acceso a la plataforma."
          breadcrumb={[
            { label: 'Administración', path: '/admin/dashboard' },
            { label: 'Solicitudes' }
          ]}
        />

        <Card>
          {loading && <LoadingState label="Cargando solicitudes..." />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && solicitudes.length === 0 && (
            <EmptyState label="No hay solicitudes pendientes de aprobación." />
          )}

          {!loading && !error && solicitudes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#e7edf3]">
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Documento</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Teléfono</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-[#4c739a]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((cuidador) => (
                    <tr key={cuidador.id} className="border-b border-[#e7edf3] hover:bg-[#f6f7f8]">
                      <td className="py-3 px-4 text-sm font-semibold">{cuidador.nombre}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">{cuidador.documento || 'Sin documento'}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">{cuidador.telefono || 'Sin teléfono'}</td>
                      <td className="py-3 px-4 text-sm text-amber-700">Pendiente</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={processingId === cuidador.id}
                            onClick={() => aprobarSolicitud(cuidador)}
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={processingId === cuidador.id}
                            onClick={() => rechazarSolicitud(cuidador.id)}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
