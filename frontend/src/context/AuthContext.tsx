import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Credentiale MOCK (nu exista backend real de autentificare).
 * Doar aceasta combinatie e considerata valida.
 */
const MOCK_EMAIL = 'admin@hio.ro';
const MOCK_PASSWORD = 'password123';

/** Cheia sub care salvam sesiunea in localStorage. */
const STORAGE_KEY = 'auth';

interface User {
  email: string;
  name: string;
}

interface Session {
  user: User;
  token: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Citeste sesiunea salvata din localStorage (daca exista si e valida). */
function readStoredSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    // JSON corupt -> il ignoram
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Starea initiala se citeste O SINGURA DATA din localStorage, la incarcare.
  // Asa sesiunea "supravietuieste" unui refresh de pagina.
  const [session, setSession] = useState<Session | null>(() => readStoredSession());

  const login = async (email: string, password: string): Promise<void> => {
    // Simulam o mica intarziere de retea, ca sa vedem starea de "loading".
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (email !== MOCK_EMAIL || password !== MOCK_PASSWORD) {
      throw new Error('Email sau parola incorecte');
    }

    const newSession: Session = {
      user: { email, name: 'Vladimir' },
      token: `mock-token-${Date.now()}`,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const value: AuthContextValue = {
    user: session?.user ?? null,
    isAuthenticated: session !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook prin care orice componenta acceseaza starea de autentificare. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth trebuie folosit in interiorul unui <AuthProvider>');
  }
  return ctx;
}
