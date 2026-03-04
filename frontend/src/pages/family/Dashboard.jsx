import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import FamilyLayout from '../../components/layouts/FamilyLayout'
import Card from '../../components/common/Card'
import PageHeader from '../../components/common/PageHeader'
import { EmptyState, LoadingState } from '../../components/common/DataState'
import { guardiaService, pacienteService, cuidadorService, authService, unwrapList } from '../../services/api'

export default function FamilyDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guardias, setGuardias] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [cuidadores, setCuidadores] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showRequestForm, setShowRequestForm] = useState(false)
  
  // Request Form State
  const [formData, setFormData] = useState({
    paciente_id: '',
    cuidador_id: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: '08:00',
    hora_fin: '12:00',
    ubicacion: '',
    comentarios: '' 
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [guardiasRes, pacientesRes, cuidadoresRes, userRes] = await Promise.all([
        guardiaService.getMine(), 
        pacienteService.getAll(),
        cuidadorService.getAll(),
        authService.me().catch(() => ({ data: {} })) // Handle if auth/me fails or not logged in properly
      ])
      
      const misGuardias = unwrapList(guardiasRes.data)
      setGuardias(misGuardias)
      
      const misPacientes = unwrapList(pacientesRes.data)
      setPacientes(misPacientes)
      
      const listaCuidadores = unwrapList(cuidadoresRes.data)
      setCuidadores(listaCuidadores)

      const currentUser = userRes.data || {}
      
      setFormData(prev => ({ 
          ...prev, 
          paciente_id: misPacientes.length > 0 ? misPacientes[0].id : '', 
          ubicacion: misPacientes.length > 0 ? (misPacientes[0].direccion || '') : '',
          cuidador_id: currentUser.cuidador_preferido_id || ''
      }))

    } catch (err) {
      console.error(err)
      setError('No se pudo cargar la agenda familiar.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getGuardiasForDay = (day) => {
    return guardias.filter(g => {
        if (!g.fecha) return false
        return g.fecha === format(day, 'yyyy-MM-dd')
    })
  }

    const isAcceptedShift = (guardia) => {
        const estado = (guardia?.estado || '').toLowerCase()
        return estado === 'programado' || estado === 'en progreso' || estado === 'completado'
    }

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    setSuccessMsg('')
    
    try {
        const startParts = formData.hora_inicio.split(':').map(Number)
        const endParts = formData.hora_fin.split(':').map(Number)
        
        const start = startParts[0] + startParts[1]/60
        const end = endParts[0] + endParts[1]/60
        const duration = end - start
        
        if (duration <= 0) throw new Error("La hora de fin debe ser posterior a la de inicio")

        if (!formData.paciente_id) throw new Error("Debe seleccionar un paciente")

        const payload = {
            paciente_id: parseInt(formData.paciente_id),
            fecha: formData.fecha,
            hora_inicio: formData.hora_inicio,
            hora_fin: formData.hora_fin,
            ubicacion: formData.ubicacion,
            horas_trabajadas: parseFloat(duration.toFixed(2)),
            estado: 'Pendiente', 
            cuidador_id: formData.cuidador_id ? parseInt(formData.cuidador_id) : null
        }

        await guardiaService.create(payload)
        setSuccessMsg("Solicitud enviada exitosamente.")
        
        // Reset and refresh
        setTimeout(() => {
            setShowRequestForm(false)
            setSuccessMsg('')
            loadData() 
        }, 1500)
        
    } catch (err) {
        setFormError(err.response?.data?.error || err.message || "Error al crear la solicitud")
    } finally {
        setFormLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <FamilyLayout title="Agenda Familiar">
      <div className="p-6 space-y-6 bg-[#f6f7f8] min-h-screen">
        <PageHeader
          title="Calendario de Cuidados"
          description="Gestione sus solicitudes de cuidadores y verifique turnos asignados."
          breadcrumb={[
            { label: 'Familia', path: '/family/dashboard' },
            { label: 'Calendario' }
          ]}
        />

        {loading && <LoadingState label="Cargando calendario..." />}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Calendar */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-0 overflow-hidden">
                    <div className="bg-white p-4 flex items-center justify-between border-b">
                        <h2 className="text-xl font-bold text-gray-800 capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full flex items-center justify-center" title="Mes Anterior">
                                <span className="material-icons text-gray-600">chevron_left</span>
                            </button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                                Hoy
                            </button>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full flex items-center justify-center" title="Mes Siguiente">
                                <span className="material-icons text-gray-600">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-7 border-b bg-gray-50">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 auto-rows-fr bg-white">
                        {/* Empty cells for start of month offset */}
                        {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-32 border-b border-r bg-gray-50/30"></div>
                        ))}
                        
                        {daysInMonth.map((day) => {
                            const dayGuardias = getGuardiasForDay(day)
                            const isTodayDate = isToday(day)
                            
                            return (
                                <div key={day.toString()} className={`min-h-[120px] border-b border-r p-2 transition hover:bg-gray-50 ${isTodayDate ? 'bg-blue-50/30' : ''}`}>
                                    <div className={`text-right text-sm mb-1 ${isTodayDate ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                                        {format(day, 'd')}
                                    </div>
                                    <div className="space-y-1 overflow-y-auto max-h-[90px]">
                                        {dayGuardias.map((g) => (
                                            <div key={g.id} className={`text-[10px] p-1 rounded border truncate cursor-pointer hover:shadow-sm ${
                                                isAcceptedShift(g) ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                            }`}>
                                                <div className="font-semibold">{g.hora_inicio || g.horaInicio} - {g.hora_fin || g.horaFin}</div>
                                                <div>{isAcceptedShift(g) && g.cuidador ? g.cuidador.nombre : 'Solicitud Pendiente'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* Right Column: Actions & Upcoming */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <button 
                        onClick={() => setShowRequestForm(true)}
                        className="w-full py-3 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                    >
                        <span className="material-icons">add_box</span>
                        Solicitar Cuidador
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        Crea una solicitud para que los cuidadores disponibles la acepten.
                    </p>
                </div>

                <Card title="Próximas Sesiones">
                    {guardias.filter(g => new Date(g.fecha) >= new Date()).length === 0 ? (
                        <EmptyState label="No tienes sesiones próximas." />
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                            {guardias
                                .filter(g => new Date(g.fecha) >= new Date())
                                .sort((a,b) => new Date(a.fecha) - new Date(b.fecha))
                                .slice(0, 5)
                                .map(g => (
                                <div key={g.id} className="p-3 border rounded-lg hover:shadow-sm transition bg-white block">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold text-gray-800 capitalize">
                                            {format(parseISO(g.fecha), "d 'de' MMMM", { locale: es })}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                            isAcceptedShift(g) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {isAcceptedShift(g) ? 'Confirmado' : 'Pendiente'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                                        <span className="material-icons text-[14px]">schedule</span>
                                        {g.hora_inicio || g.horaInicio} - {g.hora_fin || g.horaFin} ({g.horas_trabajadas || g.horasTrabajadas}h)
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <span className="material-icons text-[14px]">person</span>
                                        {isAcceptedShift(g) && g.cuidador ? g.cuidador.nombre : 'Esperando confirmación...'}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 pl-5">
                                        {g.paciente ? g.paciente.nombre : 'Paciente...'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
          </div>
        )}

        {/* Request Modal */}
        {showRequestForm && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <span className="material-icons text-teal-600">book_online</span>
                            Nueva Solicitud
                        </h3>
                        <button onClick={() => setShowRequestForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                    
                    <form onSubmit={handleRequestSubmit} className="p-6 space-y-5">
                        {formError && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                                <span className="material-icons text-sm mt-0.5">error_outline</span>
                                <div>{formError}</div>
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2">
                                <span className="material-icons text-sm">check_circle</span>
                                {successMsg}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Paciente</label>
                            <select 
                                name="paciente_id" 
                                value={formData.paciente_id}
                                onChange={(e) => {
                                    const p = pacientes.find(p => p.id === parseInt(e.target.value))
                                    setFormData(prev => ({ ...prev, paciente_id: e.target.value, ubicacion: p?.direccion || '' }))
                                }}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition shadow-sm bg-white"
                                required
                            >
                                <option value="">Seleccione un paciente</option>
                                {pacientes.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                            {pacientes.length === 0 && (
                                <div className="mt-2 text-xs">
                                    <p className="text-red-500">No tienes pacientes registrados.</p>
                                    <a href="/family/medical-records" className="text-teal-600 underline font-semibold">Registrar un paciente aquí</a>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cuidador (Opcional)</label>
                            <select 
                                name="cuidador_id" 
                                value={formData.cuidador_id}
                                onChange={handleInputChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition shadow-sm bg-white"
                            >
                                <option value="">Cualquier Cuidador (Solicitud Abierta)</option>
                                {cuidadores.length > 0 && <optgroup label="Todos los Cuidadores">
                                    {cuidadores.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre} (Documento: {c.documento})</option>
                                    ))}
                                </optgroup>}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Si seleccionas un cuidador, se le enviará una notificación directa.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                            <input 
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleInputChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 transition shadow-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Inicio</label>
                                <input 
                                    type="time"
                                    name="hora_inicio"
                                    value={formData.hora_inicio}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 transition shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fin</label>
                                <input 
                                    type="time"
                                    name="hora_fin"
                                    value={formData.hora_fin}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 transition shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación</label>
                            <div className="relative">
                                <span className="material-icons absolute left-2.5 top-2.5 text-gray-400 text-sm">place</span>
                                <input 
                                    type="text"
                                    name="ubicacion"
                                    value={formData.ubicacion}
                                    onChange={handleInputChange}
                                    className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 transition shadow-sm"
                                    placeholder="Dirección del servicio"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowRequestForm(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={formLoading || pacientes.length === 0}
                                className="flex-1 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                            >
                                {formLoading ? 'Enviando...' : 'Crear Solicitud'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </FamilyLayout>
  )
}
