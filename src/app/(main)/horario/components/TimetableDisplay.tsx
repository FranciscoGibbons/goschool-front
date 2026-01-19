"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import useSubjectsStore from "@/store/subjectsStore";
import userInfoStore from "@/store/userInfoStore";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/sacred";

import { ChevronLeft, Plus, Pencil, Trash2, Clock } from "lucide-react";
import axios from "axios";


interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
}



interface TimetableDisplayProps {
  courseId: number;
  onBack: () => void;
  initialTimetables?: Timetable[];
}

const DAYS = [
  { en: "Monday", es: "Lun" },
  { en: "Tuesday", es: "Mar" },
  { en: "Wednesday", es: "Mie" },
  { en: "Thursday", es: "Jue" },
  { en: "Friday", es: "Vie" },
];

const TIME_SLOTS = [
  "07:20",
  "08:00",
  "08:50",
  "09:30",
  "10:25",
  "11:00",
  "11:50",
  "12:30",
];

export default function TimetableDisplay({
  courseId,
  onBack,
  initialTimetables,
}: TimetableDisplayProps) {
  const [timetables, setTimetables] = useState<Timetable[]>(
    initialTimetables || []
  );
  const [loading, setLoading] = useState(!initialTimetables);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Timetable | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    subject_id: "",
    day: "",
    start_time: "",
    end_time: "",
  });

  const { subjects, setSubjects } = useSubjectsStore();

  const { userInfo } = userInfoStore();

  const canEdit =
    userInfo?.role === "admin" || userInfo?.role === "preceptor";

  useEffect(() => {
    const fetchData = async () => {
      if (initialTimetables && initialTimetables.length > 0) {
        setTimetables(initialTimetables);
        setLoading(false);
        return;
      }

      if (!courseId) return;

      try {
        setLoading(true);
        const [timetablesRes, subjectsRes] = await Promise.all([
          axios.get(`/api/timetables?course_id=${courseId}`),
          axios.get(`/api/subjects?course_id=${courseId}`),
        ]);

        setTimetables(
          Array.isArray(timetablesRes.data) ? timetablesRes.data : []
        );
        setSubjects(
          Array.isArray(subjectsRes.data) ? subjectsRes.data : []
        );
      } catch (error) {
        console.error("Error loading timetable:", error);
        toast.error("Error al cargar horario");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, initialTimetables, setSubjects]);

  const getSubjectName = (subjectId: number): string => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return "";
    return subject.name.replace(/\s*-\s*\d+°\d+\s*$/, "").trim();
  };

  const getTimetableForCell = (
    day: string,
    timeSlot: string
  ): Timetable | undefined => {
    return timetables.find((t) => {
      if (t.day !== day) return false;
      const startTime = t.start_time.substring(0, 5);
      return startTime === timeSlot;
    });
  };

  const handleOpenDialog = (entry?: Timetable) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        subject_id: String(entry.subject_id),
        day: entry.day,
        start_time: entry.start_time.substring(0, 5),
        end_time: entry.end_time.substring(0, 5),
      });
    } else {
      setEditingEntry(null);
      setFormData({
        subject_id: "",
        day: "",
        start_time: "",
        end_time: "",
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.subject_id || !formData.day || !formData.start_time) {
      toast.error("Completa todos los campos");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        course_id: courseId,
        subject_id: Number(formData.subject_id),
        day: formData.day,
        start_time: formData.start_time + ":00",
        end_time: (formData.end_time || "08:40") + ":00",
      };

      if (editingEntry) {
        await axios.put(`/api/proxy/timetables/${editingEntry.id}/`, payload, {
          withCredentials: true,
        });
        setTimetables((prev) =>
          prev.map((t) =>
            t.id === editingEntry.id ? { ...t, ...payload } : t
          )
        );
        toast.success("Horario actualizado");
      } else {
        const res = await axios.post("/api/proxy/timetables/", payload, {
          withCredentials: true,
        });
        setTimetables((prev) => [...prev, { ...payload, id: res.data.id }]);
        toast.success("Horario creado");
      }

      setShowDialog(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error saving timetable:", error);
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar este horario?")) return;

    try {
      await axios.delete(`/api/proxy/timetables/${id}/`, {
        withCredentials: true,
      });
      setTimetables((prev) => prev.filter((t) => t.id !== id));
      toast.success("Horario eliminado");
    } catch (error) {
      console.error("Error deleting timetable:", error);
      toast.error("Error al eliminar");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando horario...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>

        {canEdit && (
          <Button size="sm" onClick={() => handleOpenDialog()} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </Button>
        )}
      </div>

      {/* Timetable grid */}
      {timetables.length > 0 || canEdit ? (
        <div className="overflow-x-auto">
          <div className="timetable-grid min-w-[600px]">
            {/* Header row */}
            <div className="timetable-header">Hora</div>
            {DAYS.map((day) => (
              <div key={day.en} className="timetable-header">
                {day.es}
              </div>
            ))}

            {/* Time slots */}
            {TIME_SLOTS.map((slot) => (

              <React.Fragment key={slot}>
                <div className="timetable-time">
                  {slot.replace(":", "h")}
                </div>
                {DAYS.map((day) => {
                  const entry = getTimetableForCell(day.en, slot);
                  return (
                    <div key={`${day.en}-${slot}`} className="timetable-cell">
                      {entry ? (
                        <div className="timetable-subject group relative">
                          <span className="text-xs">
                            {getSubjectName(entry.subject_id)}
                          </span>
                          {canEdit && (
                            <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                              <button
                                onClick={() => handleOpenDialog(entry)}
                                className="p-1 bg-background rounded shadow-sm hover:bg-accent"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="p-1 bg-background rounded shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : canEdit ? (
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              day: day.en,
                              start_time: slot,
                            });
                            setShowDialog(true);
                          }}
                          className="w-full h-full flex items-center justify-center text-text-muted/40 hover:text-text-secondary hover:bg-surface-muted rounded transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>

                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="sacred-card text-center py-8">
          <Clock className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Sin horarios</p>
          <p className="text-sm text-text-secondary mt-1">
            No hay horarios configurados para este curso
          </p>
        </div>

      )}

      {/* Add/Edit Dialog */}
      <Modal open={showDialog} onOpenChange={setShowDialog}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>
              {editingEntry ? "Editar horario" : "Agregar horario"}
            </ModalTitle>
          </ModalHeader>

          <div className="space-y-4">
            <div>
              <Label>Materia</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => handleInputChange("subject_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dia</Label>
              <Select
                value={formData.day}
                onValueChange={(value) => handleInputChange("day", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d.en} value={d.en}>
                      {d.es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hora inicio</Label>
                <Select
                  value={formData.start_time}
                  onValueChange={(value) => handleInputChange("start_time", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Hora fin</Label>
                <Select
                  value={formData.end_time}
                  onValueChange={(value) => handleInputChange("end_time", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </ModalContent>
      </Modal>

    </div>
  );
}
