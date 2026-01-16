"use client";

import { Suspense } from "react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ProfileContent } from "./components/ProfileContent";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import "./perfil.css";

export default function PerfilPage() {
  return (
    <ProtectedPage>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Informacion personal y detalles de cuenta</p>
        </div>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
        </Suspense>
      </div>
    </ProtectedPage>
  );
}
