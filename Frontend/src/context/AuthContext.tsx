import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authAPI } from "../services/api";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("leo_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem("leo_token");
      if (stored) {
        try {
          const res = await authAPI.me();
          setUser(res.data.user);
          setToken(stored);
        } catch {
          localStorage.removeItem("leo_token");
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem("leo_token", jwt);
    setToken(jwt);
    setUser(userData);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await authAPI.register(email, password, name);
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem("leo_token", jwt);
    setToken(jwt);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("leo_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
