import { Link } from 'react-router-dom'
import LoginForm from '../../components/auth/LoginForm'

export default function FamilyLogin() {
  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <header className="flex items-center justify-between border-b border-[#e7edf3] bg-white px-6 lg:px-40 py-3">
        <Link to="/" className="flex items-center gap-4 text-[#0d141b]">
          <div className="w-6 h-6 text-[#2b8cee]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">CuidadorApp</h2>
        </Link>
        <Link to="/family/register" className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#2b8cee] text-white text-sm font-bold">
          Solicitar Cuidador
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col text-center lg:text-left">
            <div className="mb-6 hidden lg:block">
              <img 
                alt="Family hugging" 
                className="w-full h-48 object-cover rounded-xl shadow-sm" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzIQByHc2k-OyCng6rWKSBTFQmo0HDg5cPUbSGy_qNe5PGrL98fzRTANSFMUIDo0_hgdHn2mqWAXauIyNqGzLkUHUds9qj2CpIu6PzQmTXiARwRfwQHAp43olvNV3lkDhLsn2S2HTzOt-qd9DxLksVisa5bSN1ySljAkhy82LxroNkz1oQNrJ5MgTG3BEJlIZXmrm8NQncsNYPg0qD8SZcVHJKJk2_0xdgJkJrx3g0P3tfdoOjljk379pawRftQpKZTI5PAm9sNPhb"
              />
            </div>
            <h1 className="text-[#0d141b] tracking-light text-[32px] md:text-[40px] font-bold leading-tight pb-3">
              El cuidado de su familia, a un clic de distancia.
            </h1>
            <p className="text-[#4c739a] text-lg font-normal leading-relaxed pb-6">
              Bienvenido a CuidadorApp Familiar. Acceda de forma segura a reportes de cuidado, programe visitas y manténgase conectado con el equipo de atención de sus seres queridos.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3 text-[#0d141b]">
                <span className="material-symbols-outlined text-[#2b8cee]">verified_user</span>
                <span className="text-base font-medium">Seguro y Confidencial</span>
              </div>
              <div className="flex items-center gap-3 text-[#0d141b]">
                <span className="material-symbols-outlined text-[#2b8cee]">real_estate_agent</span>
                <span className="text-base font-medium">Reportes y Registros Diarios</span>
              </div>
            </div>
          </div>

          <LoginForm role="familia" />
        </div>
      </main>
    </div>
  )
}
