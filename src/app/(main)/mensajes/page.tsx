"use client";


import { ProtectedPage } from "@/components/ProtectedPage";
import MessageList from "./components/MessageList";

export default function Mensajes() {
  return (
    <ProtectedPage>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Mensajes</h1>
          <p className="page-subtitle">Comunicacion con la comunidad educativa</p>
        </div>
        <MessageList />
      </div>
    </ProtectedPage>
  );
}
