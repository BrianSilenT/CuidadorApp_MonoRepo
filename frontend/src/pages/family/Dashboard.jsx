import { useEffect, useMemo, useState } from 'react'
import FamilyLayout from '../../components/layouts/FamilyLayout'
import Card from '../../components/common/Card'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/DataState'
import { guardiaService, pacienteService, cuidadorService, unwrapList } from '../../services/api'

export default function FamilyDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guardias, setGuardias] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [cuidadores, setCuidadores] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [guardiasRes, pacientesRes, cuidadoresRes] = await Promise.all([
          guardiaService.getAll(),
          pacienteService.getAll(),
          cuidadorService.getAll()
        ])
        setGuardias(unwrapList(guardiasRes.data))
        setPacientes(unwrapList(pacientesRes.data))
        setCuidadores(unwrapList(cuidadoresRes.data))
      } catch {
        setError('No se pudo cargar la agenda familiar.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const horasTotales = useMemo(() => guardias.reduce((sum, item) => sum + (item.horasTrabajadas || 0), 0), [guardias])
  const sesionesConInforme = useMemo(() => guardias.filter((item) => Boolean(item.informe)).length, [guardias])

  return (
    <FamilyLayout title="Agenda y Reservas">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Agenda Familiar"
          description="Información de sesiones, pacientes y seguimiento basada en datos reales del sistema."
          breadcrumb={[
            { label: 'Familia', path: '/family/dashboard' },
            { label: 'Agenda y Reservas' }
          ]}
        />

        {loading && <LoadingState label="Cargando agenda familiar..." />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Pacientes asociados" value={`${pacientes.length}`} icon="groups" />
              <StatCard title="Guardias registradas" value={`${guardias.length}`} icon="schedule" />
              <StatCard title="Horas de cuidado" value={`${horasTotales}h`} icon="timelapse" />
              <StatCard title="Cuidadores disponibles" value={`${cuidadores.length}`} icon="medical_services" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-bold mb-4">Cuidadores Disponibles</h3>
                {cuidadores.length === 0 ? (
                  <EmptyState label="No hay cuidadores disponibles en este momento." />
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-auto">
                    {cuidadores.map((item) => (
                      <div key={item.id} className="border border-[#e7edf3] rounded-lg p-3">
                        <p className="text-sm font-semibold">{item.nombre}</p>
                        <p className="text-xs text-[#4c739a] mt-1">Contacto: {item.telefono || 'No disponible'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="text-lg font-bold mb-4">Próximas sesiones</h3>
                {guardias.length === 0 ? (
                  <EmptyState label="No hay guardias cargadas para visualizar en agenda." />
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-auto">
                    {guardias.slice(0, 10).map((item) => (
                      <div key={item.id} className="border border-[#e7edf3] rounded-lg p-3">
                        <p className="text-sm font-semibold">{item.paciente?.nombre || 'Paciente sin nombre'}</p>
                        <p className="text-xs text-[#4c739a] mt-1">{item.fecha || 'Sin fecha'} · {item.horasTrabajadas || 0}h</p>
                        <p className="text-xs text-[#4c739a] mt-1">Cuidador: {item.cuidador?.nombre || 'Sin asignar'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="text-lg font-bold mb-4">Resumen de seguimiento</h3>
                <div className="space-y-4">
                  <div className="rounded-lg border border-[#e7edf3] p-4 bg-[#f6f7f8]">
                    <p className="text-xs uppercase font-bold text-[#4c739a]">Guardias con informe</p>
                    <p className="text-2xl font-bold mt-1">{sesionesConInforme}</p>
                  </div>
                  <div className="rounded-lg border border-[#e7edf3] p-4 bg-[#f6f7f8]">
                    <p className="text-xs uppercase font-bold text-[#4c739a]">Guardias pendientes de informe</p>
                    <p className="text-2xl font-bold mt-1">{guardias.length - sesionesConInforme}</p>
                  </div>
                  <div className="rounded-lg border border-[#e7edf3] p-4 bg-[#f6f7f8]">
                    <p className="text-xs uppercase font-bold text-[#4c739a]">Pacientes con contacto cargado</p>
                    <p className="text-2xl font-bold mt-1">{pacientes.filter((item) => Boolean(item.contactoFamilia)).length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </FamilyLayout>
  )
}
