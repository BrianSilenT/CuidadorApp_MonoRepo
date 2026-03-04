import { Link } from 'react-router-dom'
import Button from '../common/Button'

export default function RoleCard({ title, description, icon, image, linkTo }) {
  return (
    <div className="group flex flex-col bg-white rounded-xl border-2 border-transparent hover:border-[#2b8cee] transition-all duration-300 shadow-sm hover:shadow-xl p-8 cursor-pointer">
      <div className="flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#2b8cee]/10 flex items-center justify-center text-[#2b8cee] mb-2">
          <span className="material-symbols-outlined text-4xl">{icon}</span>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-[#0d141b] text-2xl font-bold">{title}</h3>
          <p className="text-[#4c739a] text-base leading-relaxed">{description}</p>
        </div>
        {image && (
          <div 
            className="w-full h-[200px] bg-center bg-no-repeat bg-cover rounded-lg my-4"
            style={{ backgroundImage: `url(${image})` }}
          />
        )}
        <Link to={linkTo} className="w-full">
          <Button variant="primary" size="lg" className="w-full">
            Entrar
            <span className="material-symbols-outlined ml-2">chevron_right</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
