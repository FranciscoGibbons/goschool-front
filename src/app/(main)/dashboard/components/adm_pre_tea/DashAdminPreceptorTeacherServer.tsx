import { getServerPersonalData } from "@/lib/server-fetch";
import { AddActionHandler } from "./AddActionHandler";
import { Role } from "@/utils/types";

type ActionableRole = Extract<Role, "admin" | "teacher" | "preceptor">;

interface Props {
  role: ActionableRole;
}

export async function DashAdminPreceptorTeacherServer({ role }: Props) {
  // Fetch user data on server side
  const userData = await getServerPersonalData().catch(() => null);
  
  const displayName = userData 
    ? userData.name && userData.last_name
      ? `${userData.name} ${userData.last_name}`
      : userData.full_name || "Usuario"
    : "Usuario";

  return (
    <div className="relative h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Bienvenido, {displayName}
        </h1>
        <p className="text-muted-foreground">
          Panel de administración - {role}
        </p>
      </div>
      
      <div className="absolute right-10 bottom-10 flex flex-col items-end space-y-2">
        <AddActionHandler role={role} />
      </div>
    </div>
  );
}