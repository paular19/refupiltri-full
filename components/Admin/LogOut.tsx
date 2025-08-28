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
    <Button variant="outline" color="primary" onClick={handleLogout}>
      salir
    </Button>
  );
};
