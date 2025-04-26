"use client";
import { Button } from "@/components/ui/button";

// Make a log out button bg-blue-900

export default function LogOut() {
  const handleLogout = async () => {
    const res = await fetch("http://localhost:8080/api/v1/logout/", {
      method: "POST",
      credentials: "include",
    });

    if (res.status === 200) {
      window.location.href = "/login";
    } else {
      console.error("Error al cerrar sesión");
    }
  };
  return (
    <Button
      variant="destructive"
      className="w-full bg-blue-900 hover:bg-blue-700 cursor-pointer"
      onClick={handleLogout}
    >
      Cerrar sesión
    </Button>
  );
}
