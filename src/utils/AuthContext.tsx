"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ApiFetch } from '../utils/Api';
import '../i18n';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  imagenu?: string; // Foto de perfil
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  checkAuth: () => Promise<void>;
  userForgot: any; 
  setUserForgot: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 2. ¡AQUÍ ESTÁ LA LÍNEA QUE NOS FALTABA! La memoria temporal.
  const [userForgot, setUserForgot] = useState<any>(null);

  const checkAuth = async () => {
    try {
      const res = await ApiFetch.get("/me"); 
      if (res.user) {
        setUser({
          id: res.user.id,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          email: res.user.email,
          imagenu: res.user.imagenu,
          isAdmin: res.user.isAdmin
        });
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth, userForgot, setUserForgot }}> 
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};