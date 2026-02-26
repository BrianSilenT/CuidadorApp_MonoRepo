import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import StatCard from '../../components/common/StatCard'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { reporteService, unwrapList } from '../../services/api'

export default function Reportes() {
  const [resumen, setResumen] = useState(null)
  const [cuidadores, setCuidadores] = useState([])
  const [guardias, setGuardias] = useState([])
  const [filters, setFilters] = useState({ desde: '', hasta: '' })
  const [loading, setLoading] = useState(true)
  const [loadingGuardias, setLoadingGuardias] = useState(false)
  const [error, setError] = useState('')
  const [guardiasError, setGuardiasError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [resumenRes, cuidadoresRes] = await Promise.all([
          reporteService.getResumen(),
          reporteService.getCuidadores()
        ])
        setResumen(resumenRes.data)
        setCuidadores(unwrapList(cuidadoresRes.data))
      } catch {
        setError('No se pudieron cargar los reportes generales. Requiere permisos de administrador.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const onFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const loadGuardiasPorRango = async (event) => {
    event.preventDefault()
    if (!filters.desde || !filters.hasta) {
      setGuardiasError('Debes indicar fecha desde y hasta.')
      return
    }

    setLoadingGuardias(true)
    setGuardiasError('')
    try {
      const response = await reporteService.getGuardiasPorFecha(filters.desde, filters.hasta)
      setGuardias(response.data?.guardias || [])
    } catch {
      setGuardiasError('No se pudo generar el reporte de guardias para ese rango.')
      setGuardias([])
    } finally {
      setLoadingGuardias(false)
    }
  }

  return (
    <AdminLayout title="Reportes">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Reportes y métricas"
          description="Resumen de operación, horas trabajadas y pagos para administración."
          breadcrumb={[
            { label: 'Administración', path: '/admin/dashboard' },
            { label: 'Reportes' }
          ]}
        />

        {loading && <Card><LoadingState label="Cargando reportes..." /></Card>}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && resumen && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Cuidadores" value={`${resumen.cuidadores?.total || 0}`} icon="medical_services" />
            <StatCard title="Pacientes" value={`${resumen.pacientes?.total || 0}`} icon="group" />
            <StatCard title="Guardias" value={`${resumen.guardias?.total || 0}`} icon="schedule" />
            <StatCard title="Horas Totales" value={`${resumen.guardias?.totalHoras || 0}h`} icon="hourglass_top" />
          </div>
        )}

        {!loading && !error && (
          <Card>
            <h4 className="text-lg font-bold mb-3">Reporte por cuidador</h4>
            {cuidadores.length === 0 ? (
              <EmptyState label="No hay datos de cuidadores para reportar." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[#e7edf3]">
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Cuidador</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Guardias</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Horas</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Pacientes</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Pago Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuidadores.map((item) => (
                      <tr key={item.cuidador?.id || item.cuidador?.nombre} className="border-b border-[#e7edf3]">
                        <td className="py-3 px-4 text-sm font-semibold">{item.cuidador?.nombre || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-[#4c739a]">{item.totalGuardias || 0}</td>
                        <td className="py-3 px-4 text-sm text-[#4c739a]">{item.totalHoras || 0}h</td>
                        <td className="py-3 px-4 text-sm text-[#4c739a]">{item.pacientesAtendidos || 0}</td>
                        <td className="py-3 px-4 text-sm text-[#4c739a]">${item.pagos?.totalPendiente || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        <Card>
          <h4 className="text-lg font-bold mb-4">Reporte de guardias por fecha</h4>
          <form onSubmit={loadGuardiasPorRango} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <Input label="Desde" name="desde" type="date" value={filters.desde} onChange={onFilterChange} required />
            <Input label="Hasta" name="hasta" type="date" value={filters.hasta} onChange={onFilterChange} required />
            <Button type="submit" variant="primary" icon="filter_alt">Generar</Button>
          </form>

          <div className="mt-4 space-y-3">
            {loadingGuardias && <LoadingState label="Generando reporte de guardias..." />}
            {guardiasError && <ErrorState message={guardiasError} />}
            {!loadingGuardias && !guardiasError && guardias.length === 0 && (
              <EmptyState label="Sin resultados todavía para el rango seleccionado." />
            )}

            {!loadingGuardias && !guardiasError && guardias.length > 0 && (
              <div className="max-h-72 overflow-auto rounded-lg border border-[#e7edf3]">
                <table className="w-full min-w-[680px]">
                  <thead className="bg-[#f6f7f8] sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Cuidador</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Paciente</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardias.map((guardia) => (
                      <tr key={guardia.id} className="border-t border-[#e7edf3]">
                        <td className="py-3 px-4 text-sm">{guardia.fecha}</td>
                        <td className="py-3 px-4 text-sm">{guardia.cuidador?.nombre || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">{guardia.paciente?.nombre || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">{guardia.horasTrabajadas || 0}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}