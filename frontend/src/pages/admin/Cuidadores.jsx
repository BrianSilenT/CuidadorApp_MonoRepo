import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { cuidadorService, unwrapList } from '../../services/api'

export default function Cuidadores() {
  const [cuidadores, setCuidadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedCuidador, setSelectedCuidador] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    activo: true
  })

  const loadCuidadores = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await cuidadorService.getAll()
      const rows = unwrapList(res.data)
      setCuidadores(rows)
      if (rows.length > 0 && !selectedCuidador) {
        setSelectedCuidador(rows[0])
      }
    } catch {
      setError('No se pudieron cargar los cuidadores. Verifica permisos de administrador.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCuidadores()
  }, [])

  const onChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ nombre: '', documento: '', telefono: '', activo: true })
    setShowForm(true)
  }

  const openEdit = (cuidador) => {
    setEditingId(cuidador.id)
    setFormData({
      nombre: cuidador.nombre || '',
      documento: cuidador.documento || '',
      telefono: cuidador.telefono || '',
      activo: Boolean(cuidador.activo)
    })
    setShowForm(true)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!formData.nombre.trim() || !formData.documento.trim()) {
      setError('Nombre y documento son obligatorios para el cuidador.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        nombre: formData.nombre,
        documento: formData.documento,
        telefono: formData.telefono,
        activo: formData.activo
      }

      if (editingId) {
        await cuidadorService.update(editingId, payload)
      } else {
        await cuidadorService.create(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ nombre: '', documento: '', telefono: '', activo: true })
      await loadCuidadores()
    } catch {
      setError('No se pudo guardar el cuidador.')
    } finally {
      setSaving(false)
    }
  }

  const removeCuidador = async (id) => {
    const confirmed = window.confirm('¿Eliminar cuidador? Esta acción no se puede deshacer.')
    if (!confirmed) return

    setSaving(true)
    setError('')
    try {
      await cuidadorService.delete(id)
      if (selectedCuidador?.id === id) {
        setSelectedCuidador(null)
      }
      await loadCuidadores()
    } catch {
      setError('No se pudo eliminar el cuidador.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Gestión de Cuidadores">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Cuidadores"
          description="Listado de cuidadores según modelo SQL (nombre, documento, teléfono, activo)."
          breadcrumb={[
            { label: 'Administración', path: '/admin/dashboard' },
            { label: 'Cuidadores' }
          ]}
          actionLabel="Nuevo Cuidador"
          actionIcon="add"
          onAction={openCreate}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#e7edf3]"><p className="text-sm text-[#4c739a]">Personal total</p><p className="text-xl font-bold">{cuidadores.length}</p></div>
          <div className="bg-white p-4 rounded-xl border border-[#e7edf3]"><p className="text-sm text-[#4c739a]">Verificados</p><p className="text-xl font-bold">{cuidadores.filter((c) => c.activo).length}</p></div>
          <div className="bg-white p-4 rounded-xl border border-[#e7edf3]"><p className="text-sm text-[#4c739a]">Pendiente revisión</p><p className="text-xl font-bold">{cuidadores.filter((c) => !c.activo).length}</p></div>
          <div className="bg-white p-4 rounded-xl border border-[#e7edf3]"><p className="text-sm text-[#4c739a]">En turno ahora</p><p className="text-xl font-bold">{Math.min(cuidadores.length, 36)}</p></div>
        </div>

        <Card>
          {loading && <LoadingState label="Cargando cuidadores..." />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && cuidadores.length === 0 && (
            <EmptyState label="No hay cuidadores registrados todavía." />
          )}

          {!loading && !error && cuidadores.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#e7edf3]">
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Documento</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Teléfono</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-[#4c739a]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuidadores.map((cuidador) => (
                    <tr key={cuidador.id} className="border-b border-[#e7edf3] hover:bg-[#f6f7f8]">
                      <td className="py-3 px-4 text-sm font-semibold">{cuidador.nombre}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">{cuidador.documento || 'Sin documento'}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">{cuidador.telefono || 'Sin teléfono'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={cuidador.activo ? 'success' : 'warning'}>
                          {cuidador.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="secondary" size="sm" onClick={() => setSelectedCuidador(cuidador)}>Ver</Button>
                          <Button variant="outline" size="sm" onClick={() => openEdit(cuidador)}>Editar</Button>
                          <Button variant="outline" size="sm" onClick={() => removeCuidador(cuidador.id)} disabled={saving}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {(showForm || selectedCuidador) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {showForm && (
              <Card>
                <h4 className="text-lg font-bold mb-4">{editingId ? 'Editar Cuidador' : 'Nuevo Cuidador'}</h4>
                <form onSubmit={onSubmit} className="space-y-4">
                  <Input label="Nombre" name="nombre" value={formData.nombre} onChange={onChange} required />
                  <Input label="Documento" name="documento" value={formData.documento} onChange={onChange} required />
                  <Input label="Teléfono" name="telefono" value={formData.telefono} onChange={onChange} />

                  <div className="flex items-center gap-2">
                    <input
                      id="activo"
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={onChange}
                    />
                    <label htmlFor="activo" className="text-sm">Activo</label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </Card>
            )}

            {selectedCuidador && (
              <Card>
                <h4 className="text-lg font-bold mb-4">Detalle del cuidador</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Nombre:</span> {selectedCuidador.nombre}</p>
                  <p><span className="font-semibold">Documento:</span> {selectedCuidador.documento || 'Sin documento'}</p>
                  <p><span className="font-semibold">Teléfono:</span> {selectedCuidador.telefono || 'Sin teléfono'}</p>
                  <p><span className="font-semibold">Estado:</span> {selectedCuidador.activo ? 'Activo' : 'Inactivo'}</p>
                  <p><span className="font-semibold">ID:</span> {selectedCuidador.id}</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
