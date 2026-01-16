"use client";

import { Suspense } from 'react';
import "./dashboard-no-scroll.css";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import userInfoStore from "@/store/userInfoStore";
import DashAdminPreceptorTeacher from "./components/adm_pre_tea/DashAdminPreceptorTeacher";
import DashStudentFather from "./components/stu_fat/DashStudentFather";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Dashboard() {
  const { isLoading } = useAuthRedirect();
  const { userInfo } = userInfoStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!userInfo?.role) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (userInfo.role === "admin" || userInfo.role === "preceptor" || userInfo.role === "teacher") {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <DashAdminPreceptorTeacher role={userInfo.role} />
      </Suspense>
    );
  }

  if (userInfo.role === "student" || userInfo.role === "father") {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <DashStudentFather />
      </Suspense>
    );
  }

  // Fallback for unknown roles
  return (
    <div className="py-12">
      <div className="text-center">
        <h1 className="heading-2 mb-4">Rol no reconocido</h1>
        <p className="body-text text-muted-foreground">
          Por favor contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}
