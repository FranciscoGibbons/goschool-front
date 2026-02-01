"use client";

import { useState } from "react";
import { Shield, Check, X, Eye, Trash2, Download } from "lucide-react";
import { useAutorizaciones } from "@/hooks/useCuaderno";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import type { AutorizacionWithStats, AutorizacionResponseWithNames } from "@/types/cuaderno";
import { cn } from "@/lib/utils";

interface Props {
  role: string;
  selectedChildId?: number;
}

export default function AutorizacionesList({ role, selectedChildId }: Props) {
  const { autorizaciones, isLoading, respondAutorizacion, deleteAutorizacion, getResponses, pagination, nextPage, prevPage } = useAutorizaciones();
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [observations, setObservations] = useState("");
  const [responsesView, setResponsesView] = useState<{ id: number; data: AutorizacionResponseWithNames[] } | null>(null);

  const canManage = role === "admin" || role === "teacher" || role === "preceptor";
  const isFather = role === "father";

  const handleRespond = async (autorizacionId: number, status: "accepted" | "rejected") => {
    if (!selectedChildId && isFather) return;
    const studentId = selectedChildId || 0;
    await respondAutorizacion({ autorizacion_id: autorizacionId, student_id: studentId, status, observations: observations || undefined });
    setRespondingId(null);
    setObservations("");
  };

  const handleViewResponses = async (id: number) => {
    const data = await getResponses(id);
    if (data) setResponsesView({ id, data });
  };

  const handleExport = async (id: number) => {
    try {
      const response = await fetch(`/api/proxy/autorizaciones/${id}/export`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = response.headers.get("content-disposition");
      const filename = disposition?.match(/filename="?(.+?)"?$/)?.[1] || "export.csv";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  if (isLoading && autorizaciones.length === 0) {
    return <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>;
  }

  if (autorizaciones.length === 0) {
    return (
      <div className="sacred-card text-center py-8">
        <Shield className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm font-medium text-text-primary">Sin autorizaciones</p>
        <p className="text-sm text-text-secondary mt-1">No hay autorizaciones disponibles</p>
      </div>
    );
  }

  if (responsesView) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setResponsesView(null)}>Volver</Button>
        <Card>
          <CardHeader><CardTitle className="text-base">Respuestas</CardTitle></CardHeader>
          <CardContent>
            {responsesView.data.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Sin respuestas aun</p>
            ) : (
              <div className="space-y-2">
                {responsesView.data.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-md bg-surface-muted">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{r.parent_name}</p>
                      <p className="text-sm text-text-muted">Alumno: {r.student_name}</p>
                      {r.observations && <p className="text-sm text-text-secondary mt-1">{r.observations}</p>}
                    </div>
                    <Badge variant={r.status === "accepted" ? "default" : "destructive"}>
                      {r.status === "accepted" ? "Aceptada" : "Rechazada"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {autorizaciones.map((a: AutorizacionWithStats) => {
        const isPending = isFather && a.my_response === null;
        return (
          <Card key={a.id} className={cn(isPending && "border-l-4 border-l-yellow-500")}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{a.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {isFather && (
                    <Badge variant={a.my_response === "accepted" ? "default" : a.my_response === "rejected" ? "destructive" : "secondary"}>
                      {a.my_response === "accepted" ? "Aceptada" : a.my_response === "rejected" ? "Rechazada" : "Pendiente"}
                    </Badge>
                  )}
                  {canManage && (
                    <Badge variant="outline">
                      {a.total_accepted}A / {a.total_rejected}R / {a.total_pending}P
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-muted">
                {a.sender_name || "Remitente"} · {new Date(a.created_at).toLocaleDateString("es-AR")}
                {a.deadline && ` · Vence: ${new Date(a.deadline).toLocaleDateString("es-AR")}`}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{a.description}</p>
              {respondingId === a.id && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    placeholder="Observaciones (opcional)"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => handleRespond(a.id, "accepted")}>
                      <Check className="h-4 w-4 mr-2" />
                      Autorizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRespond(a.id, "rejected")}>
                      <X className="h-4 w-4 mr-2" />
                      No autorizar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setRespondingId(null); setObservations(""); }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
              {isFather && isPending && respondingId !== a.id && (
                <Button variant="default" size="sm" onClick={() => setRespondingId(a.id)}>
                  Responder
                </Button>
              )}
              {canManage && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleViewResponses(a.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Respuestas
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport(a.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteAutorizacion(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        );
      })}
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
