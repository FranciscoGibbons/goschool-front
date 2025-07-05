"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileUpload } from "@/components/ui/profile-upload";
import userInfoStore from "@/store/userInfoStore";
import { useEffect } from "react";

export function ProfileContent() {
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

  const handleUploadSuccess = () => {
    // Refresh the user info to get the new profile picture
    fetchUserInfo();
  };

  if (!userInfo || !userInfo.role) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    );
  }

  console.log("UserInfo photo:", userInfo.photo);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <ProfileUpload onUploadSuccess={handleUploadSuccess}>
          <Avatar className="h-32 w-32 cursor-pointer transition-transform hover:scale-105">
            <AvatarImage
              src={userInfo.photo || undefined}
              alt={userInfo.full_name}
            />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
              {getInitials(userInfo.full_name)}
            </AvatarFallback>
          </Avatar>
        </ProfileUpload>
        <div>
          <CardTitle className="text-2xl">{userInfo.full_name}</CardTitle>
          <p className="text-muted-foreground">{userInfo.role.toUpperCase()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Haz clic en la foto para cambiarla
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
          <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
          <p className="text-lg text-foreground">{userInfo.phone_number}</p>
        </div>
        <div className="space-y-1 md:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">Dirección</p>
          <p className="text-lg text-foreground">{userInfo.address}</p>
        </div>
      </CardContent>
    </Card>
  );
}
