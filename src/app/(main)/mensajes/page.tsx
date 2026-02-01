"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import MessageList from "./components/MessageList";
import userInfoStore from "@/store/userInfoStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionForm } from "../dashboard/components/adm_pre_tea/ActionForm";
import "../dashboard/dashboard-modal.css";

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
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Mensaje
            </Button>
          )}
        </div>
      </div>
      <MessageList />

      {/* Create Message Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl dashboard-modal-content">
          <DialogTitle>Crear mensaje</DialogTitle>
          <ActionForm
            action="Crear mensaje"
            onBack={() => setCreateOpen(false)}
            onClose={() => {
              setCreateOpen(false);
              window.location.reload();
            }}
          />
        </DialogContent>
      </Dialog>
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
