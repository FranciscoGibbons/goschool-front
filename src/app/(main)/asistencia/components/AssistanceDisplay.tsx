"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { useAssistance } from "@/hooks/useAssistance";
import { CalendarDays, Calendar, Pencil, Trash2, User, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import userInfoStore from "@/store/userInfoStore";
import type { Assistance, UpdateAssistance } from "../../../../types/assistance";
import AssistanceStats from "./AssistanceStats";
import AssistanceCalendar from "./AssistanceCalendar";
import {
  formatAssistanceDate,
  getAssistanceTimestamp,
  getMonthKey,
  getMonthName,
} from "@/utils/dateHelpers";

interface AssistanceDisplayProps {
  selectedStudentId?: number;
  refreshTrigger?: number;
}

export default function AssistanceDisplay({
  selectedStudentId,
  refreshTrigger,
}: AssistanceDisplayProps) {
  const { userInfo } = userInfoStore();
  const [orderBy, setOrderBy] = useState<string>("date_desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingAssistance, setEditingAssistance] = useState<Assistance | null>(null);
  const [editData, setEditData] = useState<UpdateAssistance | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentStudentIdRef = useRef<number | undefined>(selectedStudentId);
  const canEdit = userInfo?.role === "admin" || userInfo?.role === "preceptor";

  const assistanceFilters = useMemo(() => {
    return selectedStudentId ? { student_id: selectedStudentId } : undefined;
  }, [selectedStudentId]);

  const {
    assistances,
    isLoading,
    error,
    updateAssistance,
    deleteAssistance,
    fetchAssistances,
  } = useAssistance(assistanceFilters);

  useEffect(() => {
    currentStudentIdRef.current = selectedStudentId;
  }, [selectedStudentId]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchAssistances();
    }
  }, [refreshTrigger, fetchAssistances]);

  // Filter and sort
  let filteredAssistances = [...assistances];

  if (statusFilter !== "all") {
    filteredAssistances = filteredAssistances.filter((a) => a.presence === statusFilter);
  }

  if (orderBy === "date_desc") {
    filteredAssistances.sort((a, b) => getAssistanceTimestamp(b.date) - getAssistanceTimestamp(a.date));
  } else {
    filteredAssistances.sort((a, b) => getAssistanceTimestamp(a.date) - getAssistanceTimestamp(b.date));
  }

  const uniqueStatuses = Array.from(new Set(assistances.map((a) => a.presence)));

  const getPresenceConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: typeof Check }> = {
      present: { label: "Presente", color: "bg-success-muted text-success border-border", icon: Check },
      absent: { label: "Ausente", color: "bg-error-muted text-error border-border", icon: User },
      late: { label: "Tardanza", color: "bg-warning-muted text-warning border-border", icon: Clock },
      justified: { label: "Justificado", color: "bg-primary/10 text-primary border-border", icon: Calendar },
    };
    return configs[status] || { label: status, color: "bg-surface-muted text-text-secondary border-border", icon: User };
  };

  const handleEdit = (assistance: Assistance) => {
    setEditingAssistance(assistance);
    setEditData({
      student_id: assistance.student_id,
      presence: assistance.presence,
      date: assistance.date,
    });
  };

  const handleSave = async () => {
    if (!editingAssistance || !editData) return;

    setIsSaving(true);
    try {
      const success = await updateAssistance(editingAssistance.id, editData);
      if (success) {
        setEditingAssistance(null);
        setEditData(null);
      }
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar este registro?")) return;
    await deleteAssistance(id);
  };

  // Group by month
  const assistancesByMonth = filteredAssistances.reduce((groups, assistance) => {
    const monthKey = getMonthKey(assistance.date);
    const monthName = getMonthName(assistance.date);

    if (!groups[monthKey]) {
      groups[monthKey] = { name: monthName, assistances: [] };
    }
    groups[monthKey].assistances.push(assistance);
    return groups;
  }, {} as Record<string, { name: string; assistances: Assistance[] }>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando asistencia...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="minimal-card text-center py-8">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AssistanceStats assistances={assistances} />

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[200px] h-9">
          <TabsTrigger value="list" className="text-xs">Lista</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={orderBy} onValueChange={setOrderBy}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Mas reciente</SelectItem>
                <SelectItem value="date_asc">Mas antiguo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getPresenceConfig(status).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grouped list */}
          {Object.keys(assistancesByMonth).length === 0 ? (
            <div className="empty-state">
              <CalendarDays className="empty-state-icon" />
              <p className="empty-state-title">Sin registros</p>
              <p className="empty-state-text">No hay registros de asistencia</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(assistancesByMonth).map(([monthKey, monthData]) => (
                <div key={monthKey} className="space-y-3">
                  <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {monthData.name}
                  </h3>

                  <div className="space-y-2">
                    {monthData.assistances.map((assistance) => {
                      const config = getPresenceConfig(assistance.presence);
                      const Icon = config.icon;

                      return (
                        <div key={assistance.id} className="minimal-card py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium">
                                {formatAssistanceDate(assistance.date, {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>

                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium",
                                  config.color
                                )}
                              >
                                <Icon className="h-3 w-3" />
                                {config.label}
                              </span>
                            </div>

                            {canEdit && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEdit(assistance)}
                                  className="p-1.5 rounded hover:bg-accent transition-colors"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-text-secondary" />
                                </button>
                                <button
                                  onClick={() => handleDelete(assistance.id)}
                                  className="p-1.5 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-text-secondary" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <AssistanceCalendar assistances={assistances} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingAssistance} onOpenChange={() => { setEditingAssistance(null); setEditData(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar asistencia</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Fecha</Label>
              <Input
                type="date"
                value={editData?.date || ""}
                onChange={(e) => setEditData((prev) => ({ ...prev!, date: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Estado</Label>
              <Select
                value={editData?.presence || ""}
                onValueChange={(v) => setEditData((prev) => ({ ...prev!, presence: v }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Presente</SelectItem>
                  <SelectItem value="absent">Ausente</SelectItem>
                  <SelectItem value="late">Tardanza</SelectItem>
                  <SelectItem value="justified">Justificado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => { setEditingAssistance(null); setEditData(null); }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
