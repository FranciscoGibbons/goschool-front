"use client";

import DashAdminPreceptorTeacher from "./components/adm_pre_tea/DashAdminPreceptorTeacher";
import DashStudentFather from "./components/stu_fat/DashStudentFather";
import { PlusIcon } from "@heroicons/react/24/outline";
import userInfoStore from "@/store/userInfoStore";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Dashboard() {
  const { userInfo } = userInfoStore();
  const { isLoading } = useAuthRedirect();

  // El hook useAuthRedirect ya maneja la redirección si no está autenticado

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userInfo?.role === "admin" || userInfo?.role === "preceptor" || userInfo?.role === "teacher") {
    return <DashAdminPreceptorTeacher role={userInfo.role} />;
  }

  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return <DashStudentFather />;
  }

  return (
    <>
      <div className="absolute right-10 bottom-10">
        <button className="bg-blue-900 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-500 cursor-pointer">
          <PlusIcon className="size-10" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
