import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type User = {
  email: string;
  name?: string;
} | null;

interface AuthContextType {
  isAuthenticated: boolean;
  user: User;
  login: (email: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const isAuthenticated =
    localStorage?.getItem("trip-harmonizer-current-user-token")?.length > 0
      ? true
      : false;

  const login = (email: string, name: string) => {
    setCurrentUser({ email, name });
  };

  const logout = () => {
    localStorage.removeItem("trip-harmonizer-current-user-token");

    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
