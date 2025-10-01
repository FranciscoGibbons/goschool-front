"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAssistance } from "@/hooks/useAssistance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDaysIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";
import userInfoStore from "@/store/userInfoStore";
import type { Assistance, UpdateAssistance } from "../../../../types/assistance";
import AssistanceStats from "./AssistanceStats";
import AssistanceCalendar from "./AssistanceCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  formatAssistanceDate, 
  getAssistanceTimestamp,
  getMonthKey,
  getMonthName 
} from "@/utils/dateHelpers";

interface AssistanceDisplayProps {
  selectedStudentId?: number;
  refreshTrigger?: number; // Para forzar refresh externo
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
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Ref para prevenir race conditions
  const currentStudentIdRef = useRef<number | undefined>(selectedStudentId);

  // Configurar filtros basados en el estudiante seleccionado - usar useMemo para estabilizar
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
    // Actualizar la ref con el studentId actual
    currentStudentIdRef.current = selectedStudentId;
  }, [selectedStudentId]);

  // Refrescar cuando cambie el trigger externo
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('🔄 External refresh triggered');
      fetchAssistances();
    }
  }, [refreshTrigger, fetchAssistances]);

  // Filtrar y ordenar asistencias
  let filteredAssistances = [...assistances];
  
  if (statusFilter !== "all") {
    filteredAssistances = filteredAssistances.filter((a) => a.presence === statusFilter);
  }
  
  if (orderBy === "date_desc") {
    filteredAssistances.sort(
      (a, b) => getAssistanceTimestamp(b.date) - getAssistanceTimestamp(a.date)
    );
  } else if (orderBy === "date_asc") {
    filteredAssistances.sort(
      (a, b) => getAssistanceTimestamp(a.date) - getAssistanceTimestamp(b.date)
    );
  }

  // Obtener estados únicos para el filtro
  const uniqueStatuses = Array.from(
    new Set(assistances.map((a) => a.presence))
  );

  const getPresenceColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "justified":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getPresenceLabel = (status: string) => {
    switch (status) {
      case "present":
        return "Presente";
      case "absent":
        return "Ausente";
      case "late":
        return "Tardanza";
      case "justified":
        return "Justificado";
      default:
        return status;
    }
  };

  const getPresenceIcon = (status: string) => {
    switch (status) {
      case "present":
        return <UserIcon className="size-4" />;
      case "absent":
        return <UserIcon className="size-4" />;
      case "late":
        return <ClockIcon className="size-4" />;
      case "justified":
        return <CalendarIcon className="size-4" />;
      default:
        return <UserIcon className="size-4" />;
    }
  };

  const handleEdit = (assistance: Assistance) => {
    setEditingAssistance(assistance);
    setEditData({
      student_id: assistance.student_id,
      presence: assistance.presence,
      date: assistance.date,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssistance || !editData) return;

    setIsSaving(true);
    try {
      const success = await updateAssistance(editingAssistance.id, editData);
      if (success) {
        setEditingAssistance(null);
        setEditData(null);
      }
    } catch (error) {
      console.error("Error updating assistance:", error);
      toast.error("Error al actualizar la asistencia");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este registro de asistencia?")) return;
    
    setDeletingId(id);
    try {
      await deleteAssistance(id);
    } catch (error) {
      console.error("Error deleting assistance:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Agrupar asistencias por mes
  const assistancesByMonth = filteredAssistances.reduce((groups, assistance) => {
    const monthKey = getMonthKey(assistance.date);
    const monthName = getMonthName(assistance.date);
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        name: monthName,
        assistances: []
      };
    }
    groups[monthKey].assistances.push(assistance);
    return groups;
  }, {} as Record<string, { name: string; assistances: Assistance[] }>);

  if (isLoading) {
    return <div className="text-center py-8">Cargando registros de asistencia...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Estadísticas de asistencia */}
      <AssistanceStats assistances={assistances} />

      {/* Pestañas para cambiar entre vista lista y calendario */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          {/* Controles de filtrado y ordenamiento */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full max-w-xs">
              <Select value={orderBy} onValueChange={setOrderBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">
                    Fecha: más reciente primero
                  </SelectItem>
                  <SelectItem value="date_asc">
                    Fecha: más antiguo primero
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full max-w-xs">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estado de asistencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {getPresenceIcon(status)}
                        {getPresenceLabel(status)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estado vacío */}
          {Object.keys(assistancesByMonth).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <EmptyStateSVG />
              <p className="text-muted-foreground mt-4">No hay registros de asistencia</p>
            </div>
          )}

          {/* Registros de asistencia agrupados por mes */}
          {Object.entries(assistancesByMonth).map(([monthKey, monthData]) => {
            const { name, assistances } = monthData as { name: string; assistances: Assistance[] };
            return (
              <div key={monthKey} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CalendarDaysIcon className="size-5 text-primary" />
                  {name}
                </h3>
                
                <div className="grid gap-4">
                  {assistances.map((assistance: Assistance) => (
                    <div
                      key={assistance.id}
                      className="rounded-xl border border-border bg-card shadow-sm px-6 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="size-5 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {formatAssistanceDate(assistance.date)}
                            </span>
                          </div>
                          
                          <Badge className={getPresenceColor(assistance.presence)}>
                            <div className="flex items-center gap-1">
                              {getPresenceIcon(assistance.presence)}
                              {getPresenceLabel(assistance.presence)}
                            </div>
                          </Badge>
                        </div>

                        {/* Botones de acciones solo para admin/preceptor */}
                        {userInfo?.role &&
                          ["admin", "preceptor"].includes(userInfo.role) && (
                            <div className="flex gap-2">
                              <button
                                className="p-2 rounded-md transition-colors focus:outline-none text-foreground opacity-80 hover:opacity-100 hover:bg-muted"
                                title="Editar"
                                onClick={() => handleEdit(assistance)}
                              >
                                <PencilIcon className="size-4" />
                              </button>
                              <button
                                className="p-2 rounded-md transition-colors focus:outline-none text-foreground opacity-80 hover:opacity-100 hover:bg-muted"
                                title="Eliminar"
                                onClick={() => handleDelete(assistance.id)}
                                disabled={deletingId === assistance.id}
                              >
                                <TrashIcon className="size-4" />
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
        
        <TabsContent value="calendar">
          <AssistanceCalendar assistances={assistances} />
        </TabsContent>
      </Tabs>      {/* Modal de edición */}
      {editingAssistance && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg w-full max-w-md text-foreground">
            <h2 className="text-lg font-bold mb-4">Editar registro de asistencia</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editData.date}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Estado de asistencia</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                  value={editData.presence}
                  onChange={(e) =>
                    setEditData({ ...editData, presence: e.target.value })
                  }
                  required
                >
                  <option value="present">Presente</option>
                  <option value="absent">Ausente</option>
                  <option value="late">Tardanza</option>
                  <option value="justified">Justificado</option>
                </select>
              </div>
              
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={() => {
                    setEditingAssistance(null);
                    setEditData(null);
                  }}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={isSaving}
                >
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