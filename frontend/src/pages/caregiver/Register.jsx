import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Logo from '../../components/common/Logo'
import api from '../../services/api'

export default function CaregiverRegister() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    documento: '',
    telefono: ''
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Crear usuario
      const userRes = await api.post('/usuarios/', {
        email: formData.email,
        password: formData.password,
        rol: 'cuidador'
      })
      
      const usuarioId = userRes.data.id

      // 2. Crear perfil de cuidador en estado pendiente de aprobación
      await api.post('/cuidadores/', {
        nombre: formData.nombre,
        documento: formData.documento,
        telefono: formData.telefono,
        activo: false,
        usuario_id: usuarioId
      })

      if (file) {
        setPendingApproval(true)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/caregiver/login')
      }, 3000)

    } catch (err) {
      setError(err?.response?.data?.error || 'Error al registrarse. Verifica los datos.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-[#e7edf3] w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0d141b] mb-2">¡Registro Exitoso!</h2>
          <p className="text-[#4c739a] mb-6">Tu solicitud fue enviada. Un administrador debe aprobar tu cuenta antes de que puedas iniciar sesión.</p>
          {pendingApproval && (
            <p className="text-xs text-[#4c739a]">Subirás tu documentación cuando el administrador apruebe el registro.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
      <header className="w-full bg-white border-b border-[#e7edf3] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 text-[#0d141b]">
            <div className="w-10 h-10 rounded-lg bg-[#2b8cee]/10 text-[#2b8cee] flex items-center justify-center">
              <Logo />
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight">CuidadorApp</h2>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 py-12">
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-xl border border-[#e7edf3] w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0d141b] mb-2">Darse de Alta</h2>
            <p className="text-[#4c739a] text-sm">Crea tu cuenta como Acompañante/Cuidador</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input label="Nombre Completo" name="nombre" value={formData.nombre} onChange={handleChange} required />
            <Input label="Documento de Identidad" name="documento" value={formData.documento} onChange={handleChange} required />
            <Input label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} required />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <Input label="Contraseña" type="password" name="password" value={formData.password} onChange={handleChange} required />
            
            <div className="flex flex-col gap-2">
              <label className="text-[#0d141b] text-sm font-semibold">Documentación (CV o Certificado)</label>
              <input 
                type="file" 
                onChange={handleFileChange}
                className="w-full text-sm text-[#4c739a] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#e7edf3] file:text-[#0d141b] hover:file:bg-[#cfdbe7] cursor-pointer"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-4" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#4c739a]">
              ¿Ya tienes cuenta? <Link to="/caregiver/login" className="text-[#2b8cee] font-bold hover:underline">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
