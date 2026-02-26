import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import DualPanel from '../../components/common/DualPanel'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { guardiaService } from '../../services/api'
import useResourceList from '../../hooks/useResourceList'

const ROWS_PER_PAGE = 8

export default function Guardias() {
  const [page, setPage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedGuardia, setSelectedGuardia] = useState(null)
  const [formData, setFormData] = useState({
    fecha: '',
    horasTrabajadas: '',
    informe: '',
    cuidadorId: '',
    pacienteId: ''
  })

  const {
    items: guardias,
    loading,
    error,
    setError,
    refresh: loadGuardias
  } = useResourceList({
    fetcher: guardiaService.getAll,
    errorMessage: 'No se pudieron cargar los turnos de guardia.'
  })

  useEffect(() => {
    setSelectedGuardia((prev) => prev || guardias[0] || null)
  }, [guardias])

  const onChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ fecha: '', horasTrabajadas: '', informe: '', cuidadorId: '', pacienteId: '' })
    setShowForm(true)
  }

  const openEdit = (guardia) => {
    setEditingId(guardia.id)
    setFormData({
      fecha: guardia.fecha || '',
      horasTrabajadas: `${guardia.horasTrabajadas || ''}`,
      informe: guardia.informe || '',
      cuidadorId: `${guardia.cuidador?.id || ''}`,
      pacienteId: `${guardia.paciente?.id || ''}`
    })
    setShowForm(true)
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    const horas = Number(formData.horasTrabajadas)
    const cuidadorId = Number(formData.cuidadorId)
    const pacienteId = Number(formData.pacienteId)

    if (!formData.fecha || !horas || horas <= 0 || !cuidadorId || !pacienteId) {
      setError('Fecha, horas (>0), cuidador ID y paciente ID son obligatorios.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        fecha: formData.fecha,
        horas_trabajadas: horas,
        informe: formData.informe,
        cuidador_id: cuidadorId,
        paciente_id: pacienteId
      }

      if (editingId) {
        await guardiaService.update(editingId, payload)
      } else {
        await guardiaService.create(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ fecha: '', horasTrabajadas: '', informe: '', cuidadorId: '', pacienteId: '' })
      await loadGuardias()
    } catch {
      setError('No se pudo guardar el turno.')
    } finally {
      setSaving(false)
    }
  }

  const removeGuardia = async (id) => {
    const confirmed = window.confirm('¿Eliminar turno de guardia?')
    if (!confirmed) return

    setSaving(true)
    setError('')
    try {
      await guardiaService.delete(id)
      if (selectedGuardia?.id === id) {
        setSelectedGuardia(null)
      }
      await loadGuardias()
    } catch {
      setError('No se pudo eliminar el turno.')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(guardias.length / ROWS_PER_PAGE)), [guardias])
  const pageRows = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE
    return guardias.slice(start, start + ROWS_PER_PAGE)
  }, [guardias, page])

  return (
    <AdminLayout title="Turnos de Guardia">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Turnos"
          description="Gestión de guardias por fecha, cuidador y paciente."
          breadcrumb={[
            { label: 'Administración', path: '/admin/dashboard' },
            { label: 'Turnos' }
          ]}
          actionLabel="Nuevo Turno"
          actionIcon="add"
          onAction={openCreate}
        />

        <Card>
          {loading && <LoadingState label="Cargando guardias..." />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && guardias.length === 0 && (
            <EmptyState label="No hay guardias cargadas." />
          )}

          {!loading && !error && guardias.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[#e7edf3]">
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Cuidador</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Paciente</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Horas</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-[#4c739a]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((guardia) => (
                      <tr key={guardia.id} className="border-b border-[#e7edf3] hover:bg-[#f6f7f8]">
                        <td className="py-3 px-4 text-sm font-semibold">{guardia.fecha || 'Sin fecha'}</td>
                        <td className="py-3 px-4 text-sm text-[#4c739a]">{guardia.cuidador?.nombre || 'Sin cuidador'}</td>
                        <td className="py-3 px-4 text-sm text-[#4c739a]">{guardia.paciente?.nombre || 'Sin paciente'}</td>
                        <td className="py-3 px-4 text-sm text-[#4c739a]">{guardia.horasTrabajadas || 0}h</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="secondary" onClick={() => setSelectedGuardia(guardia)}>Ver</Button>
                            <Button size="sm" variant="outline" onClick={() => openEdit(guardia)}>Editar</Button>
                            <Button size="sm" variant="outline" onClick={() => removeGuardia(guardia.id)} disabled={saving}>Eliminar</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-[#4c739a]">Página {page} de {totalPages}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Anterior</Button>
                  <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>Siguiente</Button>
                </div>
              </div>
            </>
          )}
        </Card>

        <DualPanel
          show={showForm || selectedGuardia}
          left={showForm && (
            <Card>
              <h4 className="text-lg font-bold mb-4">{editingId ? 'Editar Turno' : 'Nuevo Turno'}</h4>
              <form onSubmit={onSubmit} className="space-y-4">
                <Input label="Fecha" name="fecha" type="date" value={formData.fecha} onChange={onChange} required />
                <Input label="Horas trabajadas" name="horasTrabajadas" type="number" value={formData.horasTrabajadas} onChange={onChange} required />
                <Input label="ID Cuidador" name="cuidadorId" type="number" value={formData.cuidadorId} onChange={onChange} required />
                <Input label="ID Paciente" name="pacienteId" type="number" value={formData.pacienteId} onChange={onChange} required />
                <div className="flex flex-col gap-2">
                  <label className="text-[#0d141b] text-sm font-semibold">Informe</label>
                  <textarea
                    name="informe"
                    value={formData.informe}
                    onChange={onChange}
                    rows={4}
                    className="w-full border border-[#cfdbe7] rounded-lg p-3 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                </div>
              </form>
            </Card>
          )}
          right={selectedGuardia && (
            <Card>
              <h4 className="text-lg font-bold mb-4">Detalle del turno</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Fecha:</span> {selectedGuardia.fecha || 'Sin fecha'}</p>
                <p><span className="font-semibold">Cuidador:</span> {selectedGuardia.cuidador?.nombre || 'Sin cuidador'} (ID {selectedGuardia.cuidador?.id || 'N/A'})</p>
                <p><span className="font-semibold">Paciente:</span> {selectedGuardia.paciente?.nombre || 'Sin paciente'} (ID {selectedGuardia.paciente?.id || 'N/A'})</p>
                <p><span className="font-semibold">Horas:</span> {selectedGuardia.horasTrabajadas || 0}h</p>
                <p><span className="font-semibold">Informe:</span> {selectedGuardia.informe || 'Sin informe'}</p>
              </div>
            </Card>
          )}
        />
      </div>
    </AdminLayout>
  )
}