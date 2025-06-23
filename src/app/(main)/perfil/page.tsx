"use client";

import userInfoStore from "@/store/userInfoStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export default function PerfilPage() {
  const { userInfo, fetchUserInfo } = userInfoStore();

  useEffect(() => {
    if (!userInfo || !userInfo.role) {
      fetchUserInfo();
    }
  }, [userInfo, fetchUserInfo]);

  const getInitials = (name: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (!userInfo || !userInfo.role) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 w-1/4 bg-muted rounded mb-6"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userInfo.photo || ""} alt={userInfo.full_name} />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
              {getInitials(userInfo.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{userInfo.full_name}</CardTitle>
            <p className="text-muted-foreground">
              {userInfo.role.toUpperCase()}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Nombre Completo
            </p>
            <p className="text-lg text-foreground">{userInfo.full_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Rol</p>
            <p className="text-lg text-foreground">{userInfo.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Fecha de Nacimiento
            </p>
            <p className="text-lg text-foreground">
              {new Date(userInfo.birth_date).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Teléfono
            </p>
            <p className="text-lg text-foreground">{userInfo.phone_number}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">
              Dirección
            </p>
            <p className="text-lg text-foreground">{userInfo.address}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
