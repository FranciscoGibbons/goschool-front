"use client";

import { useState } from "react";

import { Role, FormsObj } from "@/utils/types";
type ActionableRole = Extract<Role, "admin" | "teacher" | "preceptor">;

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

const getActionsForRole = (role: string) => {
  switch (role) {
    case "admin":
      return ["Crear mensaje"];
    case "preceptor":
      return ["Crear mensaje"];
    case "teacher":
      return ["Crear examen"];
    default:
      return [];
  }
};

export const AddActionHandler = ({ role }: { role: ActionableRole }) => {
  const [action, setAction] = useState<keyof FormsObj | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const options = getActionsForRole(role) as Array<keyof FormsObj>; // Ensure options match FormsObj keys

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <button className="bg-blue-900 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-500 cursor-pointer">
          <PlusIcon className="size-10" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Crear tarea</DialogTitle>
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
