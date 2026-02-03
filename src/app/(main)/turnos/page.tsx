"use client";

import { useState } from "react";
import { Plus, CalendarClock } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import userInfoStore from "@/store/userInfoStore";
import MeetingRequestsList from "./components/MeetingRequestsList";
import MeetingRequestForm from "./components/MeetingRequestForm";

function ReunionesContent() {
  const { userInfo } = userInfoStore();
  const [showForm, setShowForm] = useState(false);

  const canCreate = userInfo?.role !== "student";

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (userInfo.role === "student") {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Reuniones</h1>
        </div>
        <div className="sacred-card text-center py-8">
          <CalendarClock className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Acceso restringido</p>
          <p className="text-sm text-text-secondary mt-1">
            Esta funcionalidad no esta disponible para estudiantes
          </p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return <MeetingRequestForm onClose={() => setShowForm(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Reuniones</h1>
            <p className="page-subtitle">Solicitudes de reunion</p>
          </div>
          {canCreate && (
            <Button variant="default" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva solicitud
            </Button>
          )}
        </div>
      </div>

      <MeetingRequestsList userId={userInfo.id} />
    </div>
  );
}

export default function Turnos() {
  return (
    <ProtectedPage>
      <ReunionesContent />
    </ProtectedPage>
  );
}
