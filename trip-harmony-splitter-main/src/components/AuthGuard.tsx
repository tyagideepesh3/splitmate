import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/signup"];

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(location.pathname)) {
      navigate("/login");
    }

    if (isAuthenticated && PUBLIC_ROUTES.includes(location.pathname)) {
      navigate("/");
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthGuard;
