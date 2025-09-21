"use client";

import { AddActionHandler } from "./AddActionHandler";
import userInfoStore from "@/store/userInfoStore";
import { Role } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";

type ActionableRole = Extract<Role, "admin" | "teacher" | "preceptor">;

const DashAdminPreceptorTeacher = ({ role }: { role: ActionableRole }) => {
  const { userInfo } = userInfoStore();

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Buenos días";
    if (hours < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getUserDisplayName = () => {
    if (!userInfo) return "Usuario";
    
    if (userInfo.name && userInfo.last_name) {
      return `${userInfo.name} ${userInfo.last_name}`;
    }
    
    return userInfo.full_name || "Usuario";
  };

  const getRoleLabel = (userRole: ActionableRole) => {
    const roleLabels = {
      admin: "Administrador",
      teacher: "Profesor",
      preceptor: "Preceptor"
    };
    return roleLabels[userRole];
  };

  return (
    <div className="space-y-8">
      {/* Header de bienvenida */}
      <div className="space-y-4">
        <div>
          <h1 className="heading-1">
            {getGreeting()}, {getUserDisplayName()}
          </h1>
          <p className="body-text text-muted-foreground mt-2">
            Bienvenido al panel de {getRoleLabel(role)} de GoSchool
          </p>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="heading-3 text-primary">Panel de Control</h2>
                <p className="body-small text-muted-foreground mt-1">
                  Gestiona el sistema académico desde aquí
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="text-4xl opacity-20">📚</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de acción flotante */}
      <div className="fixed right-6 bottom-6 z-50">
        <AddActionHandler role={role} />
      </div>
    </div>
  );
};

export default DashAdminPreceptorTeacher;
