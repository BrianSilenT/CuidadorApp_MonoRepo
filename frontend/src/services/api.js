import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
})

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const toCamelCase = (text) => text.replace(/_([a-z])/g, (_, char) => char.toUpperCase())

const camelize = (value) => {
  if (Array.isArray(value)) {
    return value.map(camelize)
  }

  if (!isPlainObject(value)) {
    return value
  }

  return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
    accumulator[toCamelCase(key)] = camelize(nestedValue)
    return accumulator
  }, {})
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response?.data && isPlainObject(response.data)) {
      response.data = camelize(response.data)
    }
    return response
  },
  (error) => Promise.reject(error)
)

const unwrapList = (responseData) => {
  if (Array.isArray(responseData)) return responseData
  if (Array.isArray(responseData?.datos)) return responseData.datos
  return []
}

const createService = (resource) => ({
  getAll: () => api.get(`/${resource}/`),
  getById: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}/`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  delete: (id) => api.delete(`/${resource}/${id}`)
})

export const cuidadorService = createService('cuidadores')
export const pacienteService = createService('pacientes')

const baseGuardiaService = createService('guardias')
export const guardiaService = {
  ...baseGuardiaService,
  getMine: () => api.get('/guardias/mis-guardias'),
  getByPaciente: (id) => api.get(`/guardias/paciente/${id}`),
  getByCuidador: (id) => api.get(`/guardias/cuidador/${id}`),
  accept: (id) => api.put(`/guardias/${id}/aceptar`),
  cancel: (id) => api.put(`/guardias/${id}`, { estado: 'Cancelado' })
}

export const pagoService = createService('pagos')
export const usuarioService = createService('usuarios')
export const incidenteService = createService('incidentes')
export const logPacienteService = createService('logs-pacientes')

export const authService = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/cambiar-password', data),
  me: () => api.get('/auth/me')
}

export const sessionService = {
  getToken: () => localStorage.getItem('token') || '',
  getRole: () => localStorage.getItem('userRole') || '',
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  },
  clear: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
  }
}

export const reporteService = {
  getResumen: () => api.get('/reportes/resumen'),
  getCuidadores: () => api.get('/reportes/cuidadores'),
  getPagos: () => api.get('/reportes/pagos'),
  getGuardiasPorFecha: (desde, hasta) => api.get('/reportes/guardias', { params: { desde, hasta } })
}

export const documentoService = {
  getByCuidador: (cuidadorId) => api.get(`/documentos/cuidador/${cuidadorId}`),
  upload: (cuidadorId, formData) => api.post(`/documentos/cuidador/${cuidadorId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/documentos/${id}`)
}

export { unwrapList }

export default api
