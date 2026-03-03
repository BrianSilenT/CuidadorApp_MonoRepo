import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/DataState'
import { guardiaService, pagoService, pacienteService, sessionService, unwrapList } from '../../services/api'

export default function CaregiverDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guardias, setGuardias] = useState([])
  const [pagos, setPagos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const user = sessionService.getUser()

  const loadData = async () => {
    try {
      const [guardiasRes, pagosRes, pacientesRes] = await Promise.all([
        guardiaService.getAll(),
        pagoService.getAll(),
        pacienteService.getAll()
      ])
      setGuardias(unwrapList(guardiasRes.data))
      setPagos(unwrapList(pagosRes.data))
      setPacientes(unwrapList(pacientesRes.data))
    } catch {
      setError('No se pudo cargar el resumen del cuidador.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const totalHoras = useMemo(() => guardias.reduce((sum, item) => sum + (item.horasTrabajadas || 0), 0), [guardias])
  const totalGanancias = useMemo(() => pagos.reduce((sum, item) => sum + (item.monto || 0), 0), [pagos])

  const sortedGuardias = useMemo(() => {
    return [...guardias].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  }, [guardias])

  const nextShift = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return sortedGuardias.find((g) => g.fecha >= today && g.estado !== 'Completado') || sortedGuardias[0]
  }, [sortedGuardias])

  const upcomingShifts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return sortedGuardias.filter((g) => g.fecha >= today && g.id !== nextShift?.id).slice(0, 3)
  }, [sortedGuardias, nextShift])

  const handleAcceptShift = async (shiftId) => {
    try {
      await guardiaService.accept(shiftId)
      await loadData()
    } catch {
      setError('No se pudo aceptar la solicitud de turno.')
    }
  }

  const handleStartShift = async (shift) => {
    try {
      await guardiaService.update(shift.id, { estado: 'En Progreso' })
      await loadData()
    } catch {
      setError('No se pudo iniciar el turno.')
    }
  }

  return (
    <CaregiverLayout title="Resumen del cuidador">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0d141b]">Resumen del cuidador</h1>
            <p className="text-[#4c739a] mt-1">Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/caregiver/shift-reports">
              <Button variant="outline" className="bg-white">
                <span className="material-symbols-outlined mr-2 text-sm">calendar_today</span>
                Ver agenda
              </Button>
            </Link>
            <Link to="/caregiver/patient-logs">
              <Button variant="primary">
                <span className="material-symbols-outlined mr-2 text-sm">add</span>
                Nuevo registro
              </Button>
            </Link>
          </div>
        </div>

        {loading && <LoadingState label="Cargando información..." />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-[#e7edf3] flex justify-between items-center">
                  <h2 className="text-xl font-bold">Próximo turno</h2>
                  <Link to="/caregiver/shift-reports" className="text-[#2b8cee] text-sm font-semibold hover:underline flex items-center">
                    Ver turnos <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                  </Link>
                </div>
                {nextShift ? (
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 text-[#2b8cee] text-xs font-bold tracking-wider mb-2 uppercase">
                        <div className="w-2 h-2 rounded-full bg-[#2b8cee]"></div>
                        {nextShift.fecha === new Date().toISOString().split('T')[0] ? 'Hoy' : 'Próximo'}
                      </div>
                      <h3 className="text-3xl font-bold text-[#0d141b] mb-2">
                        {nextShift.horaInicio || '00:00'} - {nextShift.horaFin || '00:00'}
                      </h3>
                      <div className="flex items-center text-[#4c739a] mb-6">
                        <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                        {nextShift.ubicacion || nextShift.paciente?.direccion || 'Ubicación no especificada'}
                      </div>

                      <div className="mb-6">
                        <p className="font-bold text-[#0d141b]">Paciente: {nextShift.paciente?.nombre || 'Sin asignar'}</p>
                      </div>

                      <div className="flex gap-3">
                        {nextShift.estado === 'Pendiente' ? (
                          <Button variant="primary" onClick={() => handleAcceptShift(nextShift.id)}>
                            Aceptar solicitud <span className="material-symbols-outlined ml-2 text-sm">check</span>
                          </Button>
                        ) : nextShift.estado === 'Programado' ? (
                          <Button variant="primary" onClick={() => handleStartShift(nextShift)}>
                            Iniciar turno <span className="material-symbols-outlined ml-2 text-sm">play_arrow</span>
                          </Button>
                        ) : (
                          <Link to="/caregiver/shift-reports">
                            <Button variant="primary">
                              Continuar registro <span className="material-symbols-outlined ml-2 text-sm">edit_note</span>
                            </Button>
                          </Link>
                        )}
                        <Link to="/caregiver/shift-reports">
                          <Button variant="outline">Ver detalles</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <EmptyState label="No tienes turnos próximos programados." />
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <div className="bg-[#2b5cee] text-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-blue-100 uppercase tracking-wider text-sm">Horas trabajadas</h3>
                  <span className="material-symbols-outlined text-blue-200">schedule</span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">{totalHoras}</span>
                  <span className="text-blue-200">/ 160 hrs</span>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2 text-blue-100">
                    <span>Progreso</span>
                    <span>{Math.min(Math.round((totalHoras / 160) * 100), 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-800 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min((totalHoras / 160) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-blue-400/30">
                  <div>
                    <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Ganancias</p>
                    <p className="text-xl font-bold">${totalGanancias.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card className="text-center p-6">
                  <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0d141b]">{pacientes.length}</h3>
                  <p className="text-xs text-[#4c739a] uppercase tracking-wider mt-1">Pacientes activos</p>
                </Card>
              </div>

              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Próximos días</h3>
                </div>
                <div className="space-y-4">
                  {upcomingShifts.length > 0 ? upcomingShifts.map((shift, idx) => {
                    const date = new Date(shift.fecha)
                    const month = date.toLocaleString('es-ES', { month: 'short' })
                    const day = date.getDate()
                    return (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-lg border border-[#e7edf3] flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs text-[#4c739a] uppercase">{month}</span>
                          <span className="text-lg font-bold text-[#0d141b] leading-none">{day}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#0d141b]">{shift.paciente?.nombre || 'Paciente'}</h4>
                          <div className="flex items-center text-xs text-[#4c739a] mt-1">
                            <span className="material-symbols-outlined text-[14px] mr-1">schedule</span>
                            {shift.horaInicio || '00:00'} - {shift.horaFin || '00:00'}
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <p className="text-sm text-[#4c739a]">No hay turnos próximos esta semana.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </CaregiverLayout>
  )
}
