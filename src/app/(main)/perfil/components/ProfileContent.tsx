"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileUpload } from "@/components/ui/profile-upload";
import { Badge } from "@/components/ui/badge";
import userInfoStore from "@/store/userInfoStore";
import { useEffect } from "react";
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Camera,
  GraduationCap,
  Users,
  BookOpen,
  UserCheck
} from "lucide-react";

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
    fetchUserInfo();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'teacher':
        return <GraduationCap className="h-5 w-5" />;
      case 'student':
        return <BookOpen className="h-5 w-5" />;
      case 'preceptor':
        return <UserCheck className="h-5 w-5" />;
      case 'father':
        return <Users className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'teacher':
        return 'Profesor';
      case 'student':
        return 'Estudiante';
      case 'preceptor':
        return 'Preceptor';
      case 'father':
        return 'Padre/Madre';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800';
      case 'teacher':
        return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800';
      case 'student':
        return 'bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800';
      case 'preceptor':
        return 'bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400 dark:border-purple-800';
      case 'father':
        return 'bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400 dark:border-orange-800';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200 dark:text-gray-400 dark:border-gray-800';
    }
  };

  if (!userInfo || !userInfo.role) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-muted rounded-xl"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Profile Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group">
              <ProfileUpload onUploadSuccess={handleUploadSuccess}>
                <Avatar className="h-32 w-32 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 border-background shadow-xl">
                  <AvatarImage
                    src={userInfo.photo || undefined}
                    alt={userInfo.full_name || "Usuario"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                    {getInitials(userInfo.full_name || "Usuario")}
                  </AvatarFallback>
                </Avatar>
              </ProfileUpload>
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {userInfo.full_name || "Usuario"}
                </h2>
                <Badge 
                  variant="outline" 
                  className={`mt-2 ${getRoleColor(userInfo.role)} border-2`}
                >
                  {getRoleIcon(userInfo.role)}
                  <span className="ml-2 font-semibold">
                    {getRoleLabel(userInfo.role)}
                  </span>
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Bienvenido al portal académico del Colegio Stella Maris Rosario. 
                Aquí puedes gestionar tu información personal y acceder a todas las funcionalidades del sistema.
              </p>
              <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground">
                <Camera className="h-4 w-4 mr-2" />
                <span>Haz clic en tu foto de perfil para cambiarla</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
              <p className="text-base font-semibold">
                {userInfo.full_name || "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p className="text-base font-semibold">
                {userInfo.phone_number || "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Dirección</p>
              <p className="text-base font-semibold">
                {userInfo.address || "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Birth Date Information */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              Fecha de Nacimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Nacimiento</p>
              <p className="text-base font-semibold">
                {userInfo.birth_date 
                  ? new Date(userInfo.birth_date).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role Information - Spans remaining columns */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                {getRoleIcon(userInfo.role)}
              </div>
              Información del Rol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`${getRoleColor(userInfo.role)} border-2 px-3 py-1`}
                >
                  {getRoleIcon(userInfo.role)}
                  <span className="ml-2 font-semibold">
                    {getRoleLabel(userInfo.role)}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu rol determina las funcionalidades y permisos disponibles en el sistema académico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
