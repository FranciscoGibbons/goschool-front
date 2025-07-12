"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DocumentIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface SubjectMessage {
  id: number;
  subject_id: number;
  title: string;
  content: string;
  type: "message" | "file";
  file_url?: string;
  created_at: string;
}

interface SubjectMessagesProps {
  subjectId: number;
  subjectName: string;
}

export default function SubjectMessages({
  subjectId,
  subjectName,
}: SubjectMessagesProps) {
  const [messages, setMessages] = useState<SubjectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        console.log("Fetching messages for subject:", subjectId);
        const res = await axios.get(
          `http://localhost:8080/api/v1/subject_messages/?subject_id=${subjectId}`,
          {
            withCredentials: true,
          }
        );
        console.log("Messages from API for subject 1:", res.data);
        console.log(
          "Messages details:",
          res.data.map((m) => ({
            id: m.id,
            type: m.type,
            file_url: m.file_url,
            title: m.title,
          }))
        );
        setMessages(res.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [subjectId]);

  const getIcon = (type: string) => {
    switch (type) {
      case "file":
        return <DocumentIcon className="size-5" />;
      case "message":
        return <ChatBubbleLeftIcon className="size-5" />;
      default:
        return <ChatBubbleLeftIcon className="size-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando mensajes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Mensajes de {subjectName}
        </h2>
      </div>

      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <Card
              key={`${message.id}-${message.created_at}-${index}`}
              className={
                `hover:shadow-md transition-shadow border-2 ` +
                (message.type === "file"
                  ? "border-blue-300"
                  : "border-green-300")
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getIcon(message.type)}
                  <span>{message.title}</span>
                  <span
                    className={
                      "ml-2 px-2 py-0.5 rounded text-xs font-semibold " +
                      (message.type === "file"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800")
                    }
                  >
                    {message.type === "file" ? "Archivo" : "Mensaje"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  {message.type !== "file" && message.content}
                </p>

                {message.type === "file" &&
                  (message.file_url ||
                    (message.content &&
                      message.content.startsWith("http"))) && (
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowDownTrayIcon className="size-4 text-blue-700" />
                      <a
                        href={message.file_url || message.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        download
                      >
                        Descargar archivo
                      </a>
                    </div>
                  )}

                {message.type === "file" &&
                  !message.file_url &&
                  !(message.content && message.content.startsWith("http")) && (
                    <div className="text-orange-600 text-sm mb-3">
                      ⚠️ Archivo no disponible
                    </div>
                  )}

                {message.type === "message" && (
                  <p className="text-muted-foreground mb-3">
                    {message.content}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {formatDate(message.created_at)}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No hay mensajes en esta materia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
