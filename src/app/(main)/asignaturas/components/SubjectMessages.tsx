"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DocumentIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";

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

function groupMessagesByDate(messages: SubjectMessage[]) {
  return messages.reduce((groups: Record<string, SubjectMessage[]>, msg) => {
    const date = new Date(msg.created_at);
    // Solo la fecha, sin hora
    const key = date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
    return groups;
  }, {});
}

function formatDateHeader(dateString: string) {
  // dateString viene en formato dd/mm/yyyy
  const [day, month, year] = dateString.split("/");
  const date = new Date(`${year}-${month}-${day}`);
  // Ejemplo: Lunes, 16/06/2025
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function SubjectMessages({ subjectId }: SubjectMessagesProps) {
  const [messages, setMessages] = useState<SubjectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/v1/subject_messages/?subject_id=${subjectId}`,
          { withCredentials: true }
        );
        setMessages(res.data);
      } catch (error) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [subjectId]);

  const grouped = groupMessagesByDate(
    messages.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  );
  const dateKeys = Object.keys(grouped).sort((a, b) => {
    // Orden descendente (más reciente primero)
    const [da, ma, ya] = a.split("/");
    const [db, mb, yb] = b.split("/");
    return (
      new Date(`${yb}-${mb}-${db}`).getTime() -
      new Date(`${ya}-${ma}-${da}`).getTime()
    );
  });

  const getIconBg = (type: string) =>
    type === "file"
      ? "bg-blue-100 text-blue-600 border-blue-300"
      : "bg-green-100 text-green-600 border-green-300";
  const getIcon = (type: string) =>
    type === "file" ? (
      <DocumentIcon className="w-6 h-6" />
    ) : (
      <ChatBubbleLeftIcon className="w-6 h-6" />
    );
  const getLabel = (type: string) => (type === "file" ? "Archivo" : "Mensaje");
  const getLabelBg = (type: string) =>
    type === "file"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDownloadUrl = (message: SubjectMessage) => {
    return (
      message.file_url ||
      (message.content && message.content.startsWith("http")
        ? message.content
        : null)
    );
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando mensajes...</div>;
  }

  return (
    <div className="space-y-8">
      {dateKeys.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <EmptyStateSVG className="w-96 h-72 mb-4 opacity-80" />
          <span className="text-muted-foreground text-lg opacity-60">
            No hay mensajes en esta materia
          </span>
        </div>
      )}
      {dateKeys.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
            <span>{formatDateHeader(dateKey)}</span>
          </div>
          {grouped[dateKey].map((message, idx) => (
            <div key={message.id} className="flex items-start gap-3">
              {/* Icono lateral */}
              <div
                className={clsx(
                  "flex-shrink-0 rounded-full border-2 p-2 mt-2",
                  getIconBg(message.type)
                )}
              >
                {getIcon(message.type)}
              </div>
              {/* Burbuja */}
              <div className="flex-1">
                <div className="rounded-xl border border-border bg-card shadow-sm px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground text-base">
                      {message.title}
                    </span>
                    <span
                      className={clsx(
                        "ml-2 px-2 py-0.5 rounded text-xs font-semibold",
                        getLabelBg(message.type)
                      )}
                    >
                      {getLabel(message.type)}
                    </span>
                  </div>
                  {message.type === "message" && (
                    <p className="text-muted-foreground mb-2 whitespace-pre-line">
                      {message.content}
                    </p>
                  )}
                  {message.type === "file" && (
                    <>
                      {message.content &&
                        !message.content.startsWith("http") && (
                          <p className="text-muted-foreground mb-2 whitespace-pre-line">
                            {message.content}
                          </p>
                        )}
                      {getDownloadUrl(message) ? (
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() =>
                              handleDownload(
                                getDownloadUrl(message)!,
                                message.title
                              )
                            }
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <ArrowDownTrayIcon className="size-4" />
                            {message.title}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600 text-sm mb-2">
                          <span>⚠️</span>
                          <span>Archivo no disponible</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
