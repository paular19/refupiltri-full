"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import LogoGoogle from "@/components/ui/logoGoogle";

export default function AdminLoginPage() {
  const { user, loading, isAdmin, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya está logueado como admin, redirigir al panel
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push("/admin");
    }
  }, [user, isAdmin, loading, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);

    try {
      await signInWithGoogle();
      // El useEffect se encarga de la redirección
    } catch (error: any) {
      console.error("Error en login:", error);
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h2>
          <p className="text-gray-600">
            Inicia sesión con tu cuenta autorizada
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoggingIn ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </>
          ) : (
            <>
              <LogoGoogle />
              Continuar con Google
            </>
          )}
        </button>

        <div className="text-center text-sm text-gray-500">
          Solo usuarios autorizados pueden acceder
        </div>
      </div>
    </div>
  );
}
