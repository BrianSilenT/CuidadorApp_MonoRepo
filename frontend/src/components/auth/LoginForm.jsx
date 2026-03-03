import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../common/Input'
import Button from '../common/Button'
import { authService } from '../../services/api'

export default function LoginForm({ role }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roleHome = {
    admin: '/admin/dashboard',
    cuidador: '/caregiver/dashboard',
    familia: '/family/dashboard'
  }

  const roleLabel = {
    admin: 'administrador',
    cuidador: 'cuidador',
    familia: 'familia'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Email y contraseña son obligatorios.')
      return
    }

    setLoading(true)
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      })

      const token = response.data?.token
      const loggedRole = response.data?.usuario?.rol

      if (!token || !loggedRole) {
        setError('Respuesta de login inválida.')
        return
      }

      if (role && loggedRole !== role) {
        setError(`Este acceso es para ${roleLabel[role] || role}. Tu usuario es ${roleLabel[loggedRole] || loggedRole}.`)
        return
      }

      localStorage.setItem('token', token)
      localStorage.setItem('userRole', loggedRole)
      localStorage.setItem('user', JSON.stringify(response.data?.usuario || {}))

      navigate(roleHome[loggedRole] || '/')
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-xl shadow-xl border border-[#e7edf3] w-full max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0d141b] mb-2">Iniciar Sesión</h2>
        <p className="text-[#4c739a] text-sm">Accede a tu panel de {role}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email o Usuario"
          type="email"
          name="email"
          placeholder="Ingresa tu email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[#0d141b] text-sm font-semibold">Contraseña</label>
            <a href="mailto:soporte@cuidadorapp.com?subject=Recuperar%20contrase%C3%B1a" className="text-[#2b8cee] text-xs font-bold hover:underline">
              ¿Olvidaste?
            </a>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            name="remember"
            id="remember"
            checked={formData.remember}
            onChange={handleChange}
            className="rounded border-[#cfdbe7] text-[#2b8cee] focus:ring-[#2b8cee] cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-[#4c739a] cursor-pointer">
            Mantenerme conectado
          </label>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" icon="login" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>

      {role !== 'admin' && (
        <div className="mt-8 pt-6 border-t border-[#e7edf3]">
          <p className="text-center text-sm text-[#4c739a] mb-4">¿Nuevo en CuidadorApp?</p>
          <div className="flex justify-center">
            <button 
              type="button"
              onClick={() => navigate(role === 'cuidador' ? '/caregiver/register' : '/family/register')}
              className="flex flex-col items-center justify-center p-3 px-8 rounded-lg border border-[#cfdbe7] hover:bg-slate-50 transition-colors w-full max-w-[200px]"
            >
              <span className="material-symbols-outlined text-[#2b8cee] mb-1">person_add</span>
              <span className="text-xs font-bold text-[#0d141b] uppercase tracking-wider">Registrarse</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
