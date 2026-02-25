import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { pacienteService, unwrapList } from '../../services/api'

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    contactoFamilia: ''
  })

  const loadPacientes = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await pacienteService.getAll()
      const rows = unwrapList(res.data)
      setPacientes(rows)
      if (rows.length > 0 && !selectedPaciente) {
        setSelectedPaciente(rows[0])
      }
    } catch {
      setError('No se pudieron cargar los pacientes. Verifica sesión o conexión con backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPacientes()
  }, [])

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

  return (
    <AdminLayout title="Gestión de Pacientes">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Pacientes"
          description="Listado de pacientes según modelo SQL (nombre, dirección, contacto_familia)."
          breadcrumb={[
            { label: 'Administración', path: '/admin/dashboard' },
            { label: 'Pacientes' }
          ]}
          actionLabel="Nuevo Paciente"
          actionIcon="add"
          onAction={openCreate}
        />

        <div className="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm" placeholder="Buscar por nombre, ID o cuidador..." />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium">Todos los estados</button>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium">Filtrar</button>
            </div>
          </div>
        </div>

        <Card>
          {loading && <LoadingState label="Cargando pacientes..." />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && pacientes.length === 0 && (
            <EmptyState label="No hay pacientes registrados todavía." />
          )}

          {!loading && !error && pacientes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#e7edf3]">
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Dirección</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Contacto familiar</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-[#4c739a]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((paciente) => (
                    <tr key={paciente.id} className="border-b border-[#e7edf3] hover:bg-[#f6f7f8]">
                      <td className="py-3 px-4 text-sm font-semibold">{paciente.nombre}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">{paciente.direccion || 'Sin dirección'}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">{paciente.contactoFamilia || 'Sin contacto'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="success">Activo</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="secondary" size="sm" onClick={() => setSelectedPaciente(paciente)}>Ver</Button>
                          <Button variant="outline" size="sm" onClick={() => openEdit(paciente)}>Editar</Button>
                          <Button variant="outline" size="sm" onClick={() => removePaciente(paciente.id)} disabled={saving}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {(showForm || selectedPaciente) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {showForm && (
              <Card>
                <h4 className="text-lg font-bold mb-4">{editingId ? 'Editar Paciente' : 'Nuevo Paciente'}</h4>
                <form onSubmit={onSubmit} className="space-y-4">
                  <Input label="Nombre" name="nombre" value={formData.nombre} onChange={onChange} required />
                  <Input label="Dirección" name="direccion" value={formData.direccion} onChange={onChange} />
                  <Input label="Contacto familiar" name="contactoFamilia" value={formData.contactoFamilia} onChange={onChange} />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </Card>
            )}

            {selectedPaciente && (
              <Card>
                <h4 className="text-lg font-bold mb-4">Detalle del paciente</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Nombre:</span> {selectedPaciente.nombre}</p>
                  <p><span className="font-semibold">Dirección:</span> {selectedPaciente.direccion || 'Sin dirección'}</p>
                  <p><span className="font-semibold">Contacto familiar:</span> {selectedPaciente.contactoFamilia || 'Sin contacto'}</p>
                  <p><span className="font-semibold">ID:</span> {selectedPaciente.id}</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
