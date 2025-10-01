"use client";

import { Suspense } from "react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ProfileContent } from "./components/ProfileContent";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import { User } from "lucide-react";
import "./perfil.css";

export default function PerfilPage() {
  return (
    <ProtectedPage>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="icon-wrapper">
                <User className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Mi Perfil
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Gestiona tu información personal y visualiza los detalles de tu cuenta en el sistema académico del Colegio Stella Maris Rosario.
            </p>
          </div>
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileContent />
          </Suspense>
        </div>
      </div>
    </ProtectedPage>
  );
}
