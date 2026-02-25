import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import FamilyLogin from './pages/family/Login'
import FamilyDashboard from './pages/family/Dashboard'
import FamilyMedicalRecords from './pages/family/MedicalRecords'
import FamilyHistory from './pages/family/History'
import FamilySupport from './pages/family/Support'
import CaregiverLogin from './pages/caregiver/Login'
import CaregiverDashboard from './pages/caregiver/Dashboard'
import CaregiverPatientLogs from './pages/caregiver/PatientLogs'
import CaregiverIncidents from './pages/caregiver/Incidents'
import CaregiverShiftReports from './pages/caregiver/ShiftReports'
import CaregiverPayroll from './pages/caregiver/Payroll'
import AdminDashboard from './pages/admin/Dashboard'
import Pacientes from './pages/admin/Pacientes'
import Cuidadores from './pages/admin/Cuidadores'
import Guardias from './pages/admin/Guardias'
import Reportes from './pages/admin/Reportes'
import Pagos from './pages/admin/Pagos'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="/family/login" element={<FamilyLogin />} />
      <Route path="/family/dashboard" element={<FamilyDashboard />} />
      <Route path="/family/medical-records" element={<FamilyMedicalRecords />} />
      <Route path="/family/history" element={<FamilyHistory />} />
      <Route path="/family/support" element={<FamilySupport />} />
      
      <Route path="/caregiver/login" element={<CaregiverLogin />} />
      <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
      <Route path="/caregiver/patient-logs" element={<CaregiverPatientLogs />} />
      <Route path="/caregiver/incidents" element={<CaregiverIncidents />} />
      <Route path="/caregiver/shift-reports" element={<CaregiverShiftReports />} />
      <Route path="/caregiver/payroll" element={<CaregiverPayroll />} />
      <Route path="/caregiver/turnos" element={<Navigate to="/caregiver/shift-reports" replace />} />
      <Route path="/caregiver/pacientes" element={<Navigate to="/caregiver/patient-logs" replace />} />
      <Route path="/caregiver/reportes" element={<Navigate to="/caregiver/incidents" replace />} />
      <Route path="/caregiver/pagos" element={<Navigate to="/caregiver/payroll" replace />} />
      
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/pacientes" element={<Pacientes />} />
      <Route path="/admin/cuidadores" element={<Cuidadores />} />
      <Route path="/admin/guardias" element={<Guardias />} />
      <Route path="/admin/reportes" element={<Reportes />} />
      <Route path="/admin/pagos" element={<Pagos />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

