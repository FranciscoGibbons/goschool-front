"use client";

import { CalendarClock } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import userInfoStore from "@/store/userInfoStore";
import TeacherAvailabilityView from "./components/TeacherAvailabilityView";
import ParentBookingView from "./components/ParentBookingView";

function TurnosContent() {
  const { userInfo } = userInfoStore();

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Student/preceptor blocked
  if (userInfo.role === "student" || userInfo.role === "preceptor") {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Turnos para reuniones</h1>
        </div>
        <div className="sacred-card text-center py-8">
          <CalendarClock className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Acceso restringido</p>
          <p className="text-sm text-text-secondary mt-1">
            Esta funcionalidad es para docentes y padres
          </p>
        </div>
      </div>
    );
  }

  // Teacher/admin view
  if (userInfo.role === "teacher" || userInfo.role === "admin") {
    return <TeacherAvailabilityView />;
  }

  // Father view
  if (userInfo.role === "father") {
    return <ParentBookingView />;
  }

  return null;
}

export default function Turnos() {
  return (
    <ProtectedPage>
      <TurnosContent />
    </ProtectedPage>
  );
}
