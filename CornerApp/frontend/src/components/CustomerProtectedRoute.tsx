import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

export default function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar token y usuario con un pequeño delay para asegurar que el localStorage esté actualizado
    const checkAuth = () => {
      const token = localStorage.getItem('customer_token');
      const user = localStorage.getItem('customer_user');

      console.log('CustomerProtectedRoute: Verificando autenticación', {
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0,
        pathname: window.location.pathname
      });

      if (!token || !user) {
        console.log('CustomerProtectedRoute: No hay token o usuario - redirigiendo al login');
        setIsAuthorized(false);
        return;
      }

      // Validar que el usuario sea un objeto JSON válido
      try {
        const userData = JSON.parse(user);
        console.log('CustomerProtectedRoute: Usuario parseado:', { id: userData?.id, name: userData?.name });
        
        if (!userData || !userData.id) {
          console.log('CustomerProtectedRoute: Usuario inválido - no tiene ID');
          setIsAuthorized(false);
          return;
        }
      } catch (error) {
        console.error('CustomerProtectedRoute: Error al parsear usuario:', error);
        setIsAuthorized(false);
        return;
      }

      console.log('CustomerProtectedRoute: Autenticación exitosa');
      setIsAuthorized(true);
    };

    // Ejecutar inmediatamente
    checkAuth();

    // También verificar después de un pequeño delay para casos donde el localStorage se actualiza justo antes
    const timeout = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeout);
  }, []);

  // Mostrar loading mientras se verifica
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/clientes/login" replace />;
  }

  return <>{children}</>;
}
