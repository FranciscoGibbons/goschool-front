"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/sacred";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileUpload } from "@/components/ui/profile-upload";
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

  const getRoleVariant = (role: string): "success" | "info" | "error" | "warning" | "neutral" => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'info';
      case 'student':
        return 'success';
      case 'preceptor':
        return 'warning';
      case 'father':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  if (!userInfo || !userInfo.role) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-surface-muted rounded-lg"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 bg-surface-muted rounded-lg"></div>
          <div className="h-32 bg-surface-muted rounded-lg"></div>
          <div className="h-32 bg-surface-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group">
              <ProfileUpload onUploadSuccess={handleUploadSuccess}>
                <Avatar className="h-32 w-32 cursor-pointer border-4 border-border">
                  <AvatarImage
                    src={userInfo.photo || undefined}
                    alt={userInfo.full_name || "Usuario"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-bold">
                    {getInitials(userInfo.full_name || "Usuario")}
                  </AvatarFallback>
                </Avatar>
              </ProfileUpload>
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2">
                <Camera className="h-4 w-4" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className="text-3xl font-semibold text-text-primary">
                  {userInfo.full_name || "Usuario"}
                </h2>
                <Badge
                  variant={getRoleVariant(userInfo.role)}
                  icon={getRoleIcon(userInfo.role)}
                  className="mt-2"
                >
                  {getRoleLabel(userInfo.role)}
                </Badge>
              </div>
              <p className="text-text-secondary max-w-2xl">
                Bienvenido al portal académico del Colegio Stella Maris Rosario.
                Aquí puedes gestionar tu información personal y acceder a todas las funcionalidades del sistema.
              </p>
              <div className="flex items-center justify-center md:justify-start text-sm text-text-muted">
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-surface-muted rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">Nombre Completo</p>
              <p className="text-base font-semibold text-text-primary">
                {userInfo.full_name || "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-surface-muted rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">Teléfono</p>
              <p className="text-base font-semibold text-text-primary">
                {userInfo.phone_number || "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-surface-muted rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">Dirección</p>
              <p className="text-base font-semibold text-text-primary">
                {userInfo.address || "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Birth Date Information */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-surface-muted rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              Fecha de Nacimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">Nacimiento</p>
              <p className="text-base font-semibold text-text-primary">
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
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-surface-muted rounded-lg">
                {getRoleIcon(userInfo.role)}
              </div>
              Información del Rol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge
                  variant={getRoleVariant(userInfo.role)}
                  icon={getRoleIcon(userInfo.role)}
                >
                  {getRoleLabel(userInfo.role)}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">
                Tu rol determina las funcionalidades y permisos disponibles en el sistema académico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
