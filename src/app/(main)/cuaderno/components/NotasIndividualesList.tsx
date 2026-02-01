"use client";

import { useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useNotasIndividuales } from "@/hooks/useCuaderno";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { NotaIndividualWithNames } from "@/types/cuaderno";
import { cn } from "@/lib/utils";

interface Props {
  role: string;
  selectedChildId?: number;
}

export default function NotasIndividualesList({ role }: Props) {
  const { notas, isLoading, replyNota, deleteNota, pagination, nextPage, prevPage } = useNotasIndividuales();
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const canManage = role === "admin" || role === "teacher" || role === "preceptor";
  const isFather = role === "father";

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return;
    await replyNota(id, { parent_reply: replyText });
    setReplyingId(null);
    setReplyText("");
  };

  if (isLoading && notas.length === 0) {
    return <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>;
  }

  if (notas.length === 0) {
    return (
      <div className="sacred-card text-center py-8">
        <MessageSquare className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm font-medium text-text-primary">Sin notas individuales</p>
        <p className="text-sm text-text-secondary mt-1">No hay notas disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notas.map((n: NotaIndividualWithNames) => (
        <Card key={n.id} className={cn(isFather && !n.parent_reply && "border-l-4 border-l-yellow-500")}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{n.subject}</CardTitle>
              <div className="flex items-center gap-2">
                {n.parent_reply ? (
                  <Badge variant="default">Respondida</Badge>
                ) : (
                  <Badge variant="secondary">Sin respuesta</Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-text-muted">
              De: {n.sender_name} · Alumno: {n.student_name} · {new Date(n.created_at).toLocaleDateString("es-AR")}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{n.body}</p>
            {n.parent_reply && (
              <div className="mt-4 p-3 rounded-md bg-surface-muted border border-border">
                <p className="text-sm font-medium text-text-primary mb-1">Respuesta del padre:</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{n.parent_reply}</p>
                {n.replied_at && (
                  <p className="text-sm text-text-muted mt-1">{new Date(n.replied_at).toLocaleDateString("es-AR")}</p>
                )}
              </div>
            )}
            {replyingId === n.id && (
              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="Escriba su respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={() => handleReply(n.id)}>
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
            {isFather && !n.parent_reply && replyingId !== n.id && (
              <Button variant="default" size="sm" onClick={() => setReplyingId(n.id)}>
                <Send className="h-4 w-4 mr-2" />
                Responder
              </Button>
            )}
            {(canManage || (role === "admin")) && (
              <Button variant="outline" size="sm" onClick={() => deleteNota(n.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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
