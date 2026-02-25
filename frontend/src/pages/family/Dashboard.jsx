import FamilyLayout from '../../components/layouts/FamilyLayout'

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const calendarDays = [
  [1, null],
  [2, null],
  [3, null],
  [4, { type: 'primary', title: 'Sarah J.', time: '9:00 - 13:00' }],
  [5, null],
  [6, { type: 'success', title: 'Physical T.', time: '14:00 - 15:30' }],
  [7, null],
  [8, null],
  [9, { type: 'primary', title: 'Mark T.', time: '10:00 - 18:00' }],
  [10, null],
  [11, { type: 'primary', title: 'Sarah J.', time: '9:00 - 13:00' }],
  [12, null],
  [13, { type: 'warning', title: 'Sarah J.', time: 'Noche' }],
  [14, null],
  [15, null],
  [16, { type: 'request', title: 'Solicitud', time: 'Por definir' }],
  [17, { type: 'focus', title: 'Mark T.', time: '08:00 - 14:00' }],
  [18, null],
  [19, null],
  [20, null],
  [21, null],
  [22, null],
  [23, null],
  [24, null],
  [25, null],
  [26, null],
  [27, null],
  [28, null],
  [29, null],
  [30, null],
  [31, null],
  [null, null],
  [null, null],
  [null, null],
  [null, null]
]

const eventStyles = {
  primary: 'bg-[#2b8cee] text-white',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  request: 'bg-[#2b8cee]/15 text-[#2b8cee] border border-[#2b8cee]',
  focus: 'bg-[#2b8cee] text-white'
}

export default function FamilyDashboard() {
  return (
    <FamilyLayout title="Agenda y Reservas">
      <div className="min-h-full bg-[#f6f7f8]">
        <div className="p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <section className="space-y-5">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Agenda Familiar</h1>
              <p className="text-[#4c739a]">Supervisa y gestiona todas las sesiones de cuidado de octubre 2023</p>
            </div>

            <div className="inline-flex items-center gap-4 bg-white border border-[#e7edf3] rounded-xl px-4 py-2">
              <button className="h-9 w-9 rounded-md hover:bg-[#f6f7f8]">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <p className="font-bold min-w-[120px] text-center">Octubre 2023</p>
              <button className="h-9 w-9 rounded-md hover:bg-[#f6f7f8]">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="bg-white border border-[#e7edf3] rounded-xl overflow-hidden">
              <div className="grid grid-cols-7 bg-[#f6f7f8] border-b border-[#e7edf3]">
                {weekDays.map((day) => (
                  <div key={day} className="py-3 text-center text-xs font-bold uppercase text-[#4c739a]">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 auto-rows-[88px]">
                {calendarDays.map(([day, event], index) => (
                  <div
                    key={`${day ?? 'x'}-${index}`}
                    className={`border-r border-b border-[#e7edf3] p-2 ${day === 17 ? 'ring-2 ring-inset ring-[#2b8cee]' : ''} ${event?.type === 'focus' ? 'bg-[#2b8cee]/5' : ''}`}
                  >
                    {day ? (
                      <span className={`text-xs font-bold ${day === 17 ? 'text-white bg-[#2b8cee] rounded-full h-5 w-5 inline-flex items-center justify-center' : 'text-[#4c739a]'}`}>
                        {day}
                      </span>
                    ) : (
                      <span className="text-xs text-[#c1c9d1]">&nbsp;</span>
                    )}

                    {event && (
                      <div className={`mt-1 text-[10px] font-bold leading-tight rounded-md p-1.5 ${eventStyles[event.type]}`}>
                        {event.title}<br />{event.time}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="bg-white border border-[#e7edf3] rounded-xl p-5 h-fit space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Próximas</h3>
              <button className="text-xs font-bold uppercase text-[#2b8cee]">Ver todo</button>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#4c739a] border-b border-[#e7edf3] pb-2">Hoy, 17 Oct</p>
              <div className="space-y-2">
                <p className="font-bold text-sm">Mark Thompson</p>
                <p className="text-xs text-[#4c739a]">08:00 AM - 02:00 PM (6 hrs)</p>
                <div className="bg-[#f6f7f8] border border-[#e7edf3] rounded-lg p-3">
                  <p className="text-[10px] font-bold uppercase text-[#4c739a]">Actividades</p>
                  <p className="text-xs mt-1">Recordatorio de medicación, asistencia de movilidad y comida ligera.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#4c739a] border-b border-[#e7edf3] pb-2">Mañana, 18 Oct</p>
              <div>
                <p className="font-bold text-sm">Mantenimiento Programado</p>
                <p className="text-xs text-[#4c739a]">No hay sesiones programadas.</p>
                <button className="text-xs mt-1 font-bold text-[#2b8cee]">+ Reservar sesión extra</button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#4c739a] border-b border-[#e7edf3] pb-2">Viernes, 20 Oct</p>
              <div>
                <p className="font-bold text-sm">Elena Rodas</p>
                <p className="text-xs text-[#4c739a]">02:00 PM - 03:30 PM</p>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 mt-1">Confirmado</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#2b8cee]/20 bg-[#2b8cee]/5 p-4">
              <h4 className="text-xs font-bold mb-2">¿Necesitas ayuda?</h4>
              <p className="text-[11px] text-[#4c739a] mb-3">Nuestro equipo clínico está disponible 24/7 para consultas urgentes.</p>
              <button className="w-full h-9 rounded-lg border border-[#2b8cee] text-[#2b8cee] text-sm font-bold hover:bg-[#2b8cee] hover:text-white transition-colors">
                Llamar a Soporte
              </button>
            </div>
          </aside>
        </div>
      </div>
    </FamilyLayout>
  )
}
