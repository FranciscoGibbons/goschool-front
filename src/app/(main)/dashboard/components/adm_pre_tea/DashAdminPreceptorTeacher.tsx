"use client";

import { AddActionHandler } from "./AddActionHandler";
import userInfoStore from "@/store/userInfoStore";
import { Role } from "@/utils/types";

type ActionableRole = Extract<Role, "admin" | "teacher" | "preceptor">;

const DashAdminPreceptorTeacher = ({ role }: { role: ActionableRole }) => {
  const { userInfo } = userInfoStore();

  return (
    <>
      <div>
        {userInfo
          ? userInfo.name && userInfo.last_name
            ? `${userInfo.name} ${userInfo.last_name}`
            : userInfo.full_name || "Usuario"
          : ""}
      </div>
      <div className="absolute right-10 bottom-10 flex flex-col items-end space-y-2">
        <AddActionHandler role={role} />
      </div>
    </>
  );
};

export default DashAdminPreceptorTeacher;
