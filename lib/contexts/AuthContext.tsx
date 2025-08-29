"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";
import { ADMIN_EMAILS } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  authLoading: boolean; 
  adminLoading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsAdmin(false);
      setAuthLoading(false);

      if (user && ADMIN_EMAILS.includes(user.email || "")) {
        setAdminLoading(true);
        // Crear sesión en el servidor
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          });
          if (response.ok) {
            console.log("✅ Sesión creada exitosamente");
            setIsAdmin(true);
          }
        } catch (error) {
          console.error("❌ Error creando sesión:", error);
        }
       finally {
          setAdminLoading(false); 
        }
      } else {
        setAdminLoading(false); 
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Verificar si el usuario es administrador
      if (!ADMIN_EMAILS.includes(result.user.email || "")) {
        setIsAdmin(false);
        return;
      }  

    } catch (error) {
      console.error("❌ Error durante el login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Eliminar sesión del servidor
      await fetch("/api/auth/session", {
        method: "DELETE",
      });

      // Cerrar sesión en el cliente
      await signOut(auth);
      setIsAdmin(false);
      console.log("✅ Logout exitoso");
    } catch (error) {
      console.error("❌ Error durante el logout:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        adminLoading,
        isAdmin,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
