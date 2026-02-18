import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  restaurantId: number | null;
  restaurantName?: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (restaurantIdentifier: string | null, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar token y usuario del localStorage al iniciar
    // Buscar primero admin_token, luego waiter_token
    const loadAuth = () => {
      const savedToken = localStorage.getItem('admin_token') || localStorage.getItem('waiter_token');
      const savedUser = localStorage.getItem('admin_user') || localStorage.getItem('waiter_user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error al parsear usuario guardado:', e);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          localStorage.removeItem('waiter_token');
          localStorage.removeItem('waiter_user');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
    };

    loadAuth();
    setLoading(false);

    // Escuchar cambios en localStorage (entre pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_token' || e.key === 'waiter_token' || 
          e.key === 'admin_user' || e.key === 'waiter_user') {
        loadAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Escuchar eventos personalizados para cambios en la misma pestaña
    const handleAuthChange = () => {
      loadAuth();
    };

    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const login = async (restaurantIdentifier: string | null, username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          restaurantIdentifier: restaurantIdentifier || undefined, 
          username, 
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      // Verificar que el usuario no sea Employee (Mozo)
      if (data.user?.role === 'Employee') {
        throw new Error('Los mozos deben iniciar sesión desde la sección de mozos');
      }
      
      setToken(data.token);
      setUser(data.user);
      
      // Guardar en localStorage y limpiar tokens de mozo si existen
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      localStorage.removeItem('waiter_token');
      localStorage.removeItem('waiter_user');
      
      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new Event('auth-changed'));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('waiter_token');
    localStorage.removeItem('waiter_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

