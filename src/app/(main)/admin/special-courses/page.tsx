"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { fetchAllPages } from "@/utils/fetchAllPages";

interface SpecialCourseWithTeacher {
  id: number;
  name: string;
  teacher_id: number;
  teacher_name: string;
  academic_year_id: number;
  academic_year_name: string;
  student_count: number;
}

interface AcademicYearOption {
  id: number;
  name: string;
  is_active: boolean;
}

interface TeacherOption {
  id: number;
  full_name: string;
  email: string;
}

interface StudentOption {
  id: number;
  full_name: string;
  email: string;
}

interface TimetableEntry {
  day: string;
  start_time: string;
  end_time: string;
}

export default function SpecialCoursesPage() {
  const router = useRouter();
  const [specialCourses, setSpecialCourses] = useState<SpecialCourseWithTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({ name: "", teacher_id: "", academic_year_id: "" });
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  // Options for selects
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);

  // Delete dialog
  const [deletingCourse, setDeletingCourse] = useState<SpecialCourseWithTeacher | null>(null);

  const fetchSpecialCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/admin/special-courses", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Error al cargar cursos especiales");
      }
      const data = await res.json();
      setSpecialCourses(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSpecialCourses();
  }, [fetchSpecialCourses]);

  const loadFormOptions = async () => {
    const [years, teacherList, studentList] = await Promise.all([
      fetch("/api/proxy/academic_years/", { credentials: "include" }).then(r => r.ok ? r.json() : []),
      fetchAllPages<TeacherOption>("/api/proxy/students/", { role: "teacher" }),
      fetchAllPages<StudentOption>("/api/proxy/students/", { role: "student" }),
    ]);
    setAcademicYears(years);
    setTeachers(teacherList);
    setStudents(studentList);
    return years as AcademicYearOption[];
  };

  const handleCreate = async () => {
    setEditingId(null);
    setForm({ name: "", teacher_id: "", academic_year_id: "" });
    setTimetables([]);
    setSelectedStudents([]);
    setStudentSearch("");
    setDialogOpen(true);

    try {
      const years = await loadFormOptions();
      const active = years.find((y) => y.is_active);
      if (active) {
        setForm(prev => ({ ...prev, academic_year_id: active.id.toString() }));
      }
    } catch { /* ignore */ }
  };

  const handleEdit = async (sc: SpecialCourseWithTeacher) => {
    setEditingId(sc.id);
    setForm({ name: "", teacher_id: "", academic_year_id: "" });
    setTimetables([]);
    setSelectedStudents([]);
    setStudentSearch("");
    setLoadingDetail(true);
    setDialogOpen(true);

    try {
      const [detailRes] = await Promise.all([
        fetch(`/api/proxy/admin/special-courses/${sc.id}`, { credentials: "include" }),
        loadFormOptions(),
      ]);

      if (detailRes.ok) {
        const detail = await detailRes.json();
        setForm({
          name: detail.name,
          teacher_id: detail.teacher_id.toString(),
          academic_year_id: detail.academic_year_id.toString(),
        });
        setTimetables(
          (detail.timetables || []).map((t: { day: string; start_time: string; end_time: string }) => ({
            day: t.day,
            start_time: t.start_time.slice(0, 5),
            end_time: t.end_time.slice(0, 5),
          }))
        );
        setSelectedStudents(detail.student_ids || []);
      }
    } catch { /* ignore */ } finally {
      setLoadingDetail(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.teacher_id || (!editingId && !form.academic_year_id)) {
      toast.error("Completar nombre, docente y ciclo lectivo");
      return;
    }
    setIsSaving(true);
    try {
      const timetablesPayload = timetables.map(t => ({
        day: t.day,
        start_time: t.start_time + ":00",
        end_time: t.end_time + ":00",
      }));

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/proxy/admin/special-courses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: form.name.trim(),
            teacher_id: parseInt(form.teacher_id),
            timetables: timetablesPayload,
            student_ids: selectedStudents,
          }),
        });
      } else {
        res = await fetch("/api/proxy/admin/special-courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: form.name.trim(),
            teacher_id: parseInt(form.teacher_id),
            academic_year_id: parseInt(form.academic_year_id),
            timetables: timetablesPayload,
            student_ids: selectedStudents,
          }),
        });
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || (editingId ? "Error al actualizar" : "Error al crear"));
      }
      toast.success(editingId ? "Curso especial actualizado correctamente" : "Curso especial creado correctamente");
      setDialogOpen(false);
      fetchSpecialCourses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    try {
      const res = await fetch(`/api/proxy/admin/special-courses/${deletingCourse.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar");
      }
      toast.success("Curso especial eliminado correctamente");
      setDeletingCourse(null);
      fetchSpecialCourses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleAddTimetable = () => {
    setTimetables(prev => [...prev, { day: "Monday", start_time: "08:00", end_time: "09:00" }]);
  };

  const handleRemoveTimetable = (index: number) => {
    setTimetables(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Cursos Especiales</h1>
          <p className="text-muted-foreground">
            Administra los cursos especiales del sistema
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="size-4" />
          Nuevo Curso Especial
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Cursos Especiales
          </CardTitle>
          <CardDescription>
            Cursos especiales con horarios y alumnos asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : specialCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay cursos especiales registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Docente</TableHead>
                  <TableHead>Ciclo Lectivo</TableHead>
                  <TableHead className="text-center">Alumnos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialCourses.map((sc) => (
                  <TableRow key={sc.id}>
                    <TableCell className="font-medium">{sc.name}</TableCell>
                    <TableCell>{sc.teacher_name}</TableCell>
                    <TableCell>{sc.academic_year_name}</TableCell>
                    <TableCell className="text-center">{sc.student_count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(sc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCourse(sc)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Curso Especial" : "Nuevo Curso Especial"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Modificar los datos del curso especial" : "Crear un curso especial con horarios y alumnos"}
            </DialogDescription>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    placeholder="Ej: Taller de arte"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciclo Lectivo *</Label>
                  <select
                    value={form.academic_year_id}
                    onChange={(e) => setForm(prev => ({ ...prev, academic_year_id: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    disabled={!!editingId}
                  >
                    <option value="">Seleccionar</option>
                    {academicYears.map(y => (
                      <option key={y.id} value={y.id}>{y.name}{y.is_active ? " (Activo)" : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Docente *</Label>
                  <select
                    value={form.teacher_id}
                    onChange={(e) => setForm(prev => ({ ...prev, teacher_id: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Seleccionar docente</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
                    ))}
                  </select>
                </div>

                {/* Timetables */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Horarios
                    </Label>
                    <Button variant="outline" size="sm" onClick={handleAddTimetable}>
                      <Plus className="h-3 w-3 mr-1" /> Agregar
                    </Button>
                  </div>
                  {timetables.map((tt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={tt.day}
                        onChange={(e) => {
                          const updated = [...timetables];
                          updated[idx].day = e.target.value;
                          setTimetables(updated);
                        }}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm flex-1"
                      >
                        <option value="Monday">Lunes</option>
                        <option value="Tuesday">Martes</option>
                        <option value="Wednesday">Miércoles</option>
                        <option value="Thursday">Jueves</option>
                        <option value="Friday">Viernes</option>
                      </select>
                      <Input
                        type="time"
                        value={tt.start_time}
                        onChange={(e) => {
                          const updated = [...timetables];
                          updated[idx].start_time = e.target.value;
                          setTimetables(updated);
                        }}
                        className="h-8 w-24 text-sm"
                      />
                      <span className="text-muted-foreground text-sm">a</span>
                      <Input
                        type="time"
                        value={tt.end_time}
                        onChange={(e) => {
                          const updated = [...timetables];
                          updated[idx].end_time = e.target.value;
                          setTimetables(updated);
                        }}
                        className="h-8 w-24 text-sm"
                      />
                      <button onClick={() => handleRemoveTimetable(idx)} className="text-destructive p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Student selection */}
                <div className="space-y-2">
                  <Label>Alumnos ({selectedStudents.length} seleccionados)</Label>
                  <Input
                    placeholder="Buscar alumno..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                    {students
                      .filter(s =>
                        (s.full_name || s.email).toLowerCase().includes(studentSearch.toLowerCase())
                      )
                      .slice(0, 50)
                      .map(s => (
                        <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted rounded px-1 py-0.5">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents(prev => [...prev, s.id]);
                              } else {
                                setSelectedStudents(prev => prev.filter(id => id !== s.id));
                              }
                            }}
                          />
                          {s.full_name || s.email}
                        </label>
                      ))}
                    {students.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">Cargando alumnos...</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving
                    ? (editingId ? "Guardando..." : "Creando...")
                    : (editingId ? "Guardar Cambios" : "Crear Curso Especial")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCourse} onOpenChange={() => setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso especial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el curso especial{" "}
              <strong>{deletingCourse?.name}</strong> y todas las inscripciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
