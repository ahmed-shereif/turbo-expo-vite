import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { type ReactNode } from 'react';
import type { Role, User } from '@repo/auth-client';
import { auth, AuthClientError } from '../lib/authClient';

type AuthState = {
  user: User | null;
  isBootstrapping: boolean;
  login(email: string, password: string): Promise<void>;
  signup(
    name: string,
    email: string,
    phone: string,
    password: string,
    role: Role,
  ): Promise<void>;
  logout(): Promise<void>;
  hasRole(...roles: Role[]): boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await auth.refresh();
        const me = await auth.me();
        setUser(me);
      } catch (error) {
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    await auth.login({ email, password });
    const me = await auth.me();
    setUser(me);
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: Role,
  ) => {
    await auth.signup({ name, email, phone, password, role });
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => {
    if (!user || !user.roles) return false;
    return user.roles.some((role) => roles.includes(role));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isBootstrapping,
        login,
        signup,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthClientError };
