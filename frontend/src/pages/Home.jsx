import { Link } from 'react-router-dom'
import RoleCard from '../components/auth/RoleCard'
import Logo from '../components/common/Logo'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8]">
      <header className="flex items-center justify-between border-b border-[#e7edf3] bg-white px-6 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4 text-[#0d141b]">
          <Link to="/" className="flex items-center gap-3">
            <div className="text-[#2b8cee]">
              <Logo />
            </div>
            <h2 className="text-lg font-extrabold leading-tight tracking-tight">CuidadorApp</h2>
          </Link>
        </div>
        <div className="flex gap-3">
          <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#e7edf3] text-[#0d141b] text-sm font-bold">
            Ayuda
          </button>
          <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#2b8cee] text-white text-sm font-bold">
            Contacto
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-[1000px] w-full flex flex-col items-center">
          <div className="text-center mb-12">
            <h1 className="text-[#0d141b] tracking-tight text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              Bienvenido a CuidadorApp
            </h1>
            <p className="text-[#4c739a] text-lg font-medium max-w-lg mx-auto">
              Seleccione su perfil para acceder al portal correspondiente y comenzar su gestión.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4">
            <RoleCard
              title="Acompañantes"
              description="Acceda a su panel profesional para gestionar turnos, completar reportes diarios de pacientes y coordinar su agenda."
              icon="medical_services"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuCFjeH1ndBBmSV0MAQbjg_TU2JDXp0XA98Cl4Q8sX9QRTKWGSObyguRj7cCgV_m4AnH2btVMOJFvk4CQe6Uwr4d7XjkHnx0RtJaxgUSZre_rIkJYqzhr2mJblktg-FcvvFPX1zSEYZV_y5WAytT-sfdY_xLzgXbxcJFNj3ctaiNNV4wm3FdLU21kIddss7wzKs-JdBKkDBDmTiWGaxUO3W9LlbTS1sRUq0fjhn7c2qMnTAfp3UjnjxP_fRRnmOo-JFBroPR1zTZlXIL"
              linkTo="/caregiver/login"
            />
            
            <RoleCard
              title="Clientes/Familiares"
              description="Monitoree el bienestar de sus seres queridos en tiempo real, gestione servicios contratados y reciba actualizaciones."
              icon="family_restroom"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuAyoFcDrWULxVsaGFsqLvtcPE5t4UoNJV08n0o42NiYsWR2C\_jRjAkihIXiRm4wU63uyc6UwX3ApE3a45o-ZPz9Mq6-FcIDj8WBZVWVcJAYR-h_IWo6BOzuSj3Xj86Sz21h-Pi3AOJA2wB6bJv9S13b0tNNLgs8HqVx9glhFFksldcLP8h2QTOYenM1roxKUUAanINkvMk2E4udNWPmlaRnLg-N9yi9u5zUrIvA6DAWMP0_GGf09HHjR5YaWv1kxtAh2btyrFcUfHTT"
              linkTo="/family/login"
            />
          </div>
        </div>
      </main>
      
      <footer className="py-10 px-6 border-t border-[#e7edf3] bg-white">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#4c739a] text-sm">
            © 2024 CuidadorApp. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[#4c739a] hover:text-[#2b8cee] text-sm font-medium transition-colors">
              Términos y condiciones
            </a>
            <a href="#" className="text-[#4c739a] hover:text-[#2b8cee] text-sm font-medium transition-colors">
              Privacidad
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
