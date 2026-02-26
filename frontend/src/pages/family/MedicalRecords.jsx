import { useEffect, useState } from 'react'
import FamilyLayout from '../../components/layouts/FamilyLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { pacienteService, guardiaService, unwrapList } from '../../services/api'
import useResourceList from '../../hooks/useResourceList'

export default function MedicalRecords() {
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', direccion: '', contactoFamilia: '' })
  
  // New state for medical history
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const {
    items: pacientes,
    loading,
    error,
    setError,
    refresh: loadPacientes
  } = useResourceList({
    fetcher: pacienteService.getAll,
    errorMessage: 'No se pudieron cargar los registros médicos. Requiere sesión de familia.'
  })

  useEffect(() => {
    // Select first patient by default if none selected
    if (!selected && pacientes.length > 0) {
        setSelected(pacientes[0])
    }
  }, [pacientes, selected])

  // Fetch history when selected patient changes
  useEffect(() => {
    if (!selected) {
        setHistory([])
        return
    }
    
    const fetchHistory = async () => {
        setHistoryLoading(true)
        try {
            const res = await guardiaService.getByPaciente(selected.id)
            const list = unwrapList(res.data)
            // Sort by date desc
            list.sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
            setHistory(list)
        } catch (err) {
            console.error(err)
        } finally {
            setHistoryLoading(false)
        }
    }
    fetchHistory()
  }, [selected])

  const openCreate = () => {
    setEditingId(null)
    setFormData({ nombre: '', direccion: '', contactoFamilia: '' })
    setShowForm(true)
  }

  const openEdit = (paciente) => {
    setEditingId(paciente.id)
    setFormData({
      nombre: paciente.nombre || '',
      direccion: paciente.direccion || '',
      contactoFamilia: paciente.contactoFamilia || ''
    })
    setShowForm(true)
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!formData.nombre.trim()) {
      setError('El nombre del paciente es obligatorio.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        contacto_familia: formData.contactoFamilia
      }

      if (editingId) {
        await pacienteService.update(editingId, payload)
      } else {
        await pacienteService.create(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ nombre: '', direccion: '', contactoFamilia: '' })
      await loadPacientes()
    } catch {
      setError('No se pudo guardar la ficha del paciente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FamilyLayout title="Historial Médico">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Historial Médico del Paciente"
          description="Perfil del paciente con resumen vital, alergias y medicación, conectado a las atenciones agendadas."
          breadcrumb={[
            { label: 'Familia', path: '/family/dashboard' },
            { label: 'Historial Médico' }
          ]}
          actionLabel="Nuevo Paciente"
          actionIcon="add"
          onAction={openCreate}
        />

        {error && <ErrorState message={error} />}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-[#e7edf3] p-5 shadow-sm xl:col-span-1 h-fit">
            <h3 className="font-bold text-lg mb-4">Pacientes</h3>
            {loading && <LoadingState label="Cargando pacientes..." />}
            {!loading && pacientes.length === 0 && (
                <div className="text-center py-8">
                    <EmptyState label="No hay pacientes registrados." />
                    <button onClick={openCreate} className="mt-4 text-sm text-[#2b8cee] font-bold underline hover:text-blue-700">Registrar primero</button>
                </div>
            )}
            {!loading && pacientes.length > 0 && (
              <div className="space-y-2">
                {pacientes.map((paciente) => (
                  <button
                    key={paciente.id}
                    type="button"
                    onClick={() => setSelected(paciente)}
                    className={`w-full text-left border rounded-lg p-3 transition-all ${
                      selected?.id === paciente.id ? 'border-[#2b8cee] bg-blue-50 shadow-sm' : 'border-[#e7edf3] hover:bg-gray-50'
                    }`}
                  >
                    <p className={`text-sm font-bold ${selected?.id === paciente.id ? 'text-[#0d141b]' : 'text-gray-700'}`}>{paciente.nombre}</p>
                    <p className="text-xs text-[#4c739a] mt-1 truncate">{paciente.contactoFamilia || 'Sin contacto'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#e7edf3] p-6 shadow-sm xl:col-span-2">
            {!selected && <EmptyState label="Selecciona un paciente para ver su ficha." />}
            {selected && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 flex-wrap border-b pb-6">
                  <div>
                    <h4 className="text-3xl font-extrabold text-[#0d141b]">{selected.nombre}</h4>
                    <p className="text-sm text-[#4c739a] mt-1 font-medium">ID Paciente: #{selected.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="h-10 px-4 rounded-lg border border-[#e7edf3] text-sm font-bold text-gray-600 hover:bg-[#f6f7f8] flex items-center gap-2" onClick={() => window.print()}>
                        <span className="material-icons text-sm">print</span> Imprimir
                    </button>
                    <button type="button" className="h-10 px-4 rounded-lg bg-[#2b8cee] text-white text-sm font-bold hover:bg-blue-600 flex items-center gap-2" onClick={() => openEdit(selected)}>
                        <span className="material-icons text-sm">edit</span> Editar
                    </button>
                  </div>
                </div>

                {/* Vitals / Info */}
                <div>
                   <h5 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-icons text-teal-600">info</span> Información General
                   </h5>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-[#e7edf3] p-4 hover:shadow-md transition bg-white">
                        <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider mb-1">Dirección</p>
                        <p className="text-base font-bold text-[#0d141b]">{selected.direccion || 'No registrada'}</p>
                    </div>
                    <div className="rounded-xl border border-[#e7edf3] p-4 hover:shadow-md transition bg-white">
                        <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider mb-1">Contacto Familiar</p>
                        <p className="text-base font-bold text-[#0d141b]">{selected.contactoFamilia || 'No registrado'}</p>
                    </div>
                    <div className="rounded-xl border border-[#e7edf3] p-4 hover:shadow-md transition bg-white">
                        <p className="text-xs text-[#4c739a] font-bold uppercase tracking-wider mb-1">Estado</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Activo
                        </span>
                    </div>
                   </div>
                </div>

                {/* Medical Visits Timeline */}
                <div>
                    <h5 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-icons text-blue-600">history</span> Visitas Médicas Recientes
                    </h5>
                    <div className="bg-white rounded-xl border border-[#e7edf3] p-6 relative">
                        {historyLoading && <LoadingState label="Cargando historial de visitas..." />}
                        {!historyLoading && history.length === 0 && <EmptyState label="No hay visitas registradas aún." />}
                        
                        {!historyLoading && history.length > 0 && (
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                                {history.slice(0, 5).map((visit) => (
                                    <div key={visit.id} className="relative group">
                                        {/* Dot */}
                                        <div className={`absolute -left-[39px] top-1.5 h-5 w-5 rounded-full border-4 border-white shadow-sm z-10 ${
                                            visit.estado === 'Completado' ? 'bg-blue-500' : 
                                            visit.estado === 'Cancelado' ? 'bg-red-400' : 'bg-yellow-400'
                                        }`}></div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 font-medium mb-0.5 flex items-center gap-2">
                                                    {visit.fecha}
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{visit.horaInicio || visit.hora_inicio}</span>
                                                </p>
                                                <h4 className="text-base font-bold text-[#0d141b]">
                                                    {visit.estado === 'Completado' ? 'Atención Realizada' : `Sesión ${visit.estado}`}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {visit.informe || (visit.ubicacion ? `Ubicación: ${visit.ubicacion}` : "Sin informe detallado.")}
                                                </p>
                                            </div>
                                            
                                            {visit.cuidador && (
                                                <div className="flex items-center gap-2 mt-2 sm:mt-0 bg-white px-3 py-1.5 rounded-full border border-[#e7edf3] shadow-sm min-w-fit">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold text-center leading-none">
                                                        {visit.cuidador.nombre.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold leading-none">Cuidador</span>
                                                        <span className="text-xs font-bold text-gray-800 leading-tight">{visit.cuidador.nombre}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                         {!historyLoading && history.length > 5 && (
                            <div className="mt-6 text-center border-t pt-4">
                                <a href="/family/history" className="inline-flex items-center gap-1 text-sm font-bold text-[#2b8cee] hover:text-blue-700 transition">
                                    Ver historial completo <span className="material-icons text-base">arrow_forward</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <h4 className="text-lg font-bold text-[#0d141b]">{editingId ? 'Editar Ficha' : 'Nuevo Paciente'}</h4>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition"><span className="material-icons">close</span></button>
                </div>
                
                <form onSubmit={onSubmit} className="p-6 space-y-5">
                    <Input label="Nombre Completo" name="nombre" value={formData.nombre} onChange={onChange} required placeholder="Ej: Juan Pérez" />
                    <Input label="Dirección de Domicilio" name="direccion" value={formData.direccion} onChange={onChange} placeholder="Calle, Número, Comuna" />
                    <Input label="Contacto de Emergencia" name="contactoFamilia" value={formData.contactoFamilia} onChange={onChange} placeholder="+56 9..." />
                    
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">Cancelar</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#2b8cee] text-white rounded-lg font-bold hover:bg-blue-600 transition shadow-sm disabled:opacity-50">
                            {saving ? 'Guardando...' : 'Guardar Ficha'}
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