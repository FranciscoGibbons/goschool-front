"use client";

import { useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useObservaciones } from "@/hooks/useObservaciones";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { ObservacionWithNames } from "@/types/observaciones";
import { cn } from "@/lib/utils";

interface Props {
  role: string;
  userId?: number;
}

export default function ObservacionesList({ role, userId }: Props) {
  const { observaciones, isLoading, replyObservacion, deleteObservacion, pagination, nextPage, prevPage } = useObservaciones();
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const canDelete = role === "admin" || role === "teacher" || role === "preceptor";
  const isFather = role === "father";

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return;
    await replyObservacion(id, { parent_reply: replyText });
    setReplyingId(null);
    setReplyText("");
  };

  if (isLoading && observaciones.length === 0) {
    return <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>;
  }

  if (observaciones.length === 0) {
    return (
      <div className="sacred-card text-center py-8">
        <MessageSquare className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm font-medium text-text-primary">Sin observaciones</p>
        <p className="text-sm text-text-secondary mt-1">No hay observaciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {observaciones.map((obs: ObservacionWithNames) => (
        <Card key={obs.id} className={cn(isFather && !obs.parent_reply && "border-l-4 border-l-yellow-500")}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{obs.title}</CardTitle>
              <div className="flex items-center gap-2">
                {obs.parent_reply ? (
                  <Badge variant="default">Respondida</Badge>
                ) : (
                  <Badge variant="secondary">Sin respuesta</Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-text-muted">
              De: {obs.sender_name} · Alumno: {obs.student_name} · {new Date(obs.created_at).toLocaleDateString("es-AR")}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{obs.body}</p>
            {obs.parent_reply && (
              <div className="mt-4 p-3 rounded-md bg-surface-muted border border-border">
                <p className="text-sm font-medium text-text-primary mb-1">Respuesta del padre:</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{obs.parent_reply}</p>
                {obs.replied_at && (
                  <p className="text-sm text-text-muted mt-1">{new Date(obs.replied_at).toLocaleDateString("es-AR")}</p>
                )}
              </div>
            )}
            {replyingId === obs.id && (
              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="Escriba su respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={() => handleReply(obs.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar respuesta
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setReplyingId(null); setReplyText(""); }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 pt-2">
            {isFather && !obs.parent_reply && replyingId !== obs.id && (
              <Button variant="default" size="sm" onClick={() => setReplyingId(obs.id)}>
                <Send className="h-4 w-4 mr-2" />
                Responder
              </Button>
            )}
            {(canDelete && userId === obs.sender_id) || role === "admin" ? (
              <Button variant="outline" size="sm" onClick={() => deleteObservacion(obs.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      ))}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button variant="outline" size="sm" onClick={prevPage} disabled={pagination.page <= 1}>Anterior</Button>
          <span className="text-sm text-text-muted">Pagina {pagination.page} de {pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={nextPage} disabled={pagination.page >= pagination.totalPages}>Siguiente</Button>
        </div>
      )}
    </div>
  );
}
