import { Link } from 'react-router-dom'
import LoginForm from '../../components/auth/LoginForm'
import Logo from '../../components/common/Logo'

export default function CaregiverLogin() {
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
        <div className="hidden md:flex items-center gap-6">
          <a href="mailto:soporte@cuidadorapp.com?subject=Centro%20de%20Ayuda" className="text-sm font-medium text-[#4c739a] hover:text-[#2b8cee]">Centro de Ayuda</a>
          <a href="mailto:soporte@cuidadorapp.com?subject=Soporte%20Cuidador" className="text-sm font-medium text-[#4c739a] hover:text-[#2b8cee]">Contacto Soporte</a>
          <Link to="/caregiver/register" className="h-10 px-4 rounded-lg border border-[#2b8cee] text-[#2b8cee] text-sm font-bold inline-flex items-center">Registrar Institución</Link>
        </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#2b8cee]/10 blur-[100px]" />
          <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-blue-300/20 blur-[80px]" />
        </div>

        <div className="max-w-md w-full relative z-10">
          <LoginForm role="cuidador" />
        </div>
      </main>
    </div>
  )
}
