"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import MessageList from "./components/MessageList";
import userInfoStore from "@/store/userInfoStore";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/sacred";
import { CreateMessageForm } from "../dashboard/components/adm_pre_tea/forms";

function MensajesContent() {
  const { userInfo } = userInfoStore();
  const [createOpen, setCreateOpen] = useState(false);

  const canCreate = userInfo?.role === "admin" || userInfo?.role === "preceptor";

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Mensajes</h1>
            <p className="page-subtitle">Comunicacion con la comunidad educativa</p>
          </div>
          {canCreate && (
            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nuevo Mensaje
            </Button>
          )}
        </div>
      </div>
      <MessageList />

      {/* Create Message Modal */}
      <Modal open={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Crear mensaje</ModalTitle>
            <ModalDescription>Enviar un mensaje a cursos</ModalDescription>
          </ModalHeader>
          <CreateMessageForm
            onBack={() => setCreateOpen(false)}
            onClose={() => {
              setCreateOpen(false);
              window.location.reload();
            }}
          />
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function Mensajes() {
  return (
    <ProtectedPage>
      <MensajesContent />
    </ProtectedPage>
  );
}
