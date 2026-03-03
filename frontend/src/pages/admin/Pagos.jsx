import { useEffect, useState, useMemo } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import api, { pagoService, unwrapList } from '../../services/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Pagos() {
  const [activeTab, setActiveTab] = useState('pending')
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  const loadPagos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await pagoService.getAll()
      setPagos(unwrapList(response.data))
    } catch (err) {
      console.error(err)
      if (err.response && err.response.status === 403) {
        setError("Error de permisos: No tienes acceso a los registros de pagos.")
      } else {
        setError("No se pudieron cargar los pagos.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPagos()
  }, [])

  const filteredPagos = useMemo(() => {
    return pagos
      .filter(p => activeTab === 'pending' ? !p.confirmado : p.confirmado)
      .sort((a, b) => {
        const dateA = a.fechaPago ? new Date(a.fechaPago) : new Date(0)
        const dateB = b.fechaPago ? new Date(b.fechaPago) : new Date(0)
        return dateB - dateA
      })
  }, [pagos, activeTab])

  const confirmarPago = async (id) => {
    if (!window.confirm('¿Confirmar que este pago ha sido realizado?')) return
    setConfirmingId(id)
    try {
        await api.put(`/pagos/${id}/confirmar`)
        // Optimistic update
        setPagos(prev => prev.map(p => p.id === id ? { ...p, confirmado: true } : p))
        // Or reload
        // await loadPagos()
        if (activeTab === 'pending') {
            // It will disappear from pending, which is expected
        }
    } catch {
        alert('Error al confirmar el pago.')
    } finally {
        setConfirmingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <PageHeader 
            title="Gestión de Pagos" 
            description="Control financiero y confirmación de pagos a cuidadores."
            breadcrumb={[
                { label: 'Administración', path: '/admin/dashboard' },
                { label: 'Pagos' }
            ]}
        >
            <Button onClick={loadPagos} variant="secondary">Actualizar</Button>
        </PageHeader>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
               Pendientes de Confirmación
               {pagos.filter(p => !p.confirmado).length > 0 && (
                  <span className="bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs font-bold">
                    {pagos.filter(p => !p.confirmado).length}
                  </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Historial de Pagos
            </button>
          </nav>
        </div>

        {loading ? (
           <LoadingState label="Cargando pagos..." />
        ) : error ? (
           <ErrorState message={error} retry={loadPagos} />
        ) : (
           <Card className="overflow-hidden">
             {filteredPagos.length === 0 ? (
                <EmptyState 
                    title={activeTab === 'pending' ? "Todo al día" : "Sin historial"} 
                    description={activeTab === 'pending' ? "No hay pagos pendientes de confirmación." : "No hay registros de pagos anteriores."}
                />
             ) : (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuidador</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      {activeTab === 'pending' && (
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           {pago.fechaPago ? format(new Date(pago.fechaPago), 'dd MMM yyyy', { locale: es }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{pago.cuidador?.nombre || 'Desconocido'}</div>
                            <div className="text-xs text-gray-500">ID: {pago.cuidador?.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {pago.metodo || 'Transferencia'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                            ${pago.monto?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            {pago.confirmado ? (
                                <Badge variant="success">Confirmado</Badge>
                            ) : (
                                <Badge variant="warning">Pendiente</Badge>
                            )}
                        </td>
                         {activeTab === 'pending' && (
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <Button 
                                    size="sm" 
                                    variant="primary" 
                                    onClick={() => confirmarPago(pago.id)}
                                    disabled={confirmingId === pago.id}
                                >
                                    {confirmingId === pago.id ? '...' : 'Confirmar'}
                                </Button>
                            </td>
                         )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
             )}
           </Card>
        )}
      </div>
    </AdminLayout>
  )
}
