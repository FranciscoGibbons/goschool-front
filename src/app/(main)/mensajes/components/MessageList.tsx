"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";
import { useInView } from "react-intersection-observer";
import axios from "axios";

interface Message {
  id: string;
  title: string;
  message: string;
  courses: string;
  sender_id: number;
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
        const res = await axios.get("http://localhost:8080/api/v1/messages/", {
          withCredentials: true,
        });

        if (res.status === 200) {
          const fetchedMessages = res.data;
          setMessages(fetchedMessages);

          // Cargar datos de los remitentes
          await fetchSendersData(fetchedMessages);
        }
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
    const uniqueSenderIds = [
      ...new Set(messagesToProcess.map((msg) => msg.sender_id)),
    ];
    const newSendersMap = new Map<number, Sender>();

    for (const senderId of uniqueSenderIds) {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/v1/public_personal_data/?user_id=${senderId}`,
          {
            withCredentials: true,
          }
        );

        if (res.data && res.data.length > 0) {
          const sender = res.data[0];
          const senderData: Sender = {
            id: senderId,
            full_name: sender.full_name || "Usuario",
            photo: sender.photo || null,
          };
          newSendersMap.set(senderId, senderData);
        }
      } catch (error) {
        console.error(
          `Error al obtener datos del remitente ${senderId}:`,
          error
        );
        newSendersMap.set(senderId, {
          id: senderId,
          full_name: "Usuario Desconocido",
          photo: null,
        });
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
                  <AvatarImage src={sender.photo} alt={sender.full_name} />
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
                  <div className="text-xs text-muted-foreground">
                    ID: {message.sender_id}
                  </div>
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
    </div>
  );
}
