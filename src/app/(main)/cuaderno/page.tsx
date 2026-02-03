"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import userInfoStore from "@/store/userInfoStore";
import ObservacionesList from "./components/ObservacionesList";
import ObservacionForm from "./components/ObservacionForm";

function ObservacionesContent() {
  const { userInfo } = userInfoStore();
  const [showForm, setShowForm] = useState(false);

  const canCreate = userInfo?.role === "teacher" || userInfo?.role === "preceptor";

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showForm) {
    return <ObservacionForm onClose={() => setShowForm(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Observaciones</h1>
            <p className="page-subtitle">Observaciones sobre alumnos</p>
          </div>
          {canCreate && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              Nueva observacion
            </Button>
          )}
        </div>
      </div>

      <ObservacionesList role={userInfo.role || ""} userId={userInfo.id} />
    </div>
  );
}

export default function Cuaderno() {
  return (
    <ProtectedPage>
      <ObservacionesContent />
    </ProtectedPage>
  );
}
