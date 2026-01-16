"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";
import { useInView } from "react-intersection-observer";

import userInfoStore from "@/store/userInfoStore";
import { toast } from "sonner";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const { userInfo } = userInfoStore();
  const [hasMore, setHasMore] = useState(true);

  // Intersection Observer para detectar cuando el usuario llega al final
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Cargar más mensajes cuando el usuario llega al final
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setVisibleCount((prev) => Math.min(prev + 10, messages.length));
      if (visibleCount + 10 >= messages.length) {
        setHasMore(false);
      }
    }
  }, [inView, hasMore, loading, messages.length, visibleCount]);

  // Cargar mensajes iniciales
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await axios.get(`/api/proxy/messages/`, {
          withCredentials: true,
        });
        const messagesData = fetchedMessages.data;
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
          const senderDataResult = senderData.data;

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

  // Obtener solo los mensajes visibles
  const visibleMessages = messages.slice(0, visibleCount);

  // Función para borrar un mensaje
  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres borrar este mensaje?")) return;
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando mensajes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <EmptyStateSVG className="w-96 h-72 mb-4 opacity-80" />
        <span className="text-muted-foreground text-lg opacity-60">
          No hay mensajes disponibles
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contador de mensajes mostrados */}
      <div className="text-sm text-muted-foreground">
        Mostrando {visibleMessages.length} de {messages.length} mensajes
      </div>

      {/* Lista de mensajes */}
      <div className="flex flex-col space-y-4">
        {visibleMessages.map((message, index) => {
          const sender = sendersMap.get(message.sender_id);
          const initials = sender ? getInitials(sender.full_name) : "??";

          return (
            <div
              key={message.id}
              className="flex items-start p-4 bg-card rounded-lg shadow-sm border border-border hover:shadow-md transition message-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
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
                    <p className="font-medium text-card-foreground">
                      {sender?.full_name || "Usuario Desconocido"}
                    </p>
                  </div>
                  {/* ID eliminado */}
                  {(userInfo?.role === "admin" ||
                    userInfo?.role === "preceptor") && (
                    <div className="flex gap-1 ml-2">
                      <button
                        className="p-1 rounded-md transition-colors focus:outline-none text-foreground opacity-80 hover:opacity-100 hover:bg-muted hover:rounded-sm"
                        title="Editar"
                        onClick={() => {
                          setUpdatingMessage(message);
                          setEditMessage({ ...message });
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-1 rounded-md transition-colors focus:outline-none text-foreground opacity-80 hover:opacity-100 hover:bg-muted hover:rounded-sm"
                        title="Borrar"
                        onClick={() => handleDelete(Number(message.id))}
                        disabled={deletingId === Number(message.id)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-1">
                  <p className="font-semibold text-card-foreground mb-1">
                    {message.title}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {message.message}
                  </p>
                  {message.courses && (
                    <p className="text-xs text-muted-foreground mt-2">
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
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando más mensajes...</span>
          </div>
        </div>
      )}

      {/* Mensaje cuando se han cargado todos */}
      {!hasMore && messages.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <span>Has visto todos los mensajes</span>
        </div>
      )}

      {/* Modal de actualización (solo UI editable, sin lógica de update aún) */}
      {updatingMessage && editMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg w-full max-w-md text-foreground">
            <h2 className="text-lg font-bold mb-4">Actualizar mensaje</h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
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
                          ? { ...msg, ...editMessage }
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
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editMessage.title}
                  onChange={(e) =>
                    setEditMessage({ ...editMessage, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mensaje
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editMessage.message}
                  onChange={(e) =>
                    setEditMessage({ ...editMessage, message: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  className="px-3 py-1 bg-red-500 text-black rounded hover:bg-red-600 flex items-center gap-1"
                  type="button"
                  onClick={() => setUpdatingMessage(null)}
                  disabled={isSaving}
                >
                  <TrashIcon className="w-4 h-4" /> Cancelar
                </button>
                <button
                  className="px-3 py-1 bg-blue-500 text-black rounded hover:bg-blue-600 flex items-center gap-1"
                  type="submit"
                  disabled={isSaving}
                >
                  <PencilIcon className="w-4 h-4" />{" "}
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
