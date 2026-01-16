"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";



// Make a log out button bg-blue-900

export default function LogOut() {
  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      await axios.post(`${apiUrl}/api/v1/logout`, {}, {
        withCredentials: true,
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error de red al cerrar sesión:", error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
    >
      <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
      Cerrar Sesión
    </Button>
  );
}
