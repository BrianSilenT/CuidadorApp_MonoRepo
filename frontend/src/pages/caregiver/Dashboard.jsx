import CaregiverLayout from '../../components/layouts/CaregiverLayout'

export default function CaregiverDashboard() {
  return (
    <CaregiverLayout title="Resumen del Panel">
      <div className="p-8 space-y-6 bg-[#f3f4f6] min-h-full">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <p className="text-[#4c739a]">Bienvenida de vuelta, Sarah. Esto es lo que ocurre hoy.</p>
          </div>
          <div className="flex gap-3">
            <button className="h-10 px-4 rounded-lg border border-[#cfdbe7] bg-white text-sm font-semibold">Agenda</button>
            <button className="h-10 px-4 rounded-lg bg-[#2b8cee] text-white text-sm font-semibold">Nuevo Registro</button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-[#cfdbe7] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#e7edf3] flex justify-between items-center">
                <h2 className="text-lg font-bold">Próximo Turno</h2>
                <button className="text-sm font-semibold text-[#2b8cee]">Ver Calendario</button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs uppercase tracking-wider font-bold text-[#2b8cee]">Sucede Hoy</p>
                <h3 className="text-3xl font-bold">2:00 PM - 8:00 PM</h3>
                <p className="text-sm text-[#4c739a]">123 Maple Street, Springfield</p>
                <p className="text-sm text-[#4c739a]">Paciente: Alice Johnson • Asistencia en actividades diarias, comida y recordatorios.</p>
                <div className="flex gap-3">
                  <button className="h-10 px-5 rounded-lg bg-[#2b8cee] text-white text-sm font-bold">Registrar Ingreso</button>
                  <button className="h-10 px-5 rounded-lg border border-[#cfdbe7] text-sm font-bold">Detalles</button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#cfdbe7] rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Actualizaciones Recientes</h2>
              <div className="space-y-4">
                {[
                  ['Ajuste de Medicación - Alice Johnson', 'Dr. Smith actualizó la dosis.', 'Hace 2h'],
                  ['Reporte de Incidencia - Robert Fox', 'Resbalón leve en pasillo, sin lesiones.', 'Ayer'],
                  ['Revisión de Plan Completa', 'Revisión trimestral aprobada.', 'Hace 2d']
                ].map((item) => (
                  <div key={item[0]} className="flex justify-between items-start border-b border-[#e7edf3] last:border-b-0 pb-3 last:pb-0">
                    <div>
                      <p className="text-sm font-bold">{item[0]}</p>
                      <p className="text-sm text-[#4c739a]">{item[1]}</p>
                    </div>
                    <span className="text-xs text-[#4c739a]">{item[2]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl p-6 text-white bg-gradient-to-br from-[#2b8cee] to-blue-700">
              <p className="text-xs uppercase tracking-wider font-bold text-blue-100">Horas Trabajadas</p>
              <p className="text-5xl font-extrabold mt-2">124.5</p>
              <p className="text-sm text-blue-100">/ 160 hrs</p>
              <div className="mt-4 h-2 rounded-full bg-black/20 overflow-hidden">
                <div className="h-full w-[78%] bg-white rounded-full" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-blue-100">Ingresos</p><p className="font-bold text-xl">$3,420</p></div>
                <div><p className="text-xs text-blue-100">Próximo Pago</p><p className="font-bold text-xl">15 Oct</p></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#cfdbe7] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs uppercase font-bold text-[#4c739a]">Pacientes Activos</p>
              </div>
              <div className="bg-white border border-[#cfdbe7] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs uppercase font-bold text-[#4c739a]">Reportes Pendientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CaregiverLayout>
  )
}
