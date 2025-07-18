"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DocumentIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";
import userInfoStore from "@/store/userInfoStore";

interface SubjectMessage {
  id: number;
  subject_id: number;
  title: string;
  content: string;
  type: "message" | "file" | "link";
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
  const [editingMessage, setEditingMessage] = useState<SubjectMessage | null>(null);
  const [editData, setEditData] = useState<Partial<SubjectMessage>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { userInfo } = userInfoStore();

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
                  <div className="flex justify-end gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                    {userInfo?.role && ["admin", "teacher", "preceptor"].includes(userInfo.role) && (
                      <>
                        <button
                          className="p-1 bg-blue-500 text-black rounded hover:bg-blue-600 flex items-center justify-center w-7 h-7"
                          title="Editar"
                          onClick={() => {
                            setEditingMessage(message);
                            setEditData({ ...message });
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 bg-red-500 text-black rounded hover:bg-red-600 flex items-center justify-center w-7 h-7"
                          title="Borrar"
                          onClick={async () => {
                            if (!confirm("¿Seguro que quieres borrar este mensaje?")) return;
                            setDeletingId(message.id);
                            try {
                              await axios.delete(`http://localhost:8080/api/v1/subject_messages/${message.id}`, { withCredentials: true });
                              setMessages((prev) => prev.filter((m) => m.id !== message.id));
                            } catch {
                              alert("Error al borrar el mensaje");
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === message.id}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      {editingMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg w-full max-w-md text-foreground">
            <h2 className="text-lg font-bold mb-4">Editar mensaje de materia</h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const res = await axios.put(
                    `http://localhost:8080/api/v1/subject_messages/${editingMessage.id}`,
                    {
                      title: editData.title,
                      content: editData.content,
                      type: editData.type,
                    },
                    { withCredentials: true }
                  );
                  if (res.status === 200) {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === editingMessage.id ? { ...m, ...editData } : m
                      )
                    );
                    setEditingMessage(null);
                  } else {
                    alert("Error al actualizar el mensaje");
                  }
                } catch {
                  alert("Error de red al actualizar");
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editData.title || ""}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editData.type || "message"}
                  onChange={e => setEditData({ ...editData, type: e.target.value as 'message' | 'file' | 'link' })}
                  required
                >
                  <option value="message">Mensaje</option>
                  <option value="file">Archivo</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contenido</label>
                <textarea
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editData.content || ""}
                  onChange={e => setEditData({ ...editData, content: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  className="px-3 py-1 bg-red-500 text-black rounded hover:bg-red-600 flex items-center gap-1"
                  type="button"
                  onClick={() => setEditingMessage(null)}
                  disabled={isSaving}
                >
                  <TrashIcon className="w-4 h-4" /> Cancelar
                </button>
                <button
                  className="px-3 py-1 bg-blue-500 text-black rounded hover:bg-blue-600 flex items-center gap-1"
                  type="submit"
                  disabled={isSaving}
                >
                  <PencilIcon className="w-4 h-4" /> {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
