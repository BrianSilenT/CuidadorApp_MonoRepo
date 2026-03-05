import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, ErrorState } from '../../components/common/DataState'
import { reporteService, guardiaService, unwrapList } from '../../services/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Reportes() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    cuidadores: { total: 0 },
    pacientes: { total: 0 },
    guardias: { total: 0, totalHoras: 0 }
  })
  const [recentPayments, setRecentPayments] = useState([])
  const [topCuidadores, setTopCuidadores] = useState([])
  const [allCuidadores, setAllCuidadores] = useState([])
  const [selectedCaregiverId, setSelectedCaregiverId] = useState('')
  const [selectedCaregiverReports, setSelectedCaregiverReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [resumen, pagosInfo, cuidadoresInfo] = await Promise.all([
        reporteService.getResumen(),
        reporteService.getPagos(), 
        reporteService.getCuidadores()
      ])

      setStats(resumen.data)
      const detallePagos = Array.isArray(pagosInfo.data?.detalle) ? pagosInfo.data.detalle : []
      setRecentPayments(detallePagos.slice(0, 5))

      const rawCuidadores = Array.isArray(cuidadoresInfo.data) ? cuidadoresInfo.data : unwrapList(cuidadoresInfo.data)
      const cuidadores = rawCuidadores.map((item) => ({
        ...(item.cuidador || {}),
        totalHoras: item.totalHoras || 0,
        totalGuardias: item.totalGuardias || 0,
        pacientesAtendidos: item.pacientesAtendidos || 0
      }))
      setAllCuidadores(cuidadores)
      setTopCuidadores(cuidadores.slice(0, 5))

    } catch (err) {
      console.error(err)
      if (err.response && err.response.status === 403) {
        setError('Acceso denegado: Se requieren permisos de administrador.')
      } else {
        setError('No se pudieron cargar los reportes.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const loadCaregiverReports = async () => {
      if (!selectedCaregiverId) {
        setSelectedCaregiverReports([])
        return
      }

      setReportsLoading(true)
      try {
        const response = await guardiaService.getByCuidador(selectedCaregiverId)
        const guardias = unwrapList(response.data)
        const withReports = guardias
          .filter((item) => Boolean(item.informe))
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        setSelectedCaregiverReports(withReports)
      } catch {
        setSelectedCaregiverReports([])
      } finally {
        setReportsLoading(false)
      }
    }

    loadCaregiverReports()
  }, [selectedCaregiverId])

  return (
    <AdminLayout>
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <PageHeader
          title="Panel de Reportes"
          description="Visión general de la operación y métricas clave."
          breadcrumb={[
            { label: 'Administración', path: '/admin/dashboard' },
            { label: 'Reportes' }
          ]}
        />

        {loading ? (
          <LoadingState label="Generando reportes..." />
        ) : error ? (
          <ErrorState message={error} retry={loadData} />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Cuidadores registrados"
                value={stats.cuidadores?.total || 0}
                icon="medical_services"
                trend="up"
                trendValue="+2% mes"
              />
              <StatCard
                title="Pacientes activos"
                value={stats.pacientes?.total || 0}
                icon="elderly"
                trend="up"
                trendValue="+5% mes"
              />
              <StatCard
                title="Guardias realizadas"
                value={stats.guardias?.total || 0}
                icon="event_available"
              />
              <StatCard
                title="Horas facturadas"
                value={`${stats.guardias?.totalHoras || 0}h`}
                icon="schedule"
                trend="down"
                trendValue="-1% mes"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Cuidadores */}
              <Card className="h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Top Cuidadores (Horas)</h3>
                  <Link to="/admin/cuidadores" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
                </div>
                {topCuidadores.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay datos suficientes.</p>
                ) : (
                  <div className="space-y-4">
                    {topCuidadores.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                           {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{c.nombre} {c.apellido}</p>
                            <p className="text-xs text-gray-500">Guardias: {c.totalGuardias || 0} · Pacientes: {c.pacientesAtendidos || 0}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{c.totalHoras || 0}h</p>
                          <p className="text-xs text-gray-500">Trabajadas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Ultimos Pagos */}
              <Card className="h-full">
                 <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Últimos Pagos</h3>
                  <Link to="/admin/pagos" className="text-sm text-blue-600 hover:underline">Ver finanzas</Link>
                </div>
                {recentPayments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay pagos registrados.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Cuidador</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPayments.map((p) => (
                                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {p.fecha_pago || p.fechaPago ? format(new Date(p.fecha_pago || p.fechaPago), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                                            {p.cuidador?.nombre || 'Cuidador'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-green-600">
                                            ${p.monto}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
              </Card>
            </div>

            <Card>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <h3 className="text-lg font-bold text-gray-900">Reportes por Cuidador</h3>
                <select
                  className="border border-[#e7edf3] rounded-lg px-3 py-2 text-sm bg-white min-w-[260px]"
                  value={selectedCaregiverId}
                  onChange={(event) => setSelectedCaregiverId(event.target.value)}
                >
                  <option value="">Selecciona un cuidador</option>
                  {allCuidadores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {reportsLoading ? (
                <LoadingState label="Cargando reportes del cuidador..." />
              ) : selectedCaregiverId && selectedCaregiverReports.length === 0 ? (
                <p className="text-sm text-gray-500">Este cuidador aún no tiene reportes con informe.</p>
              ) : selectedCaregiverId ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Paciente</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Informe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCaregiverReports.map((item) => (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.fecha ? format(new Date(item.fecha), 'dd/MM/yyyy', { locale: es }) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{item.paciente?.nombre || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{item.estado || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="line-clamp-2 text-gray-700">{item.informe}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Selecciona un cuidador para ver sus reportes enviados.</p>
              )}
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
