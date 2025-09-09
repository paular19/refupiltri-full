"use client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { redirect } from "next/navigation";
import { Button } from "../ui/button";

export const LogOut = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    await redirect("/");
  };
  return (
    <Button
      className="px-4 py-2 rounded"
      style={{ backgroundColor: '#f87171', color: 'white' }} 
      onClick={handleLogout}
    >
      Salir
    </Button>
  );
};
