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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
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

    loadData()
  }, [])

  const cuidadoresActivos = useMemo(() => cuidadores.filter((item) => item.activo).length, [cuidadores])
  const horasTotales = useMemo(() => guardias.reduce((sum, item) => sum + (item.horasTrabajadas || 0), 0), [guardias])
  const pagosPendientes = useMemo(() => pagos.filter((item) => !item.confirmado).length, [pagos])
  const montoPendiente = useMemo(
    () => pagos.filter((item) => !item.confirmado).reduce((sum, item) => sum + (item.monto || 0), 0),
    [pagos]
  )
  const actividadReciente = useMemo(() => guardias.slice(0, 6), [guardias])

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
              title="Horas Registradas"
              value={`${horasTotales}h`}
              icon="schedule"
            />
            <StatCard
              title="Monto Pendiente"
              value={`$${montoPendiente.toFixed(2)}`}
              icon="payments"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
              {actividadReciente.length === 0 ? (
                <EmptyState label="No hay guardias registradas todavía." />
              ) : (
                <div className="space-y-3">
                  {actividadReciente.map((guardia) => (
                    <div key={guardia.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f6f7f8]">
                    <div className="w-10 h-10 rounded-full bg-[#2b8cee]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#2b8cee]">event_note</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {guardia.paciente?.nombre || 'Paciente sin nombre'} · {guardia.horasTrabajadas || 0}h
                        </p>
                        <p className="text-xs text-[#4c739a]">
                          {guardia.fecha || 'Sin fecha'} · {guardia.cuidador?.nombre || 'Cuidador no asignado'}
                        </p>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-4">Estado Financiero</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="material-symbols-outlined text-blue-600">payments</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Pagos pendientes: {pagosPendientes}</p>
                    <p className="text-xs text-blue-700">Monto acumulado: ${montoPendiente.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Pagos confirmados: {pagos.length - pagosPendientes}</p>
                    <p className="text-xs text-emerald-700">Registros financieros actualizados desde base real.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
