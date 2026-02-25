import { useEffect, useState } from 'react'
import CaregiverLayout from '../../components/layouts/CaregiverLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { guardiaService, unwrapList } from '../../services/api'

export default function PatientLogs() {
  const [logs, setLogs] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    guardiaService.getAll()
      .then((res) => {
        const list = unwrapList(res.data)
        setLogs(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => setError('No se pudieron cargar los registros de pacientes.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <CaregiverLayout title="Registros de Pacientes">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Registros de Pacientes"
          description="Revisa historial de pacientes y agrega notas de cuidado diarias."
          breadcrumb={[
            { label: 'Cuidador', path: '/caregiver/dashboard' },
            { label: 'Registros' }
          ]}
        />

        {error && <ErrorState message={error} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#cfdbe7] shadow-sm"><p className="text-xs font-semibold text-[#4c739a] uppercase">Total Pacientes</p><p className="text-2xl font-bold">{logs.length}</p></div>
          <div className="bg-white p-4 rounded-xl border border-[#cfdbe7] shadow-sm"><p className="text-xs font-semibold text-[#4c739a] uppercase">Actualizaciones Hoy</p><p className="text-2xl font-bold">{Math.min(12, logs.length)}</p></div>
          <div className="bg-white p-4 rounded-xl border border-[#cfdbe7] shadow-sm"><p className="text-xs font-semibold text-[#4c739a] uppercase">Estado Crítico</p><p className="text-2xl font-bold">{logs.filter((l) => (l.horasTrabajadas || 0) >= 8).length}</p></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            {loading && <LoadingState label="Cargando registros..." />}
            {!loading && logs.length === 0 && <EmptyState label="No hay registros de pacientes." />}

            {!loading && logs.length > 0 && (
              <div className="max-h-[520px] overflow-auto space-y-2">
                {logs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`w-full text-left border rounded-lg p-3 transition-colors ${
                      selected?.id === item.id ? 'border-[#2b8cee] bg-[#2b8cee]/5' : 'border-[#e7edf3] hover:bg-[#f6f7f8]'
                    }`}
                  >
                    <p className="text-sm font-semibold">{item.paciente?.nombre || 'Paciente sin nombre'}</p>
                    <p className="text-xs text-[#4c739a] mt-1">{item.fecha || 'Sin fecha'} · {item.horasTrabajadas || 0}h</p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            {!selected && <EmptyState label="Selecciona un registro para ver el detalle." />}
            {selected && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold">Detalle del registro</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p><span className="font-semibold">Paciente:</span> {selected.paciente?.nombre || 'N/A'}</p>
                  <p><span className="font-semibold">Fecha:</span> {selected.fecha || 'N/A'}</p>
                  <p><span className="font-semibold">Horas:</span> {selected.horasTrabajadas || 0}h</p>
                  <p><span className="font-semibold">Cuidador:</span> {selected.cuidador?.nombre || 'N/A'}</p>
                </div>
                <div className="rounded-lg border border-[#e7edf3] p-4 bg-[#f6f7f8]">
                  <p className="text-sm font-semibold mb-2">Informe</p>
                  <p className="text-sm text-[#4c739a] leading-relaxed">{selected.informe || 'No se registró informe para este turno.'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Editar</Button>
                  <Button variant="outline" size="sm">Compartir</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </CaregiverLayout>
  )
}