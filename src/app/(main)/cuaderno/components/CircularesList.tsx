"use client";

import { useState } from "react";
import { FileText, Check, Bell, Eye, Trash2 } from "lucide-react";
import { useCirculares } from "@/hooks/useCuaderno";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { CircularWithStats, ConfirmationDashboard } from "@/types/cuaderno";
import { cn } from "@/lib/utils";

interface Props {
  role: string;
}

export default function CircularesList({ role }: Props) {
  const { circulares, isLoading, confirmCircular, deleteCircular, getConfirmations, sendReminder, pagination, nextPage, prevPage } = useCirculares();
  const [selectedDashboard, setSelectedDashboard] = useState<{ id: number; data: ConfirmationDashboard } | null>(null);

  const canManage = role === "admin" || role === "teacher" || role === "preceptor";
  const canConfirm = role === "father" || role === "student";

  const handleViewConfirmations = async (id: number) => {
    const data = await getConfirmations(id);
    if (data) setSelectedDashboard({ id, data });
  };

  if (isLoading && circulares.length === 0) {
    return <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>;
  }

  if (circulares.length === 0) {
    return (
      <div className="sacred-card text-center py-8">
        <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm font-medium text-text-primary">Sin circulares</p>
        <p className="text-sm text-text-secondary mt-1">No hay circulares disponibles</p>
      </div>
    );
  }

  if (selectedDashboard) {
    const d = selectedDashboard.data;
    const rate = d.total_targets > 0 ? Math.round((d.total_confirmed / d.total_targets) * 100) : 0;
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setSelectedDashboard(null)}>Volver</Button>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sacred-card p-4 text-center">
            <p className="text-text-muted text-sm">Total</p>
            <p className="text-2xl font-semibold text-text-primary">{d.total_targets}</p>
          </div>
          <div className="sacred-card p-4 text-center">
            <p className="text-text-muted text-sm">Confirmaron</p>
            <p className="text-2xl font-semibold text-green-600">{d.total_confirmed}</p>
          </div>
          <div className="sacred-card p-4 text-center">
            <p className="text-text-muted text-sm">Pendientes</p>
            <p className="text-2xl font-semibold text-yellow-600">{d.pending.length}</p>
          </div>
          <div className="sacred-card p-4 text-center">
            <p className="text-text-muted text-sm">Tasa</p>
            <p className="text-2xl font-semibold text-text-primary">{rate}%</p>
          </div>
        </div>
        {d.pending.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pendientes de confirmacion</CardTitle>
                <Button variant="outline" size="sm" onClick={() => sendReminder(selectedDashboard.id)}>
                  <Bell className="h-4 w-4 mr-2" />
                  Enviar recordatorio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {d.pending.map(p => (
                  <div key={p.user_id} className="flex items-center justify-between p-2 rounded-md bg-surface-muted">
                    <span className="text-sm text-text-primary">{p.full_name}</span>
                    <span className="text-sm text-text-muted">{p.email}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {d.confirmed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Confirmadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {d.confirmed.map(c => (
                  <div key={c.user_id} className="flex items-center justify-between p-2 rounded-md bg-surface-muted">
                    <span className="text-sm text-text-primary">{c.full_name}</span>
                    <span className="text-sm text-text-muted">{new Date(c.confirmed_at).toLocaleDateString("es-AR")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {circulares.map((c: CircularWithStats) => (
        <Card key={c.id} className={cn(!c.is_confirmed_by_me && c.requires_confirmation && canConfirm && "border-l-4 border-l-yellow-500")}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{c.title}</CardTitle>
              <div className="flex items-center gap-2">
                {c.requires_confirmation && canConfirm && (
                  <Badge variant={c.is_confirmed_by_me ? "default" : "secondary"}>
                    {c.is_confirmed_by_me ? "Confirmada" : "Pendiente"}
                  </Badge>
                )}
                {canManage && (
                  <Badge variant="outline">
                    {c.total_confirmed}/{c.total_targets}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-text-muted">
              {c.sender_name || "Remitente"} · {new Date(c.created_at).toLocaleDateString("es-AR")}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{c.body}</p>
          </CardContent>
          <CardFooter className="flex gap-2 pt-2">
            {canConfirm && c.requires_confirmation && !c.is_confirmed_by_me && (
              <Button variant="default" size="sm" onClick={() => confirmCircular(c.id)}>
                <Check className="h-4 w-4 mr-2" />
                Confirmar lectura
              </Button>
            )}
            {canManage && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleViewConfirmations(c.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Confirmaciones
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteCircular(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
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
