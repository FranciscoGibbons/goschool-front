"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary, LoadingSpinner } from "@/components/sacred";
import axios from "axios";
import SafeHTML from "@/components/SafeHTML";
import userInfoStore from "@/store/userInfoStore";

interface Message {
  id: string;
  title: string;
  message: string;
  courses: string;
  sender_id: number;
  sender_name?: string;
  sender_photo?: string;
}

interface Sender {
  id: number;
  full_name: string;
  photo: string | null;
}

function processSenderPhoto(photo: string | null | undefined): string {
  if (!photo) return "/api/image-proxy/uploads/profile_pictures/default.jpg";
  let fileName = photo;
  if (fileName.includes("/uploads/profile_pictures/")) {
    fileName = fileName.split("/uploads/profile_pictures/").pop() || fileName;
  }
  fileName = fileName.replace(/^\.\//, "");
  fileName = fileName.split("/").pop() || fileName;
  return `/api/image-proxy/uploads/profile_pictures/${fileName}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MessageDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { userInfo } = userInfoStore();

  const [message, setMessage] = useState<Message | null>(null);
  const [sender, setSender] = useState<Sender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/proxy/messages/${id}`, {
          withCredentials: true,
        });

        const data = res.data?.data ?? res.data;
        setMessage(data);

        // Fetch sender info
        const senderId = data.sender_id;

        // Si el remitente es el usuario actual, usar sus datos del store
        if (userInfo && senderId === userInfo.id) {
          setSender({
            id: senderId,
            full_name: userInfo.full_name || `${userInfo.name || ""} ${userInfo.last_name || ""}`.trim() || "Usuario",
            photo: userInfo.photo || processSenderPhoto(null),
          });
        } else if (data.sender_name) {
          setSender({
            id: senderId,
            full_name: data.sender_name,
            photo: processSenderPhoto(data.sender_photo),
          });
        } else {
          try {
            const senderRes = await axios.get(
              `/api/proxy/public-personal-data/?user_id=${senderId}`,
              { withCredentials: true }
            );
            const senderData = senderRes.data?.data ?? senderRes.data;
            const senderInfo = Array.isArray(senderData)
              ? senderData[0]
              : senderData;
            if (senderInfo) {
              setSender({
                id: senderId,
                full_name: senderInfo.full_name || "Usuario",
                photo: processSenderPhoto(senderInfo.photo),
              });
            }
          } catch {
            setSender({
              id: senderId,
              full_name: "Usuario Desconocido",
              photo: processSenderPhoto(null),
            });
          }
        }
      } catch {
        setError("Error al cargar el mensaje");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMessage();
  }, [id, userInfo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="sacred-card text-center py-8">
          <p className="text-sm text-error">
            {error || "Mensaje no encontrado"}
          </p>
        </div>
      </div>
    );
  }

  const initials = sender ? getInitials(sender.full_name) : "??";

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="sacred-card space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            {sender?.photo ? (
              <AvatarImage src={sender.photo} alt={sender.full_name} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">
              {sender?.full_name || "Usuario Desconocido"}
            </p>
            {message.courses && (
              <p className="text-xs text-text-muted mt-0.5">
                Cursos: {message.courses}
              </p>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg font-semibold text-text-primary">
          {message.title}
        </h1>

        {/* Body */}
        <SafeHTML
          html={message.message}
          className="text-sm text-text-secondary leading-relaxed"
        />
      </div>
    </div>
  );
}

export default function MessageDetailPage() {
  return (
    <ProtectedPage>
      <ErrorBoundary>
        <MessageDetailContent />
      </ErrorBoundary>
    </ProtectedPage>
  );
}
