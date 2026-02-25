import { useState } from 'react'
import FamilyLayout from '../../components/layouts/FamilyLayout'
import Input from '../../components/common/Input'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState } from '../../components/common/DataState'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Support() {
  const [formData, setFormData] = useState({
    email: '',
    asunto: '',
    mensaje: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!emailRegex.test(formData.email)) {
      setError('Ingresa un email válido para contacto.')
      return
    }
    if (!formData.asunto.trim() || !formData.mensaje.trim()) {
      setError('Asunto y mensaje son obligatorios.')
      return
    }

    setSuccess('Solicitud enviada. El equipo de soporte responderá en breve.')
    setFormData({ email: '', asunto: '', mensaje: '' })
  }

  return (
    <FamilyLayout title="Soporte y Ayuda">
      <div className="p-8 space-y-6 bg-[#f6f7f8] min-h-full">
        <PageHeader
          title="Centro de Ayuda"
          description="Encuentra respuestas rápidas o envía una solicitud al equipo administrativo."
          breadcrumb={[
            { label: 'Familia', path: '/family/dashboard' },
            { label: 'Soporte' }
          ]}
        />

        {error && <ErrorState message={error} />}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-[#e7edf3] p-5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">search</span>
                <input className="w-full h-11 rounded-lg border border-[#e7edf3] pl-10 pr-3 text-sm" placeholder="Buscar artículos, ayuda de pagos o tutoriales..." />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e7edf3] overflow-hidden">
              {[{
                q: '¿Cómo reprogramo una sesión mensual de cuidado?',
                a: 'Ve a Agenda y Reservas y edita la sesión desde el panel de próximas visitas.'
              }, {
                q: '¿Puedo actualizar datos de contacto en bloque?',
                a: 'Por seguridad, los datos de contacto se actualizan individualmente por paciente.'
              }, {
                q: '¿Qué hago si aparece una alerta de incidencia?',
                a: 'Abre Historial, revisa el reporte completo y contacta soporte si hace falta.'
              }].map((faq) => (
                <details key={faq.q} className="group p-4 border-b border-[#e7edf3] last:border-b-0">
                  <summary className="cursor-pointer flex items-center justify-between text-sm font-semibold">
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <p className="mt-2 text-sm text-[#4c739a]">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="xl:col-span-5 bg-white rounded-2xl border border-[#e7edf3] p-6">
            <h4 className="text-lg font-bold mb-1">Contactar Administración</h4>
            <p className="text-sm text-[#4c739a] mb-4">Envía un ticket por problemas técnicos o solicitudes de cuenta.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="Email" name="email" type="email" value={formData.email} onChange={onChange} required />
              <Input label="Asunto" name="asunto" value={formData.asunto} onChange={onChange} required />

              <div className="flex flex-col gap-2">
                <label className="text-[#0d141b] text-sm font-semibold">Mensaje</label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={onChange}
                  rows={5}
                  className="w-full border border-[#cfdbe7] rounded-lg p-3 text-sm"
                  required
                />
              </div>

              <button type="submit" className="w-full h-11 rounded-lg bg-[#2b8cee] text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                Enviar solicitud
              </button>
            </form>
            <div className="mt-5 pt-5 border-t border-[#e7edf3] grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-[#e7edf3] p-3">
                <span className="material-symbols-outlined text-blue-600">chat</span>
                <p className="text-xs font-semibold mt-1">Chat en vivo</p>
              </div>
              <div className="rounded-lg border border-[#e7edf3] p-3">
                <span className="material-symbols-outlined text-emerald-600">call</span>
                <p className="text-xs font-semibold mt-1">Llámanos</p>
              </div>
              <div className="rounded-lg border border-[#e7edf3] p-3">
                <span className="material-symbols-outlined text-purple-600">forum</span>
                <p className="text-xs font-semibold mt-1">Comunidad</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FamilyLayout>
  )
}