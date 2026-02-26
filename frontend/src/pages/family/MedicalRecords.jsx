import { useEffect, useState } from 'react'
import FamilyLayout from '../../components/layouts/FamilyLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { pacienteService } from '../../services/api'
import useResourceList from '../../hooks/useResourceList'

export default function MedicalRecords() {
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', direccion: '', contactoFamilia: '' })

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
    setSelected((prev) => prev || pacientes[0] || null)
  }, [pacientes])

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
          description="Perfil del paciente con resumen vital, alergias y medicación actual."
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
          <div className="bg-white rounded-xl border border-[#e7edf3] p-5 shadow-sm xl:col-span-1">
            {loading && <LoadingState label="Cargando pacientes..." />}
            {!loading && pacientes.length === 0 && <EmptyState label="No hay pacientes disponibles para esta cuenta." />}
            {!loading && pacientes.length > 0 && (
              <div className="space-y-2">
                {pacientes.map((paciente) => (
                  <button
                    key={paciente.id}
                    type="button"
                    onClick={() => setSelected(paciente)}
                    className={`w-full text-left border rounded-lg p-3 ${
                      selected?.id === paciente.id ? 'border-[#2b8cee] bg-[#2b8cee]/5' : 'border-[#e7edf3]'
                    }`}
                  >
                    <p className="text-sm font-semibold">{paciente.nombre}</p>
                    <p className="text-xs text-[#4c739a] mt-1">{paciente.contactoFamilia || 'Sin contacto familiar'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#e7edf3] p-6 shadow-sm xl:col-span-2">
            {!selected && <EmptyState label="Selecciona un paciente para ver su ficha." />}
            {selected && (
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h4 className="text-2xl font-extrabold">{selected.nombre}</h4>
                    <p className="text-sm text-[#4c739a]">ID Paciente: #{selected.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="h-10 px-4 rounded-lg border border-[#e7edf3] text-sm font-bold hover:bg-[#f6f7f8]" onClick={() => window.print()}>Imprimir reporte</button>
                    <button type="button" className="h-10 px-4 rounded-lg bg-[#2b8cee] text-white text-sm font-bold hover:bg-blue-600" onClick={() => openEdit(selected)}>Editar ficha</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#e7edf3] bg-[#f6f7f8] p-4">
                    <p className="text-xs text-[#4c739a] font-semibold uppercase tracking-wider">Dirección</p>
                    <p className="text-base font-bold mt-1">{selected.direccion || 'Sin dirección registrada'}</p>
                  </div>
                  <div className="rounded-xl border border-[#e7edf3] bg-[#f6f7f8] p-4">
                    <p className="text-xs text-[#4c739a] font-semibold uppercase tracking-wider">Contacto familiar</p>
                    <p className="text-base font-bold mt-1">{selected.contactoFamilia || 'Sin contacto registrado'}</p>
                  </div>
                  <div className="rounded-xl border border-[#e7edf3] bg-[#f6f7f8] p-4">
                    <p className="text-xs text-[#4c739a] font-semibold uppercase tracking-wider">Última actualización</p>
                    <p className="text-base font-bold mt-1">Base de datos en línea</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#e7edf3] p-4 bg-[#f6f7f8]">
                  <p className="text-sm font-semibold mb-2">Observaciones</p>
                  <p className="text-sm text-[#4c739a]">La ficha médica muestra información disponible en el modelo actual de pacientes. Puedes actualizar nombre, dirección y contacto familiar desde editar ficha.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-[#e7edf3] p-6 shadow-sm">
            <h4 className="text-lg font-bold mb-4">{editingId ? 'Editar ficha de paciente' : 'Nueva ficha de paciente'}</h4>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Nombre" name="nombre" value={formData.nombre} onChange={onChange} required />
              <Input label="Dirección" name="direccion" value={formData.direccion} onChange={onChange} />
              <Input label="Contacto familiar" name="contactoFamilia" value={formData.contactoFamilia} onChange={onChange} />
              <div className="md:col-span-3 flex gap-2">
                <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </FamilyLayout>
  )
}