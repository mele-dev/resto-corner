import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario es un mozo (Employee) - los mozos no pueden acceder a /admin
  // Verificar qué token está activo (admin_token tiene prioridad sobre waiter_token)
  const adminToken = localStorage.getItem('admin_token');
  const adminUser = localStorage.getItem('admin_user');
  const waiterToken = localStorage.getItem('waiter_token');
  const waiterUser = localStorage.getItem('waiter_user');
  
  // Determinar el usuario actual: priorizar admin_token si existe
  let currentUser = user;
  if (!currentUser) {
    if (adminToken && adminUser) {
      try {
        currentUser = JSON.parse(adminUser);
      } catch (e) {
        console.error('Error al parsear usuario de admin:', e);
      }
    } else if (waiterToken && waiterUser) {
      try {
        currentUser = JSON.parse(waiterUser);
      } catch (e) {
        console.error('Error al parsear usuario de mozo:', e);
      }
    }
  }

  // Si el usuario actual es Employee (Mozo) Y no hay admin_token activo, redirigir a /mozo/login
  // Solo redirigir si realmente es un mozo, no solo por la presencia de waiter_token
  if (currentUser?.role === 'Employee' && !adminToken) {
    // Limpiar tokens de admin si existen (por seguridad)
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return <Navigate to="/mozo/login" replace />;
  }
  
  // Si hay admin_token activo pero el usuario es Employee, algo está mal - limpiar y redirigir
  if (currentUser?.role === 'Employee' && adminToken) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return <Navigate to="/mozo/login" replace />;
  }

  return <>{children}</>;
}

