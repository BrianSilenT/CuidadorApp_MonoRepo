import { useEffect, useState, useMemo } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import DualPanel from '../../components/common/DualPanel'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { pacienteService, guardiaService, unwrapList } from '../../services/api'
import useResourceList from '../../hooks/useResourceList'

export default function Pacientes() {
  const [saving, setSaving] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    contactoFamilia: ''
  })
  const [search, setSearch] = useState('')
  const [guardias, setGuardias] = useState([])

  const {
    items: pacientes,
    loading,
    error,
    setError,
    refresh: loadPacientes
  } = useResourceList({
    fetcher: pacienteService.getAll,
    errorMessage: 'No se pudieron cargar los pacientes.'
  })

  useEffect(() => {
    // Load guardias to map last visits and assigned caregivers
    const fetchGuardias = async () => {
      try {
        const res = await guardiaService.getAll()
        setGuardias(unwrapList(res.data))
      } catch (err) {
        console.error(err)
      }
    }
    fetchGuardias()
  }, [])

  const pacientesWithDetails = useMemo(() => {
    return pacientes.map(p => {
      // Find latest guardia for this patient
      const pGuardias = guardias.filter(g => g.paciente?.id === p.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      const lastGuardia = pGuardias[0]
      
      return {
        ...p,
        lastVisit: lastGuardia ? lastGuardia.fecha : null,
        assignedCaregiver: lastGuardia ? lastGuardia.cuidador : null,
        status: lastGuardia ? 'Active' : 'New Intake' 
      }
    })
  }, [pacientes, guardias])

  const onChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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
      setError('No se pudo guardar el paciente.')
    } finally {
      setSaving(false)
    }
  }

  const removePaciente = async (id) => {
    const confirmed = window.confirm('¿Eliminar paciente? Esta acción no se puede deshacer.')
    if (!confirmed) return

    setSaving(true)
    setError('')
    try {
      await pacienteService.delete(id)
      if (selectedPaciente?.id === id) {
        setSelectedPaciente(null)
      }
      await loadPacientes()
    } catch {
      setError('No se pudo eliminar el paciente.')
    } finally {
      setSaving(false)
    }
  }

  const filteredPacientes = pacientesWithDetails.filter((paciente) => {
    const target = `${paciente.id} ${paciente.nombre || ''} ${paciente.direccion || ''} ${paciente.contactoFamilia || ''}`.toLowerCase()
    return target.includes(search.trim().toLowerCase())
  })

  const getPatientShifts = (patientId) => {
    const today = new Date().toISOString().split('T')[0]
    const all = guardias
      .filter((g) => g.paciente?.id === patientId)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

    const futuras = all.filter((g) => g.fecha >= today)
    const previas = all.filter((g) => g.fecha < today).reverse()

    return { futuras, previas }
  }

  return (
    <AdminLayout title="Gestión de Pacientes">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Gestión de Pacientes"
          description="Administra registros de pacientes y asignaciones."
          breadcrumb={[
            { label: 'Admin', path: '/admin/dashboard' },
            { label: 'Pacientes' }
          ]}
          actionLabel="Agregar Paciente"
          actionIcon="add"
          onAction={openCreate}
        />

        <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-lg">search</span>
              <input
                className="w-full bg-[#f6f7f8] border border-transparent focus:bg-white focus:border-[#2b8cee] rounded-lg pl-10 pr-4 py-2 text-sm transition-all outline-none"
                placeholder="Buscar por nombre, ID o contacto..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden">
          {loading && <div className="p-8"><LoadingState label="Cargando pacientes..." /></div>}
          {!loading && error && <div className="p-8"><ErrorState message={error} /></div>}
          {!loading && !error && filteredPacientes.length === 0 && (
            <div className="p-8"><EmptyState label="No hay pacientes registrados todavía." /></div>
          )}

          {!loading && !error && filteredPacientes.length > 0 && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e7edf3] bg-[#f8fafc]">
                  <th className="py-4 px-6 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Nombre</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Cuidador Asignado</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Estado</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Última Visita</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#4c739a] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7edf3]">
                {filteredPacientes.map((paciente) => {
                  const initials = paciente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  
                  return (
                    <tr key={paciente.id} className="hover:bg-[#f6f7f8]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-[#0d141b] text-sm">{paciente.nombre}</p>
                            <p className="text-xs text-[#4c739a]">ID: #PT-{paciente.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {paciente.assignedCaregiver ? (
                          <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-gray-400 text-[20px]">account_circle</span>
                             <span className="text-sm text-[#0d141b]">{paciente.assignedCaregiver.nombre}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#4c739a] italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          paciente.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {paciente.status === 'Active' ? 'Activo' : 'Nuevo Ingreso'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[#4c739a]">
                         {paciente.lastVisit ? new Date(paciente.lastVisit).toLocaleDateString('es-ES', { 
                           month: 'short', day: 'numeric', year: 'numeric' 
                         }) + ' ' + (paciente.lastVisit.split('T')[1]?.substring(0,5) || '') : '-'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-1 justify-end">
                            <button onClick={() => setSelectedPaciente(paciente)} className="p-2 text-[#4c739a] hover:text-[#2b8cee] hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button onClick={() => openEdit(paciente)} className="p-2 text-[#4c739a] hover:text-[#2b8cee] hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button onClick={() => removePaciente(paciente.id)} className="p-2 text-[#4c739a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                        {selectedPaciente?.id === paciente.id && (
                          (() => {
                          const shifts = getPatientShifts(paciente.id)
                          return (
                           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                                  <div className="p-6 border-b border-[#e7edf3] flex justify-between items-center">
                                      <h3 className="text-lg font-bold text-[#0d141b]">Detalles de Paciente</h3>
                                      <button onClick={() => setSelectedPaciente(null)} className="text-[#4c739a] hover:text-[#0d141b]">
                                          <span className="material-symbols-outlined">close</span>
                                      </button>
                                  </div>
                                  <div className="p-6 space-y-4">
                                      <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                                            {initials}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-[#0d141b]">{paciente.nombre}</h4>
                                            <p className="text-sm text-[#4c739a]">ID: {paciente.id}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                          <div className="flex items-start gap-3">
                                              <span className="material-symbols-outlined text-[#4c739a] mt-0.5">location_on</span>
                                              <div>
                                                  <p className="text-xs font-bold text-[#4c739a] uppercase">Dirección</p>
                                                  <p className="text-sm text-[#0d141b]">{paciente.direccion || 'No especificada'}</p>
                                              </div>
                                          </div>
                                          <div className="flex items-start gap-3">
                                              <span className="material-symbols-outlined text-[#4c739a] mt-0.5">contacts</span>
                                              <div>
                                                  <p className="text-xs font-bold text-[#4c739a] uppercase">Contacto Familiar</p>
                                                  <p className="text-sm text-[#0d141b]">{paciente.contactoFamilia || 'No especificado'}</p>
                                              </div>
                                          </div>

                                          <div className="pt-2">
                                              <p className="text-xs font-bold text-[#4c739a] uppercase mb-2">Próximas Atenciones</p>
                                              {shifts.futuras.length === 0 ? (
                                                <p className="text-sm text-[#4c739a]">Sin atenciones futuras</p>
                                              ) : (
                                                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                                  {shifts.futuras.slice(0, 5).map((g) => (
                                                    <p key={g.id} className="text-sm text-[#0d141b]">
                                                      {g.fecha} · {g.horaInicio || g.hora_inicio || '--:--'} - {g.horaFin || g.hora_fin || '--:--'}
                                                    </p>
                                                  ))}
                                                </div>
                                              )}
                                          </div>

                                          <div className="pt-1">
                                              <p className="text-xs font-bold text-[#4c739a] uppercase mb-2">Atenciones Previas</p>
                                              {shifts.previas.length === 0 ? (
                                                <p className="text-sm text-[#4c739a]">Sin atenciones previas</p>
                                              ) : (
                                                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                                  {shifts.previas.slice(0, 5).map((g) => (
                                                    <p key={g.id} className="text-sm text-[#0d141b]">
                                                      {g.fecha} · {g.horaInicio || g.hora_inicio || '--:--'} - {g.horaFin || g.hora_fin || '--:--'}
                                                    </p>
                                                  ))}
                                                </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="p-4 bg-[#f6f7f8] text-right">
                                      <Button variant="secondary" onClick={() => setSelectedPaciente(null)}>Cerrar</Button>
                                  </div>
                              </div>
                           </div>
                          )
                          })()
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-[#e7edf3] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#0d141b]">{editingId ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
                    <button onClick={() => setShowForm(false)} className="text-[#4c739a] hover:text-[#0d141b]">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-[#0d141b]">Nombre Completo</label>
                            <input
                                name="nombre"
                                value={formData.nombre}
                                onChange={onChange}
                                required
                                className="w-full border border-[#e7edf3] rounded-lg px-3 py-2 text-sm focus:border-[#2b8cee] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-[#0d141b]">Dirección de Domicilio</label>
                            <input
                                name="direccion"
                                value={formData.direccion}
                                onChange={onChange}
                                className="w-full border border-[#e7edf3] rounded-lg px-3 py-2 text-sm focus:border-[#2b8cee] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-[#0d141b]">Contacto de Emergencia</label>
                            <input
                                name="contactoFamilia"
                                value={formData.contactoFamilia}
                                onChange={onChange}
                                className="w-full border border-[#e7edf3] rounded-lg px-3 py-2 text-sm focus:border-[#2b8cee] outline-none transition-colors"
                            />
                        </div>
                        
                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Paciente'}</Button>
                        </div>
                    </form>
                </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
