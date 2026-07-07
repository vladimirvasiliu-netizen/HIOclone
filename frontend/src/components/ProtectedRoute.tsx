import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Invaluie o pagina protejata. Daca nu exista sesiune, redirectioneaza
 * catre /login in loc sa afiseze continutul.
 * `replace` inlocuieste intrarea din istoric, ca butonul Back sa nu te
 * intoarca pe pagina protejata dupa redirect.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
