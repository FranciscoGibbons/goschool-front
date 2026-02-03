"use client";

import { useState } from "react";
import { CalendarClock, Check, X, MapPin, Clock } from "lucide-react";
import { useMeetingRequests } from "@/hooks/useTurnos";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { MeetingRequestWithNames } from "@/types/turnos";

interface Props {
  userId?: number;
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  cancelled_by_requester: "Cancelada",
  cancelled_by_receiver: "Cancelada",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  accepted: "default",
  cancelled_by_requester: "destructive",
  cancelled_by_receiver: "destructive",
};

export default function MeetingRequestsList({ userId }: Props) {
  const { requests, isLoading, acceptRequest, cancelRequest, pagination, nextPage, prevPage } = useMeetingRequests();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const handleAccept = async (id: number) => {
    await acceptRequest(id);
  };

  const handleCancel = async (id: number) => {
    const success = await cancelRequest(id, cancelReason ? { reason: cancelReason } : undefined);
    if (success) {
      setCancellingId(null);
      setCancelReason("");
    }
  };

  if (isLoading && requests.length === 0) {
    return <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>;
  }

  if (requests.length === 0) {
    return (
      <div className="sacred-card text-center py-8">
        <CalendarClock className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm font-medium text-text-primary">Sin solicitudes de reunion</p>
        <p className="text-sm text-text-secondary mt-1">No hay solicitudes disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req: MeetingRequestWithNames) => {
        const isReceiver = userId === req.receiver_id;
        const isRequester = userId === req.requester_id;
        const canAccept = isReceiver && req.status === "pending";
        const canCancel = (isReceiver || isRequester) && (req.status === "pending" || req.status === "accepted");

        return (
          <Card key={req.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{req.subject}</CardTitle>
                <Badge variant={statusVariants[req.status] || "secondary"}>
                  {statusLabels[req.status] || req.status}
                </Badge>
              </div>
              <p className="text-sm text-text-muted">
                De: {req.requester_name} · Para: {req.receiver_name} · Alumno: {req.student_name}
              </p>
              <p className="text-sm text-text-muted">
                {new Date(req.created_at).toLocaleDateString("es-AR")}
              </p>
            </CardHeader>
            <CardContent>
              {req.scheduled_date && (req.status === "accepted" || req.status === "pending") && (
                <div className="p-3 rounded-md bg-surface-muted border border-border space-y-1">
                  <p className="text-xs font-medium text-text-muted mb-1">
                    {req.status === "pending" ? "Fecha propuesta" : "Fecha confirmada"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(req.scheduled_date).toLocaleDateString("es-AR")}{req.scheduled_time ? ` a las ${req.scheduled_time}` : ""}</span>
                  </div>
                  {req.location && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin className="h-4 w-4" />
                      <span>{req.location}</span>
                    </div>
                  )}
                </div>
              )}
              {(req.status === "cancelled_by_requester" || req.status === "cancelled_by_receiver") && req.cancelled_reason && (
                <div className="p-3 rounded-md bg-surface-muted border border-border">
                  <p className="text-sm text-text-secondary">Motivo: {req.cancelled_reason}</p>
                </div>
              )}

              {/* Cancel form */}
              {cancellingId === req.id && (
                <div className="mt-4 space-y-3 p-3 rounded-md border border-border">
                  <p className="text-sm font-medium text-text-primary">Cancelar solicitud</p>
                  <Textarea
                    placeholder="Motivo de cancelacion (opcional)"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleCancel(req.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Confirmar cancelacion
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setCancellingId(null); setCancelReason(""); }}>
                      Volver
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
              {canAccept && (
                <Button variant="default" size="sm" onClick={() => handleAccept(req.id)}>
                  <Check className="h-4 w-4 mr-2" />
                  Aceptar
                </Button>
              )}
              {canCancel && cancellingId !== req.id && (
                <Button variant="outline" size="sm" onClick={() => setCancellingId(req.id)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar reunion
                </Button>
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
