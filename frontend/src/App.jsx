import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import FamilyLogin from './pages/family/Login'
import FamilyDashboard from './pages/family/Dashboard'
import FamilyMedicalRecords from './pages/family/MedicalRecords'
import FamilyHistory from './pages/family/History'
import FamilySupport from './pages/family/Support'
import CaregiverLogin from './pages/caregiver/Login'
import CaregiverRegister from './pages/caregiver/Register'
import FamilyRegister from './pages/family/Register'
import CaregiverDashboard from './pages/caregiver/Dashboard'
import CaregiverPatientLogs from './pages/caregiver/PatientLogs'
import CaregiverIncidents from './pages/caregiver/Incidents'
import CaregiverShiftReports from './pages/caregiver/ShiftReports'
import CaregiverPayroll from './pages/caregiver/Payroll'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import Pacientes from './pages/admin/Pacientes'
import Cuidadores from './pages/admin/Cuidadores'
import SolicitudesCuidadores from './pages/admin/SolicitudesCuidadores'
import Guardias from './pages/admin/Guardias'
import Reportes from './pages/admin/Reportes'
import Pagos from './pages/admin/Pagos'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="/family/login" element={<FamilyLogin />} />
      <Route path="/family/dashboard" element={<ProtectedRoute allowedRoles={['familia']}><FamilyDashboard /></ProtectedRoute>} />
      <Route path="/family/medical-records" element={<ProtectedRoute allowedRoles={['familia']}><FamilyMedicalRecords /></ProtectedRoute>} />
      <Route path="/family/history" element={<ProtectedRoute allowedRoles={['familia']}><FamilyHistory /></ProtectedRoute>} />
      <Route path="/family/support" element={<ProtectedRoute allowedRoles={['familia']}><FamilySupport /></ProtectedRoute>} />
      
      <Route path="/caregiver/login" element={<CaregiverLogin />} />
      <Route path="/caregiver/register" element={<CaregiverRegister />} />
      <Route path="/family/register" element={<FamilyRegister />} />
      <Route path="/caregiver/dashboard" element={<ProtectedRoute allowedRoles={['cuidador']}><CaregiverDashboard /></ProtectedRoute>} />
      <Route path="/caregiver/patient-logs" element={<ProtectedRoute allowedRoles={['cuidador']}><CaregiverPatientLogs /></ProtectedRoute>} />
      <Route path="/caregiver/incidents" element={<ProtectedRoute allowedRoles={['cuidador']}><CaregiverIncidents /></ProtectedRoute>} />
      <Route path="/caregiver/shift-reports" element={<ProtectedRoute allowedRoles={['cuidador']}><CaregiverShiftReports /></ProtectedRoute>} />
      <Route path="/caregiver/payroll" element={<ProtectedRoute allowedRoles={['cuidador']}><CaregiverPayroll /></ProtectedRoute>} />
      <Route path="/caregiver/turnos" element={<Navigate to="/caregiver/shift-reports" replace />} />
      <Route path="/caregiver/pacientes" element={<Navigate to="/caregiver/patient-logs" replace />} />
      <Route path="/caregiver/reportes" element={<Navigate to="/caregiver/incidents" replace />} />
      <Route path="/caregiver/pagos" element={<Navigate to="/caregiver/payroll" replace />} />
      
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/pacientes" element={<ProtectedRoute allowedRoles={['admin']}><Pacientes /></ProtectedRoute>} />
      <Route path="/admin/cuidadores" element={<ProtectedRoute allowedRoles={['admin']}><Cuidadores /></ProtectedRoute>} />
      <Route path="/admin/solicitudes-cuidadores" element={<ProtectedRoute allowedRoles={['admin']}><SolicitudesCuidadores /></ProtectedRoute>} />
      <Route path="/admin/guardias" element={<ProtectedRoute allowedRoles={['admin']}><Guardias /></ProtectedRoute>} />
      <Route path="/admin/reportes" element={<ProtectedRoute allowedRoles={['admin']}><Reportes /></ProtectedRoute>} />
      <Route path="/admin/pagos" element={<ProtectedRoute allowedRoles={['admin']}><Pagos /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

