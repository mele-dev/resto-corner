import { useNavigate } from 'react-router-dom';
import { Building2, Utensils, ShoppingBag } from 'lucide-react';
import Logo from '../components/Logo/Logo';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Fondo azul que cubre toda la pantalla */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(5,8,46,1)] via-[rgba(15,25,80,1)] to-[rgba(5,8,46,1)] z-0">
        {/* Logo de fondo - Grande y detrás de todo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo showText={false} height={500} className="opacity-20" />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
        {/* Logo principal */}
        <div className="mb-8">
          <Logo showText={true} height={120} />
        </div>

        {/* Título de bienvenida */}
        <h1 className="text-5xl font-bold text-white mb-4 text-center">
        </h1>

        {/* Botones de acceso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-3xl">
          {/* Acceso Restaurante */}
          <button
            onClick={() => navigate('/login')}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-primary-500 to-purple-600 text-white rounded-2xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 min-h-[200px]"
          >
            <div className="bg-white/20 p-4 rounded-full">
              <Building2 size={48} />
            </div>
            <span className="text-xl">Acceso Restaurante</span>
            <span className="text-sm text-white/80 text-center">
              Administra tu restaurante
            </span>
          </button>

          {/* Acceso Mozos */}
          <button
            onClick={() => navigate('/mozo/login')}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 min-h-[200px]"
          >
            <div className="bg-white/20 p-4 rounded-full">
              <Utensils size={48} />
            </div>
            <span className="text-xl">Acceso Mozos</span>
            <span className="text-sm text-white/80 text-center">
              Panel de meseros
            </span>
          </button>

          {/* Acceso Clientes */}
          <button
            onClick={() => navigate('/clientes/login')}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 min-h-[200px]"
          >
            <div className="bg-white/20 p-4 rounded-full">
              <ShoppingBag size={48} />
            </div>
            <span className="text-xl">Acceso Clientes</span>
            <span className="text-sm text-white/80 text-center">
              Realiza tu pedido
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
