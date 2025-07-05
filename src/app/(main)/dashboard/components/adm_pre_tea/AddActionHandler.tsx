"use client";

import { useState } from "react";

import { Role, FormsObj } from "@/utils/types";

import { PlusIcon } from "@heroicons/react/24/outline";
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
      return ["Crear mensaje", "Crear examen"] as Array<keyof FormsObj>;
    case "preceptor":
      return ["Crear mensaje"] as Array<keyof FormsObj>;
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
        <button className="bg-blue-900 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-500 cursor-pointer">
          <PlusIcon className="size-10" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
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
