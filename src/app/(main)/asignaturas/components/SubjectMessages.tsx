"use client";

/**
 * Subject Messages Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * Uses semantic color tokens and sacred components.
 * ==========================================================================
 */

import { useState, useEffect } from "react";
import axios from "axios";
import {
  DocumentIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Button,
  Badge,
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Textarea,
  Select,
} from "@/components/sacred";
import userInfoStore from "@/store/userInfoStore";
import { SecuritySanitizer } from "@/lib/security";

interface SubjectMessage {
  id: number;
  subject_id: number;
  title: string;
  content: string;
  type: "message" | "file" | "link";
  created_at: string;
}

interface SubjectMessagesProps {
  subjectId: number;
  subjectName: string;
}

// Semantic color mapping using design tokens
const typeConfig = {
  file: {
    iconBg: "bg-primary/10 text-primary border-primary/20",
    badge: "info" as const,
    label: "Archivo",
  },
  link: {
    iconBg: "bg-primary/10 text-primary border-primary/20",
    badge: "info" as const,
    label: "Link",
  },
  message: {
    iconBg: "bg-success-muted text-success border-success/20",
    badge: "success" as const,
    label: "Mensaje",
  },
} as const;

function groupMessagesByDate(messages: SubjectMessage[]) {
  return messages.reduce((groups: Record<string, SubjectMessage[]>, msg) => {
    const date = new Date(msg.created_at);
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
  const [day, month, year] = dateString.split("/");
  const date = new Date(`${year}-${month}-${day}`);
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
  const [editData, setEditData] = useState<{
    title?: string;
    content?: string;
    type?: "message" | "file" | "link";
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { userInfo } = userInfoStore();

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesData = await axios.get(
          `/api/proxy/subject-messages/?subject_id=${subjectId}`,
          { withCredentials: true }
        );

        // Handle paginated response
        let data: SubjectMessage[];
        if (messagesData.data && typeof messagesData.data === 'object' && 'data' in messagesData.data) {
          data = messagesData.data.data;
        } else if (Array.isArray(messagesData.data)) {
          data = messagesData.data;
        } else {
          data = [];
        }

        setMessages(data);
      } catch {
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
    const [da, ma, ya] = a.split("/");
    const [db, mb, yb] = b.split("/");
    return (
      new Date(`${yb}-${mb}-${db}`).getTime() -
      new Date(`${ya}-${ma}-${da}`).getTime()
    );
  });

  const getTypeConfig = (type: string) => {
    return typeConfig[type as keyof typeof typeConfig] || typeConfig.message;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "file":
        return <DocumentIcon className="w-6 h-6" />;
      case "link":
        return <ArrowDownTrayIcon className="w-6 h-6" />;
      default:
        return <ChatBubbleLeftIcon className="w-6 h-6" />;
    }
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDownloadUrl = (message: SubjectMessage) => {
    if (message.type === "file" && message.content) {
      return message.content;
    }
    return null;
  };

  const handleDownload = (url: string, filename: string) => {
    const safeUrl = SecuritySanitizer.sanitizeUrl(url);
    if (safeUrl === '/') return;
    const link = document.createElement("a");
    link.href = safeUrl;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    const messageId = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(messageId);
    try {
      await axios.delete(`/api/proxy/subject-messages/${messageId}/`, {
        withCredentials: true,
      });
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      toast.error("Error al borrar el mensaje");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;

    setIsSaving(true);
    try {
      const res = await axios.put(
        `/api/proxy/subject-messages/${editingMessage.id}/`,
        {
          title: editData.title || "",
          content: editData.content || "",
          type: editData.type || "message",
        },
        { withCredentials: true }
      );

      if (res && res.data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === editingMessage.id
              ? {
                  ...m,
                  ...editData,
                  id: editingMessage.id,
                  subject_id: editingMessage.subject_id,
                }
              : m
          )
        );
        setEditingMessage(null);
      } else {
        toast.error("Error al actualizar el mensaje");
      }
    } catch {
      toast.error("Error de red al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit =
    userInfo?.role &&
    ["admin", "teacher", "preceptor"].includes(userInfo.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando mensajes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dateKeys.length === 0 && (
        <EmptyState
          icon="document"
          title="No hay mensajes"
          description="No hay mensajes en esta materia"
        />
      )}

      {dateKeys.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
            <span>{formatDateHeader(dateKey)}</span>
          </div>

          {grouped[dateKey].map((message, index) => (
            <div key={`${message.id}-${index}`} className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 rounded-full border-2 p-2 mt-2",
                  getTypeConfig(message.type).iconBg
                )}
              >
                {getIcon(message.type)}
              </div>

              {/* Message bubble */}
              <div className="flex-1">
                <div className="rounded-lg border border-border bg-surface px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-primary text-base">
                      {message.title}
                    </span>
                    <Badge variant={getTypeConfig(message.type).badge}>
                      {getTypeConfig(message.type).label}
                    </Badge>
                    <div className="flex-1" />

                    {canEdit && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditingMessage(message);
                            setEditData({ ...message });
                          }}
                          aria-label="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setConfirmDeleteId(message.id)}
                          disabled={deletingId === message.id}
                          aria-label="Borrar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {message.type === "message" && (
                    <p className="text-text-secondary mb-2 whitespace-pre-line">
                      {message.content}
                    </p>
                  )}

                  {message.type === "file" && (
                    <>
                      {getDownloadUrl(message) ? (
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleDownload(getDownloadUrl(message)!, message.title)
                            }
                          >
                            <ArrowDownTrayIcon className="size-4" />
                            {message.title}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-warning text-sm mb-2">
                          <ExclamationTriangleIcon className="size-4" />
                          <span>Archivo no disponible</span>
                        </div>
                      )}
                    </>
                  )}

                  {message.type === "link" && (
                    <>
                      {message.content && (
                        <p className="text-text-secondary mb-2 whitespace-pre-line">
                          {message.content}
                        </p>
                      )}
                      {message.content && (() => {
                        const safeUrl = SecuritySanitizer.sanitizeUrl(message.content);
                        return safeUrl !== '/' ? (
                          <div className="flex items-center gap-2 mb-2">
                            <Button
                              variant="primary"
                              size="sm"
                              asChild
                            >
                              <a
                                href={safeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ArrowDownTrayIcon className="size-4" />
                                Abrir enlace
                              </a>
                            </Button>
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}

                  <div className="flex justify-end gap-2 mt-2">
                    <span className="text-xs text-text-muted">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mensaje</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara este mensaje de materia. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal - Using Sacred Modal component */}
      <Modal
        open={!!editingMessage}
        onOpenChange={() => {
          setEditingMessage(null);
          setEditData({});
        }}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Editar mensaje de materia</ModalTitle>
          </ModalHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <FormGroup>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={editData.title || ""}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="edit-type">Tipo</Label>
              <Select
                id="edit-type"
                value={editData.type || "message"}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    type: e.target.value as "message" | "file" | "link",
                  })
                }
                required
              >
                <option value="message">Mensaje</option>
                <option value="file">Archivo</option>
                <option value="link">Link</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="edit-content">Contenido</Label>
              <Textarea
                id="edit-content"
                value={editData.content || ""}
                onChange={(e) =>
                  setEditData({ ...editData, content: e.target.value })
                }
                required
              />
            </FormGroup>

            <ModalFooter>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setEditingMessage(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button variant="primary" type="submit" loading={isSaving}>
                Guardar cambios
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
