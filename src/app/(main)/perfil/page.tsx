import { Suspense } from "react";
import { ProfileContent } from "./components/ProfileContent";
import { ProfileSkeleton } from "./components/ProfileSkeleton";

export default async function PerfilPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
