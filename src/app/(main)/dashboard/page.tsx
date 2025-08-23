import DashAdminPreceptorTeacher from "./components/adm_pre_tea/DashAdminPreceptorTeacher";
import DashStudentFather from "./components/stu_fat/DashStudentFather";

import { PlusIcon } from "@heroicons/react/24/outline";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import verifyTokenServer from "@/utils/verifyTokenServer";
import { Role } from "@/utils/types";
import getRoleServer from "@/utils/getRoleServer";

export default async function Dashboard() {
  const cookiesData = await cookies();
  const token = cookiesData.get("jwt")?.value;

  const isValidToken = await verifyTokenServer(token || "");
  
  if (!isValidToken) {
    redirect("/login");
  }

  const role: Role = await getRoleServer(token || "");

  if (role === "admin" || role === "preceptor" || role === "teacher") {
    return <DashAdminPreceptorTeacher role={role} />;
  }

  if (role === "student" || role === "father") {
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
