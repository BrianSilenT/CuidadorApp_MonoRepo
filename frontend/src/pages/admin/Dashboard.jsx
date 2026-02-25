import AdminLayout from '../../components/layouts/AdminLayout'
import StatCard from '../../components/common/StatCard'

export default function AdminDashboard() {
  return (
    <AdminLayout title="Resumen General">
      <div className="p-8 space-y-8 bg-[#f6f7f8] min-h-full">
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2 h-10 bg-white border border-[#e7edf3] rounded-lg px-3 min-w-[320px]">
              <span className="material-symbols-outlined text-[#4c739a] text-lg">search</span>
              <input className="bg-transparent text-sm outline-none w-full" placeholder="Buscar pacientes, cuidadores o reportes..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Cuidadores Activos"
              value="1,284"
              icon="medical_services"
              trend="up"
              trendValue="5.2%"
            />
            <StatCard
              title="Pacientes en Atención"
              value="856"
              icon="personal_injury"
              trend="down"
              trendValue="2.1%"
            />
            <StatCard
              title="Turnos Pendientes"
              value="142"
              icon="pending_actions"
              trend="up"
              trendValue="8.4%"
            />
            <StatCard
              title="Pagos Procesados Hoy"
              value="$12,450"
              icon="payments"
              trend="up"
              trendValue="15.3%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm">
              <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f6f7f8]">
                    <div className="w-10 h-10 rounded-full bg-[#2b8cee]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#2b8cee]">person</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Nuevo turno asignado</p>
                      <p className="text-xs text-[#4c739a]">Hace {i} hora{i > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm">
              <h3 className="text-lg font-bold mb-4">Alertas Importantes</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <span className="material-symbols-outlined text-orange-600">warning</span>
                  <div>
                    <p className="text-sm font-semibold text-orange-900">3 reportes pendientes de revisión</p>
                    <p className="text-xs text-orange-700">Requieren atención inmediata</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">5 nuevas solicitudes de cuidadores</p>
                    <p className="text-xs text-blue-700">Verificación pendiente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </AdminLayout>
  )
}
