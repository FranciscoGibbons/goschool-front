"use client";

import { useState } from "react";
import { Role, FormsObj } from "@/utils/types";
import { Button } from "@/components/sacred";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  NativeSelect,
  FormGroup,
  Label,
} from "@/components/sacred";
import {
  CreateMessageForm,
  CreateExamForm,
  CreateGradeForm,
  CreateSubjectMessageForm,
  CreateSanctionForm,
  CreateAttendanceForm,
} from "./forms";

type ActionableRole = Extract<Role, "admin" | "teacher" | "preceptor">;

const getActionsForRole = (role: ActionableRole) => {
  switch (role) {
    case "admin":
      return ["Crear mensaje", "Crear examen", "Crear conducta", "Crear asistencia"] as Array<keyof FormsObj>;
    case "preceptor":
      return ["Crear mensaje", "Crear conducta", "Crear asistencia"] as Array<keyof FormsObj>;
    case "teacher":
      return ["Crear examen", "Cargar calificación", "Crear mensaje de materia"] as Array<keyof FormsObj>;
    default:
      return [];
  }
};

const ACTION_DESCRIPTIONS: Record<keyof FormsObj, string> = {
  "Crear mensaje": "Enviar un mensaje a cursos",
  "Crear examen": "Programar una evaluacion",
  "Cargar calificación": "Registrar una nota",
  "Crear mensaje de materia": "Mensaje para una materia",
  "Crear conducta": "Registrar sancion disciplinaria",
  "Crear asistencia": "Tomar asistencia de un curso",
};

function ActionFormRouter({
  action,
  onBack,
  onClose,
}: {
  action: keyof FormsObj;
  onBack: () => void;
  onClose: () => void;
}) {
  switch (action) {
    case "Crear mensaje":
      return <CreateMessageForm onBack={onBack} onClose={onClose} />;
    case "Crear examen":
      return <CreateExamForm onBack={onBack} onClose={onClose} />;
    case "Cargar calificación":
      return <CreateGradeForm onBack={onBack} onClose={onClose} />;
    case "Crear mensaje de materia":
      return <CreateSubjectMessageForm onBack={onBack} onClose={onClose} />;
    case "Crear conducta":
      return <CreateSanctionForm onBack={onBack} onClose={onClose} />;
    case "Crear asistencia":
      return <CreateAttendanceForm onBack={onBack} onClose={onClose} />;
    default:
      return null;
  }
}

export const AddActionHandler = ({ role }: { role: ActionableRole }) => {
  const [action, setAction] = useState<keyof FormsObj | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const options = getActionsForRole(role);

  const handleClose = () => {
    setAction(null);
    setModalOpen(false);
  };

  return (
    <>
      <Button
        className="rounded-full w-16 h-16 flex items-center justify-center"
        onClick={() => setModalOpen(true)}
      >
        <span className="text-4xl font-light leading-none pb-1">+</span>
      </Button>

      <Modal open={modalOpen} onOpenChange={(open) => { if (!open) handleClose(); else setModalOpen(true); }}>
        <ModalContent className={action ? "max-w-lg max-h-[85vh] overflow-y-auto" : "max-w-sm"}>
          <ModalHeader>
            <ModalTitle>{action || "Crear tarea"}</ModalTitle>
            <ModalDescription>
              {action ? ACTION_DESCRIPTIONS[action] : "Selecciona que deseas crear"}
            </ModalDescription>
          </ModalHeader>

          {!action ? (
            <FormGroup>
              <Label>Accion</Label>
              <NativeSelect
                value=""
                onChange={(e) => {
                  if (e.target.value) setAction(e.target.value as keyof FormsObj);
                }}
              >
                <option value="" disabled>Elegi que hacer</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </NativeSelect>
            </FormGroup>
          ) : (
            <ActionFormRouter action={action} onBack={() => setAction(null)} onClose={handleClose} />
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export { ActionFormRouter };
export default AddActionHandler;
