import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn, Lock, User, ChefHat, ShoppingBag, Truck, Crown, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo/Logo';
import Modal from '../components/Modal/Modal';

export default function LoginPage() {
  const { t } = useLanguage();
  const [restaurantId, setRestaurantId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      showToast(t('login.requiredFields'), 'error');
      return;
    }

    // Si no hay restaurantId, verificar si es superadmin
    if (!restaurantId) {
      if (username.toLowerCase() !== 'admin') {
        showToast(t('login.requiredRestaurantId'), 'error');
        return;
      }
    } else {
      const restaurantIdNum = parseInt(restaurantId, 10);
      if (isNaN(restaurantIdNum) || restaurantIdNum <= 0) {
        showToast(t('login.invalidRestaurantId'), 'error');
        return;
      }
    }

    try {
      setLoading(true);
      const restaurantIdNum = restaurantId ? parseInt(restaurantId, 10) : null;
      await login(restaurantIdNum, username, password);
      
      // Verificar el rol del usuario después del login
      const savedUser = localStorage.getItem('admin_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Si el usuario es Employee (Mozo), rechazar el login y redirigir
        if (userData.role === 'Employee') {
          // Limpiar tokens de admin
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          showToast('Los mozos deben iniciar sesión desde la sección de mozos', 'error');
          navigate('/mozo/login');
          return;
        }
        
        // Si es SuperAdmin, redirigir a superadmin
        if (userData.role === 'SuperAdmin') {
          showToast(t('login.welcome'), 'success');
          navigate('/superadmin');
          return;
        }
        
        // Si es Admin, redirigir a admin
        if (userData.role === 'Admin') {
          showToast(t('login.welcome'), 'success');
          navigate('/admin');
          return;
        }
      }
      
      // Si no se pudo determinar el rol, redirigir a admin por defecto
      showToast(t('login.welcome'), 'success');
      navigate('/admin');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('login.error');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminButtonClick = () => {
    setIsSuperAdminModalOpen(true);
    setSuperAdminPassword('');
  };

  const handleSuperAdminLogin = async () => {
    // Validar contraseña
    if (superAdminPassword !== 'adminadmin88') {
      showToast('Contraseña incorrecta', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(null, 'admin', 'password123');
      showToast(t('login.welcomeSuperAdmin'), 'success');
      setIsSuperAdminModalOpen(false);
      setSuperAdminPassword('');
      navigate('/superadmin');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('login.error');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Fondo azul que cubre toda la pantalla */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(5,8,46,1)] via-[rgba(15,25,80,1)] to-[rgba(5,8,46,1)] z-0">
        {/* Logo de fondo izquierdo - Grande y detrás de todo */}
        <div className="absolute inset-0 lg:w-1/2 flex items-center justify-center">
          <Logo showText={false} height={400} className="opacity-25" />
        </div>
      </div>

      {/* Panel izquierdo - Decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        
        {/* Contenido decorativo */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white max-w-lg mx-auto w-full">
          <div className="mb-8">
            <Logo showText={true} height={100} />
          </div>
          
          {/* Iconos decorativos */}
          <div className="grid grid-cols-3 gap-6 mt-8 w-full">
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <ChefHat size={32} className="mb-2" />
              <span className="text-sm">{t('nav.kitchen')}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <ShoppingBag size={32} className="mb-2" />
              <span className="text-sm">{t('orders.title')}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Truck size={32} className="mb-2" />
              <span className="text-sm">{t('nav.deliveryPersons')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-transparent relative z-20 rounded-[8rem] lg:rounded-l-[8rem] lg:rounded-r-none m-4 lg:m-0 lg:ml-0">
        {/* Logo de fondo - Grande y detrás de todo */}
        <div className="absolute inset-0 flex items-center justify-center z-0 bg-gray-600 rounded-[8rem] lg:rounded-l-[8rem] lg:rounded-r-none shadow-[0px_0px_0px_0px_rgba(0,0,0,0)] overflow-hidden">
          <Logo showText={false} height={400} className="opacity-10" />
        </div>
        
        <div className="w-full max-w-md relative z-10 p-6">
          {/* Logo móvil */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo showText={true} height={64} />
          </div>

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center" style={{ color: 'var(--tw-ring-offset-color)' }}>{t('login.title')}</h1>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Restaurante */}
            <div>
              <label htmlFor="restaurantId" className="block text-sm font-semibold text-white mb-2">
                {t('login.restaurantId')} <span className="text-gray-400 text-xs">({t('common.optional')} {t('login.superAdminLogin')})</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="restaurantId"
                  type="number"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder={t('login.restaurantId')}
                  autoComplete="off"
                  disabled={loading}
                  min="1"
                />
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-white mb-2">
                {t('login.username')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder={t('login.username')}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                {t('login.password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder={t('login.password')}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  <span>{t('login.login')}</span>
                </>
              )}
            </button>
          </form>

          {/* Botón SuperAdmin */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSuperAdminButtonClick}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all font-semibold text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Crown size={18} />
              <span>{t('login.superAdminLogin')}</span>
            </button>
          </div>

          {/* Link a Login de Mozo */}
          <div className="mt-4">
            <Link
              to="/mozo/login"
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Utensils size={18} />
              <span>Acceso Mozos</span>
            </Link>
          </div>

          {/* Link a Login de Clientes */}
          <div className="mt-4">
            <Link
              to="/clientes/login"
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag size={18} />
              <span>Acceso Clientes</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500" style={{ color: 'var(--tw-ring-offset-color)' }}>
              Sistema de gestión RiDi Express
            </p>
          </div>
        </div>
      </div>

      {/* Modal de SuperAdmin */}
      <Modal
        isOpen={isSuperAdminModalOpen}
        onClose={() => {
          setIsSuperAdminModalOpen(false);
          setSuperAdminPassword('');
        }}
        title="Acceso SuperAdmin"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="superAdminPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña de SuperAdmin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                id="superAdminPassword"
                type="password"
                value={superAdminPassword}
                onChange={(e) => setSuperAdminPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSuperAdminLogin();
                  }
                }}
                className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ingresa la contraseña"
                autoFocus
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsSuperAdminModalOpen(false);
                setSuperAdminPassword('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSuperAdminLogin}
              disabled={loading || !superAdminPassword}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Crown size={18} />
                  <span>Acceder</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

