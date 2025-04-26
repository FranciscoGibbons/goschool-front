import { AddActionHandler } from "./AddActionHandler";

import { Role } from "@/utils/types";
type ActionableRole = Extract<Role, "admin" | "teacher" | "preceptor">;

const DashAdminPreceptorTeacher = ({ role }: { role: ActionableRole }) => {
  return (
    <div className="absolute right-10 bottom-10">
      <AddActionHandler role={role} />
    </div>
  );
};

export default DashAdminPreceptorTeacher;
