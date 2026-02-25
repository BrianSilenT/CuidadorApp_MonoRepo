import { useEffect, useState } from 'react'
import FamilyLayout from '../../components/layouts/FamilyLayout'
import PageHeader from '../../components/common/PageHeader'
import { LoadingState, EmptyState, ErrorState } from '../../components/common/DataState'
import { pacienteService, unwrapList } from '../../services/api'

export default function MedicalRecords() {
  const [pacientes, setPacientes] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    pacienteService.getAll()
      .then((res) => {
        const rows = unwrapList(res.data)
        setPacientes(rows)
        if (rows.length > 0) setSelected(rows[0])
      })
      .catch(() => setError('No se pudieron cargar los registros médicos. Requiere sesión de familia.'))
      .finally(() => setLoading(false))
  }, [])

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
                    <button className="h-10 px-4 rounded-lg border border-[#e7edf3] text-sm font-bold hover:bg-[#f6f7f8]">Imprimir reporte</button>
                    <button className="h-10 px-4 rounded-lg bg-[#2b8cee] text-white text-sm font-bold hover:bg-blue-600">Editar ficha</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Tipo de Sangre', value: 'O+' },
                    { label: 'Altura', value: '178 cm' },
                    { label: 'Peso', value: '75 kg' },
                    { label: 'Edad', value: '68' }
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-[#e7edf3] bg-[#f6f7f8] p-4">
                      <p className="text-xs text-[#4c739a] font-semibold uppercase tracking-wider">{item.label}</p>
                      <p className="text-xl font-bold mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-[#e7edf3] p-4">
                    <p className="text-sm font-bold mb-3">Alergias</p>
                    <ul className="space-y-2 text-sm text-[#4c739a]">
                      <li>• Maní (Severa)</li>
                      <li>• Penicilina (Sarpullido leve)</li>
                      <li>• Polen (Estacional)</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-[#e7edf3] overflow-hidden lg:col-span-2">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead className="bg-[#f6f7f8]">
                        <tr>
                          <th className="text-left py-3 px-4 font-bold text-[#4c739a]">Medicamento</th>
                          <th className="text-left py-3 px-4 font-bold text-[#4c739a]">Dosis</th>
                          <th className="text-left py-3 px-4 font-bold text-[#4c739a]">Frecuencia</th>
                          <th className="text-left py-3 px-4 font-bold text-[#4c739a]">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-[#e7edf3]"><td className="py-3 px-4">Lisinopril</td><td className="py-3 px-4">10mg</td><td className="py-3 px-4">Diaria</td><td className="py-3 px-4 text-emerald-700">Activa</td></tr>
                        <tr className="border-t border-[#e7edf3]"><td className="py-3 px-4">Metformin</td><td className="py-3 px-4">500mg</td><td className="py-3 px-4">2 veces al día</td><td className="py-3 px-4 text-emerald-700">Activa</td></tr>
                        <tr className="border-t border-[#e7edf3]"><td className="py-3 px-4">Atorvastatin</td><td className="py-3 px-4">20mg</td><td className="py-3 px-4">Noche</td><td className="py-3 px-4 text-amber-700">Revisión</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FamilyLayout>
  )
}