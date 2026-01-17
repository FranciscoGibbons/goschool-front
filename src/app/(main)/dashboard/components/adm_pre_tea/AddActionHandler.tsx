"use client";

import { useState } from "react";
import "../../dashboard-modal.css";

import { Role, FormsObj } from "@/utils/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ActionForm } from "./ActionForm";

type ActionableRole = Extract<Role, "admin" | "teacher" | "preceptor">;

const getActionsForRole = (role: ActionableRole) => {
  switch (role) {
    case "admin":
      return ["Crear mensaje", "Crear examen", "Crear conducta", "Crear asistencia"] as Array<keyof FormsObj>;
    case "preceptor":
      return ["Crear mensaje", "Crear conducta", "Crear asistencia"] as Array<keyof FormsObj>;
    case "teacher":
      return [
        "Crear examen",
        "Cargar calificación",
        "Crear mensaje de materia",
      ] as Array<keyof FormsObj>;
    default:
      return [];
  }
};

export const AddActionHandler = ({ role }: { role: ActionableRole }) => {
  const [action, setAction] = useState<keyof FormsObj | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const options = getActionsForRole(role);

  console.log("Current role:", role);
  console.log("Available options:", options);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full border border-primary w-16 h-16 pb-3.5 cursor-pointer flex justify-center"
        >
          <span className="text-4xl font-[350] leading-none">+</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl dashboard-modal-content">
        <DialogTitle>{action || "Crear tarea"}</DialogTitle>
        {!action ? (
          <Select onValueChange={(value) => setAction(value as keyof FormsObj)}>
            <SelectTrigger>
              <SelectValue placeholder="Elegí qué hacer" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <ActionForm
            action={action}
            onBack={() => setAction(null)}
            onClose={() => {
              setAction(null);
              setModalOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddActionHandler;
