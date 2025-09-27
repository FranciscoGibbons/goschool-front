"use client";

import { Suspense } from "react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ProfileContent } from "./components/ProfileContent";
import { ProfileSkeleton } from "./components/ProfileSkeleton";

export default function PerfilPage() {
  return (
    <ProtectedPage>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
        </Suspense>
      </div>
    </ProtectedPage>
  );
}
