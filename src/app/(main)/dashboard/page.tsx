import DashAdminPreceptorTeacher from "./components/adm_pre_tea/DashAdminPreceptorTeacher";

import { PlusIcon } from "@heroicons/react/24/outline";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import verifyToken from "@/utils/verifyToken";
import { Role } from "@/utils/types";
import getRole from "@/utils/getRole";

export default async function Dashboard() {
  const cookiesData = await cookies();
  const token = cookiesData.get("jwt")?.value;

  const isValidToken = await verifyToken(token || "");
  if (!isValidToken) {
    redirect("/login");
  }

  const role: Role = await getRole(token || "");

  console.log("Dashboard page role:", role);

  if (role === "admin" || role === "preceptor" || role === "teacher") {
    return <DashAdminPreceptorTeacher role={role} />;
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
