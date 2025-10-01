"use client";

import { Mail } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import MessageList from "./components/MessageList";

export default function Mensajes() {
  return (
    <ProtectedPage>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="icon-wrapper">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Mensajes
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Gestiona la comunicación con la comunidad educativa
            </p>
          </div>
          <MessageList />
        </div>
      </div>
    </ProtectedPage>
  );
}
