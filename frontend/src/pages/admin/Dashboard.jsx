import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/DataState'
import { cuidadorService, guardiaService, pacienteService, pagoService, unwrapList } from '../../services/api'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cuidadores, setCuidadores] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [guardias, setGuardias] = useState([])
  const [pagos, setPagos] = useState([])

  const loadData = async () => {
    try {
      const [cRes, pRes, gRes, paRes] = await Promise.all([
        cuidadorService.getAll(),
        pacienteService.getAll(),
        guardiaService.getAll(),
        pagoService.getAll()
      ])
      setCuidadores(unwrapList(cRes.data))
      setPacientes(unwrapList(pRes.data))
      setGuardias(unwrapList(gRes.data))
      setPagos(unwrapList(paRes.data))
    } catch {
      setError('No se pudo cargar el resumen de administración.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const cuidadoresActivos = useMemo(() => cuidadores.filter((item) => item.activo).length, [cuidadores])
  const reportesPendientes = useMemo(() => guardias.filter((item) => item.estadoInforme === 'Pendiente' && item.informe).length, [guardias])
  const montoPendiente = useMemo(
    () => pagos.filter((item) => !item.confirmado).reduce((sum, item) => sum + (item.monto || 0), 0),
    [pagos]
  )
  
  const guardiasConReporte = useMemo(() => {
     return guardias.filter(g => g.informe).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [guardias])
  
  const handleAprobarReporte = async (id) => {
    try {
      await guardiaService.update(id, { estado_informe: 'Aprobado' })
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSolicitarRevision = async (id) => {
    try {
      await guardiaService.update(id, { estado_informe: 'Requiere Revisión' })
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  // Calculate satisfaction rate
  const satisfactionRate = useMemo(() => {
    const ratedGuardias = guardias.filter(g => g.calificacion)
    if (ratedGuardias.length === 0) return 0
    const sum = ratedGuardias.reduce((acc, g) => acc + g.calificacion, 0)
    return (sum / ratedGuardias.length).toFixed(1)
  }, [guardias])

  const totalReviews = useMemo(() => guardias.filter(g => g.calificacion).length, [guardias])
  const recentReviews = useMemo(() => guardias.filter(g => g.calificacion).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 3), [guardias])

  return (
    <AdminLayout title="Resumen General">
      <div className="p-8 space-y-8 bg-[#f6f7f8] min-h-full">
        {loading && <LoadingState label="Cargando resumen..." />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Cuidadores Activos"
              value={`${cuidadoresActivos}`}
              icon="medical_services"
            />
            <StatCard
              title="Pacientes en Atención"
              value={`${pacientes.length}`}
              icon="personal_injury"
            />
            <StatCard
              title="Reportes Pendientes"
              value={`${reportesPendientes}`}
              icon="pending_actions"
            />
            <StatCard
              title="Monto Pendiente"
              value={`$${montoPendiente.toFixed(2)}`}
              icon="payments"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <h3 className="text-lg font-bold mb-4">Revisión de Reportes de Cuidadores</h3>
                {guardiasConReporte.length === 0 ? (
                  <EmptyState label="No hay reportes para revisar." />
                ) : (
                  <div className="space-y-4">
                    {guardiasConReporte.map((guardia) => (
                      <div key={guardia.id} className="border border-[#e7edf3] rounded-xl p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-[#0d141b]">{guardia.cuidador?.nombre || 'Cuidador'} <span className="text-sm font-normal text-[#4c739a]">reportó sobre</span> {guardia.paciente?.nombre || 'Paciente'}</p>
                            <p className="text-xs text-[#4c739a]">{new Date(guardia.fecha).toLocaleDateString('es-ES')} · Turno: {guardia.horaInicio || 'N/A'} - {guardia.horaFin || 'N/A'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            guardia.estadoInforme === 'Aprobado' ? 'bg-green-100 text-green-700' :
                            guardia.estadoInforme === 'Requiere Revisión' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {guardia.estadoInforme || 'Pendiente'}
                          </span>
                        </div>
                        <div className="bg-[#f6f7f8] p-3 rounded-lg text-sm text-[#0d141b] mb-3">
                          "{guardia.informe}"
                        </div>
                        {(!guardia.estadoInforme || guardia.estadoInforme === 'Pendiente') && (
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleSolicitarRevision(guardia.id)}
                              className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              Solicitar Revisión
                            </button>
                            <button 
                              onClick={() => handleAprobarReporte(guardia.id)}
                              className="px-3 py-1.5 text-sm font-semibold text-white bg-[#2b8cee] hover:bg-[#1a75d2] rounded-lg transition-colors"
                            >
                              Aprobar Reporte
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-bold mb-2">Tasa de Satisfacción</h3>
                <p className="text-sm text-[#4c739a] mb-6">Basado en {totalReviews} evaluaciones de clientes</p>
                
                <div className="text-center mb-8">
                  <h2 className="text-5xl font-bold text-[#0d141b] mb-2">{satisfactionRate}</h2>
                  <div className="flex justify-center gap-1 text-amber-400 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {star <= Math.round(satisfactionRate) ? 'star' : 'star_border'}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-4">Comentarios Recientes</h4>
                  <div className="space-y-4">
                    {recentReviews.length > 0 ? recentReviews.map(review => (
                      <div key={review.id} className="border-b border-[#e7edf3] pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-bold text-[#0d141b]">{review.paciente?.nombre}</p>
                          <div className="flex text-amber-400 text-xs">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {star <= review.calificacion ? 'star' : 'star_border'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#4c739a] italic">"{review.comentarioCalificacion || 'Sin comentario'}"</p>
                        <p className="text-[10px] text-[#4c739a] mt-1">Cuidador: {review.cuidador?.nombre}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-[#4c739a]">No hay evaluaciones recientes.</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
