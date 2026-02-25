import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import api, { pagoService, unwrapList } from '../../services/api'

export default function Pagos() {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmingId, setConfirmingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedPago, setSelectedPago] = useState(null)
  const [formData, setFormData] = useState({
    monto: '',
    fechaPago: '',
    metodo: '',
    confirmado: false,
    cuidadorId: ''
  })

  const loadPagos = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await pagoService.getAll()
      const rows = unwrapList(res.data)
      setPagos(rows)
      if (rows.length > 0 && !selectedPago) {
        setSelectedPago(rows[0])
      }
    } catch {
      setError('No se pudieron cargar los pagos. Esta vista requiere rol administrador.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPagos()
  }, [])

  const confirmarPago = async (id) => {
    setConfirmingId(id)
    try {
      await api.put(`/pagos/${id}/confirmar`)
      await loadPagos()
    } catch {
      setError('No se pudo confirmar el pago seleccionado.')
    } finally {
      setConfirmingId(null)
    }
  }

  const onChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ monto: '', fechaPago: '', metodo: '', confirmado: false, cuidadorId: '' })
    setShowForm(true)
  }

  const openEdit = (pago) => {
    setEditingId(pago.id)
    setFormData({
      monto: `${pago.monto || ''}`,
      fechaPago: pago.fechaPago || '',
      metodo: pago.metodo || '',
      confirmado: Boolean(pago.confirmado),
      cuidadorId: `${pago.cuidador?.id || ''}`
    })
    setShowForm(true)
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    const monto = Number(formData.monto)
    const cuidadorId = Number(formData.cuidadorId)
    if (!monto || monto <= 0 || !cuidadorId) {
      setError('Monto (>0) e ID de cuidador son obligatorios.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        monto,
        fecha_pago: formData.fechaPago || null,
        metodo: formData.metodo,
        confirmado: formData.confirmado,
        cuidador_id: cuidadorId
      }

      if (editingId) {
        await pagoService.update(editingId, payload)
      } else {
        await pagoService.create(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ monto: '', fechaPago: '', metodo: '', confirmado: false, cuidadorId: '' })
      await loadPagos()
    } catch {
      setError('No se pudo guardar el pago.')
    } finally {
      setSaving(false)
    }
  }

  const removePago = async (id) => {
    const confirmed = window.confirm('¿Eliminar pago?')
    if (!confirmed) return

    setSaving(true)
    setError('')
    try {
      await pagoService.delete(id)
      if (selectedPago?.id === id) {
        setSelectedPago(null)
      }
      await loadPagos()
    } catch {
      setError('No se pudo eliminar el pago.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Pagos y Finanzas">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Pagos"
          description="Control de pagos por cuidador y estado de confirmación."
          breadcrumb={[
            { label: 'Administración', path: '/admin/dashboard' },
            { label: 'Pagos' }
          ]}
          actionLabel="Actualizar"
          actionIcon="refresh"
          onAction={openCreate}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e7edf3] rounded-xl p-5"><p className="text-sm text-[#4c739a]">Pagos pendientes totales</p><p className="text-2xl font-bold">$12,450.00</p></div>
          <div className="bg-white border border-[#e7edf3] rounded-xl p-5"><p className="text-sm text-[#4c739a]">Procesado este mes</p><p className="text-2xl font-bold">$45,200.00</p></div>
          <div className="bg-white border border-[#e7edf3] rounded-xl p-5"><p className="text-sm text-[#4c739a]">Próximo desembolso</p><p className="text-2xl font-bold">28 Oct 2023</p></div>
        </div>

        <Card>
          {loading && <LoadingState label="Cargando pagos..." />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && pagos.length === 0 && (
            <EmptyState label="No hay pagos registrados." />
          )}

          {!loading && !error && pagos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#e7edf3]">
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Cuidador</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Monto</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Método</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Fecha pago</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[#4c739a]">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-[#4c739a]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => (
                    <tr key={pago.id} className="border-b border-[#e7edf3] hover:bg-[#f6f7f8]">
                      <td className="py-3 px-4 text-sm font-semibold">{pago.cuidador?.nombre || 'Sin cuidador'}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">${pago.monto || 0}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">{pago.metodo || 'Sin método'}</td>
                      <td className="py-3 px-4 text-sm text-[#4c739a]">{pago.fechaPago || 'Pendiente'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={pago.confirmado ? 'success' : 'warning'}>
                          {pago.confirmado ? 'Confirmado' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="secondary" onClick={() => setSelectedPago(pago)}>Ver</Button>
                          <Button size="sm" variant="outline" onClick={() => openEdit(pago)}>Editar</Button>
                          {!pago.confirmado ? (
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={confirmingId === pago.id}
                              onClick={() => confirmarPago(pago.id)}
                            >
                              {confirmingId === pago.id ? 'Confirmando...' : 'Confirmar'}
                            </Button>
                          ) : (
                            <Button size="sm" variant="secondary" disabled>Confirmado</Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => removePago(pago.id)} disabled={saving}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {(showForm || selectedPago) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {showForm && (
              <Card>
                <h4 className="text-lg font-bold mb-4">{editingId ? 'Editar Pago' : 'Nuevo Pago'}</h4>
                <form onSubmit={onSubmit} className="space-y-4">
                  <Input label="Monto" name="monto" type="number" value={formData.monto} onChange={onChange} required />
                  <Input label="Fecha de pago" name="fechaPago" type="date" value={formData.fechaPago} onChange={onChange} />
                  <Input label="Método" name="metodo" value={formData.metodo} onChange={onChange} />
                  <Input label="ID Cuidador" name="cuidadorId" type="number" value={formData.cuidadorId} onChange={onChange} required />

                  <div className="flex items-center gap-2">
                    <input
                      id="confirmado"
                      type="checkbox"
                      name="confirmado"
                      checked={formData.confirmado}
                      onChange={onChange}
                    />
                    <label htmlFor="confirmado" className="text-sm">Confirmado</label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button type="button" variant="outline" onClick={loadPagos}>Actualizar</Button>
                  </div>
                </form>
              </Card>
            )}

            {selectedPago && (
              <Card>
                <h4 className="text-lg font-bold mb-4">Detalle del pago</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">ID:</span> {selectedPago.id}</p>
                  <p><span className="font-semibold">Cuidador:</span> {selectedPago.cuidador?.nombre || 'Sin cuidador'} (ID {selectedPago.cuidador?.id || 'N/A'})</p>
                  <p><span className="font-semibold">Monto:</span> ${selectedPago.monto || 0}</p>
                  <p><span className="font-semibold">Método:</span> {selectedPago.metodo || 'Sin método'}</p>
                  <p><span className="font-semibold">Fecha:</span> {selectedPago.fechaPago || 'Pendiente'}</p>
                  <p><span className="font-semibold">Estado:</span> {selectedPago.confirmado ? 'Confirmado' : 'Pendiente'}</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}