"use client";

/**
 * Message List Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * Uses semantic color tokens and sacred components.
 * ==========================================================================
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInView } from "react-intersection-observer";

import userInfoStore from "@/store/userInfoStore";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";
import SafeHTML from "@/components/SafeHTML";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import {
  Button,
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  NativeSelect,
} from "@/components/sacred";
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
import axios from "axios";

interface Message {
  id: string;
  title: string;
  message: string;
  courses: string;
  sender_id: number;
  sender_name?: string; // Ahora puede incluir sender_name directamente
  sender_photo?: string; // Ahora puede incluir sender_photo directamente
}

interface Sender {
  id: number;
  full_name: string;
  photo: string | null;
}

export default function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendersMap, setSendersMap] = useState<Map<number, Sender>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [updatingMessage, setUpdatingMessage] = useState<Message | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { userInfo } = userInfoStore();
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSender, setSelectedSender] = useState<string>("");

  // Extract unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    const courses = new Set<string>();
    messages.forEach((msg) => {
      if (msg.courses) {
        msg.courses.split(",").forEach((c) => courses.add(c.trim()));
      }
    });
    return Array.from(courses).sort();
  }, [messages]);

  // Extract unique senders for filter dropdown
  const uniqueSenders = useMemo(() => {
    const senders: { id: number; name: string }[] = [];
    const seen = new Set<number>();
    messages.forEach((msg) => {
      if (!seen.has(msg.sender_id)) {
        seen.add(msg.sender_id);
        const sender = sendersMap.get(msg.sender_id);
        senders.push({
          id: msg.sender_id,
          name: sender?.full_name || msg.sender_name || "Desconocido",
        });
      }
    });
    return senders.sort((a, b) => a.name.localeCompare(b.name));
  }, [messages, sendersMap]);

  // Filter messages based on search and filters
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = msg.title?.toLowerCase().includes(query);
        const matchesContent = msg.message?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent) return false;
      }
      // Course filter
      if (selectedCourse && msg.courses) {
        const msgCourses = msg.courses.split(",").map((c) => c.trim());
        if (!msgCourses.includes(selectedCourse)) return false;
      } else if (selectedCourse && !msg.courses) {
        return false;
      }
      // Sender filter
      if (selectedSender && msg.sender_id !== Number(selectedSender)) {
        return false;
      }
      return true;
    });
  }, [messages, searchQuery, selectedCourse, selectedSender]);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCourse("");
    setSelectedSender("");
  };

  const hasActiveFilters = searchQuery || selectedCourse || selectedSender;

  // Intersection Observer para detectar cuando el usuario llega al final
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Cargar más mensajes cuando el usuario llega al final
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setVisibleCount((prev) => Math.min(prev + 10, filteredMessages.length));
      if (visibleCount + 10 >= filteredMessages.length) {
        setHasMore(false);
      }
    }
  }, [inView, hasMore, loading, filteredMessages.length, visibleCount]);

  // Reset visible count and hasMore when filters change
  useEffect(() => {
    setVisibleCount(10);
    setHasMore(filteredMessages.length > 10);
  }, [searchQuery, selectedCourse, selectedSender, filteredMessages.length]);

  // Cargar mensajes iniciales
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await axios.get(`/api/proxy/messages/`, {
          withCredentials: true,
        });

        // Handle paginated response
        let messagesData: Message[];
        if (fetchedMessages.data && typeof fetchedMessages.data === 'object' && 'data' in fetchedMessages.data) {
          messagesData = fetchedMessages.data.data;
        } else if (Array.isArray(fetchedMessages.data)) {
          messagesData = fetchedMessages.data;
        } else {
          messagesData = [];
        }

        setMessages(messagesData);

        // Cargar datos de los remitentes
        await fetchSendersData(messagesData);
      } catch (error) {
        console.error("Error al obtener los mensajes:", error);
        setError("Error al cargar mensajes.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const fetchSendersData = async (messagesToProcess: Message[]) => {
    const newSendersMap = new Map<number, Sender>();

    for (const message of messagesToProcess) {
      const senderId = message.sender_id;

      // Skip if we already resolved this sender
      if (newSendersMap.has(senderId)) continue;

      // Si el remitente es el usuario actual, usar sus datos del store
      if (userInfo && senderId === userInfo.id) {
        newSendersMap.set(senderId, {
          id: senderId,
          full_name: userInfo.full_name || `${userInfo.name || ""} ${userInfo.last_name || ""}`.trim() || "Usuario",
          photo: userInfo.photo || `/api/image-proxy/uploads/profile_pictures/default.jpg`,
        });
        continue;
      }

      // Si el mensaje ya incluye la información del remitente, usarla directamente
      if (message.sender_name) {
        let profilePicture = null;
        if (message.sender_photo) {
          // Procesar la URL de la foto para usar el proxy, como en userInfoStore
          let fileName = message.sender_photo;
          
          // Si viene con estructura de path completa, extraer solo el nombre del archivo
          if (fileName.includes('/uploads/profile_pictures/')) {
            fileName = fileName.split('/uploads/profile_pictures/').pop() || fileName;
          }
          // Si viene con ./ al inicio, quitarlo
          fileName = fileName.replace(/^\.\//, '');
          // Si aún contiene path, quedarnos solo con el nombre del archivo
          fileName = fileName.split('/').pop() || fileName;
          
          // Usar el proxy interno para evitar problemas de certificados SSL
          profilePicture = `/api/image-proxy/uploads/profile_pictures/${fileName}`;
          console.log("🖼️ Foto de remitente procesada - Original:", message.sender_photo, "-> Proxy:", profilePicture);
        } else {
          // Usar imagen por defecto a través del proxy
          profilePicture = `/api/image-proxy/uploads/profile_pictures/default.jpg`;
        }

        const senderInfo: Sender = {
          id: senderId,
          full_name: message.sender_name,
          photo: profilePicture,
        };
        newSendersMap.set(senderId, senderInfo);
      } else {
        // Solo hacer llamada adicional si no está incluida la información
        try {
          const senderData = await axios.get(
            `/api/proxy/public-personal-data/?user_id=${senderId}`, {
              withCredentials: true,
            }
          );

          // Handle paginated response
          let senderDataResult;
          if (senderData.data && typeof senderData.data === 'object' && 'data' in senderData.data) {
            senderDataResult = senderData.data.data;
          } else if (Array.isArray(senderData.data)) {
            senderDataResult = senderData.data;
          } else {
            senderDataResult = [];
          }

          if (senderDataResult && senderDataResult.length > 0) {
            const sender = senderDataResult[0];
            
            let profilePicture = null;
            if (sender.photo) {
              // Procesar la URL de la foto para usar el proxy, como en userInfoStore
              let fileName = sender.photo;
              
              // Si viene con estructura de path completa, extraer solo el nombre del archivo
              if (fileName.includes('/uploads/profile_pictures/')) {
                fileName = fileName.split('/uploads/profile_pictures/').pop() || fileName;
              }
              // Si viene con ./ al inicio, quitarlo
              fileName = fileName.replace(/^\.\//, '');
              // Si aún contiene path, quedarnos solo con el nombre del archivo
              fileName = fileName.split('/').pop() || fileName;
              
              // Usar el proxy interno para evitar problemas de certificados SSL
              profilePicture = `/api/image-proxy/uploads/profile_pictures/${fileName}`;
              console.log("🖼️ Foto de remitente desde API - Original:", sender.photo, "-> Proxy:", profilePicture);
            } else {
              // Usar imagen por defecto a través del proxy
              profilePicture = `/api/image-proxy/uploads/profile_pictures/default.jpg`;
            }

            const senderInfo: Sender = {
              id: senderId,
              full_name: sender.full_name || "Usuario",
              photo: profilePicture,
            };
            newSendersMap.set(senderId, senderInfo);
          }
        } catch (error) {
          console.error(
            `Error al obtener datos del remitente ${senderId}:`,
            error
          );
          newSendersMap.set(senderId, {
            id: senderId,
            full_name: "Usuario Desconocido",
            photo: `/api/image-proxy/uploads/profile_pictures/default.jpg`,
          });
        }
      }
    }

    setSendersMap(newSendersMap);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Obtener solo los mensajes visibles (usando filteredMessages)
  const visibleMessages = filteredMessages.slice(0, visibleCount);

  // Función para borrar un mensaje
  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await axios.delete(`/api/proxy/messages/${id}/`, {
        withCredentials: true,
      });
      toast.success("Mensaje borrado");
      setMessages((prev) => prev.filter((msg) => Number(msg.id) !== id));
    } catch {
      toast.error("Error al borrar el mensaje");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex items-center gap-2 text-text-secondary">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando mensajes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon="document"
        title="No hay mensajes"
        description="No hay mensajes disponibles"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
          <Input
            type="text"
            placeholder="Buscar en mensajes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros de curso y remitente */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-secondary">Filtrar:</span>
          </div>

          <NativeSelect
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="min-w-[150px]"
          >
            <option value="">Todos los cursos</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
            className="min-w-[150px]"
          >
            <option value="">Todos los remitentes</option>
            {uniqueSenders.map((sender) => (
              <option key={sender.id} value={sender.id}>
                {sender.name}
              </option>
            ))}
          </NativeSelect>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Contador de mensajes mostrados */}
      <div className="text-sm text-text-secondary">
        Mostrando {visibleMessages.length} de {filteredMessages.length} mensajes
        {hasActiveFilters && ` (${messages.length} totales)`}
      </div>

      {/* Lista de mensajes */}
      <div className="flex flex-col space-y-4">
        {visibleMessages.map((message) => {
          const sender = sendersMap.get(message.sender_id);
          const initials = sender ? getInitials(sender.full_name) : "??";

          return (
            <div
              key={message.id}
              className="flex items-start p-4 bg-surface rounded-lg border border-border transition-colors hover:border-border-muted"
            >
              <Avatar className="h-12 w-12 mr-4">
                {sender?.photo ? (
                  <AvatarImage
                    src={sender.photo}
                    alt={sender.full_name}
                    onError={(e) => {
                      console.error("Error cargando imagen de avatar:", sender.photo, e);
                    }}
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-text-primary">
                      {sender?.full_name || "Usuario Desconocido"}
                    </p>
                  </div>
                  {(userInfo?.role === "admin" ||
                    userInfo?.role === "preceptor") && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setUpdatingMessage(message);
                          setEditMessage({ ...message });
                        }}
                        aria-label="Editar"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setConfirmDeleteId(Number(message.id))}
                        disabled={deletingId === Number(message.id)}
                        aria-label="Borrar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-1">
                  <Link
                    href={`/mensajes/${message.id}`}
                    className="font-semibold text-text-primary mb-1 hover:underline block"
                  >
                    {message.title}
                  </Link>
                  <SafeHTML
                    html={message.message}
                    className="text-text-secondary text-sm leading-relaxed line-clamp-3"
                  />
                  {message.message && message.message.length > 200 && (
                    <Link
                      href={`/mensajes/${message.id}`}
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Ver mas
                    </Link>
                  )}
                  {message.courses && (
                    <p className="text-xs text-text-muted mt-2">
                      Cursos: {message.courses}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Elemento "sentinela" para detectar cuando cargar más */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-text-secondary">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando más mensajes...</span>
          </div>
        </div>
      )}

      {/* Mensaje cuando se han cargado todos */}
      {!hasMore && messages.length > 0 && (
        <div className="text-center py-8 text-text-muted">
          <span>Has visto todos los mensajes</span>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mensaje</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara este mensaje. Esta accion no se puede deshacer.
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
        open={!!(updatingMessage && editMessage)}
        onOpenChange={() => {
          setUpdatingMessage(null);
          setEditMessage(null);
        }}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Actualizar mensaje</ModalTitle>
          </ModalHeader>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editMessage || !updatingMessage) return;
              setIsSaving(true);
              try {
                const res = await fetch(
                  `/api/proxy/messages/${updatingMessage.id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      title: editMessage.title,
                      message: editMessage.message,
                    }),
                  }
                );
                if (res.ok) {
                  toast.success("Mensaje actualizado");
                  setMessages((prev) =>
                    prev.map((msg) =>
                      Number(msg.id) === Number(updatingMessage.id)
                        ? { ...msg, title: editMessage.title, message: editMessage.message }
                        : msg
                    )
                  );
                  setUpdatingMessage(null);
                } else {
                  toast.error("Error al actualizar el mensaje");
                }
              } catch {
                toast.error("Error de red al actualizar");
              } finally {
                setIsSaving(false);
              }
            }}
          >
            <FormGroup>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={editMessage?.title || ""}
                onChange={(e) =>
                  setEditMessage(editMessage ? { ...editMessage, title: e.target.value } : null)
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="edit-message">Mensaje</Label>
              <RichTextEditor
                content={editMessage?.message || ""}
                onChange={(html) =>
                  setEditMessage(editMessage ? { ...editMessage, message: html } : null)
                }
              />
            </FormGroup>

            <ModalFooter>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setUpdatingMessage(null)}
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
