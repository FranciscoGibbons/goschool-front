"use client";

import { ProtectedPage } from "@/components/ProtectedPage";
import MessageList from "./components/MessageList";

export default function Mensajes() {
  return (
    <ProtectedPage>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Mensajes</h1>
        <MessageList />
      </div>
    </ProtectedPage>
  );
}
