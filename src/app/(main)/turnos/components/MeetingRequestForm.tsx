"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useMeetingRequests } from "@/hooks/useTurnos";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import InlineSelectionBar from "@/components/InlineSelectionBar";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";

interface AvailableUser {
  id: number;
  email: string;
  full_name: string | null;
  photo: string | null;
  course_id: number | null;
}

interface Props {
  onClose: () => void;
}

export default function MeetingRequestForm({ onClose }: Props) {
  const { createRequest, isLoading } = useMeetingRequests();
  const { userInfo } = userInfoStore();
  const { children, selectedChild, setSelectedChild } = childSelectionStore();
  const isFather = userInfo?.role === "father";
  const isStaff = userInfo?.role === "teacher" || userInfo?.role === "preceptor" || userInfo?.role === "admin";

  const {
    courses,
    students,
    selectedCourseId,
    selectedStudentId,
    setSelectedCourseId,
    setSelectedStudentId,
  } = useCourseStudentSelection(userInfo?.role || null);

  const [subject, setSubject] = useState("");
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [location, setLocation] = useState("");

  // For fathers: list of available staff to choose from
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // For staff: auto-resolved parents of selected student
  const [parentUsers, setParentUsers] = useState<AvailableUser[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  // Fathers: fetch available users (staff) to pick from
  const fetchAvailableUsers = useCallback(async () => {
    if (!isFather) return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/proxy/chats/available-users");
      if (res.ok) {
        const data: AvailableUser[] = await res.json();
        setAvailableUsers(data);
      }
    } catch {
      toast.error("Error al cargar destinatarios");
    } finally {
      setLoadingUsers(false);
    }
  }, [isFather]);

  useEffect(() => {
    fetchAvailableUsers();
  }, [fetchAvailableUsers]);

  // Staff: auto-resolve parents when student is selected
  useEffect(() => {
    if (!isStaff || !selectedStudentId) {
      setParentUsers([]);
      setReceiverId(null);
      return;
    }

    const fetchParents = async () => {
      setLoadingParents(true);
      try {
        const res = await fetch(`/api/proxy/students/${selectedStudentId}/parents`);
        if (res.ok) {
          const data: AvailableUser[] = await res.json();
          setParentUsers(data);
          if (data.length === 1) {
            setReceiverId(data[0].id);
          } else {
            setReceiverId(null);
          }
        }
      } catch {
        toast.error("Error al obtener padres del alumno");
      } finally {
        setLoadingParents(false);
      }
    };

    fetchParents();
  }, [isStaff, selectedStudentId]);

  const handleSubmit = async () => {
    if (!subject.trim() || !receiverId || !selectedStudentId) return;
    const success = await createRequest({
      receiver_id: receiverId,
      student_id: selectedStudentId,
      subject,
      scheduled_date: scheduledDate || undefined,
      scheduled_time: scheduledTime || undefined,
      location: location.trim() || undefined,
    });
    if (success) onClose();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={onClose} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="page-title">Nueva solicitud de reunion</h1>
      </div>

      {/* Staff: select course and student */}
      {isStaff && (
        <InlineSelectionBar
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
          students={students}
          selectedStudentId={selectedStudentId}
          onStudentChange={setSelectedStudentId}
          showStudentSelector={true}
        />
      )}

      {/* Father: select child */}
      {isFather && (
        <Card>
          <CardContent className="pt-4">
            <Label>Hijo/a</Label>
            {children.length === 0 ? (
              <p className="text-sm text-text-muted py-2">No se encontraron hijos registrados</p>
            ) : (
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedChild?.id || ""}
                onChange={e => {
                  const childId = Number(e.target.value) || null;
                  if (childId) {
                    const child = children.find(c => c.id === childId);
                    if (child) setSelectedChild(child);
                  }
                }}
              >
                <option value="">Seleccione un hijo/a</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} {child.last_name}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la solicitud</CardTitle></CardHeader>
        <CardContent className="space-y-4">

          {/* Staff: show auto-resolved parent(s) */}
          {isStaff && selectedStudentId && (
            <div>
              <Label>Destinatario (padre/madre)</Label>
              {loadingParents ? (
                <div className="flex items-center gap-2 py-2"><LoadingSpinner size="sm" /> <span className="text-sm text-text-muted">Buscando padres...</span></div>
              ) : parentUsers.length === 0 ? (
                <p className="text-sm text-text-muted py-2">No se encontraron padres registrados para este alumno</p>
              ) : parentUsers.length === 1 ? (
                <p className="text-sm text-text-primary py-2">{parentUsers[0].full_name || parentUsers[0].email}</p>
              ) : (
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={receiverId || ""}
                  onChange={e => setReceiverId(Number(e.target.value) || null)}
                >
                  <option value="">Seleccione un padre/madre</option>
                  {parentUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Father: select staff recipient */}
          {isFather && (
            <div>
              <Label>Destinatario</Label>
              {loadingUsers ? (
                <div className="flex items-center gap-2 py-2"><LoadingSpinner size="sm" /> <span className="text-sm text-text-muted">Cargando...</span></div>
              ) : (
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={receiverId || ""}
                  onChange={e => setReceiverId(Number(e.target.value) || null)}
                >
                  <option value="">Seleccione un destinatario</option>
                  {availableUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <Label>Asunto / Motivo</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Motivo de la reunion" />
          </div>

          {isStaff && (
            <div className="space-y-3 p-3 rounded-md border border-border">
              <p className="text-sm font-medium text-text-primary">Proponer fecha y lugar (opcional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Fecha</Label>
                  <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Lugar</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Sala de reuniones" />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={isLoading || !subject.trim() || !receiverId || !selectedStudentId}
            >
              Enviar solicitud
            </Button>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
