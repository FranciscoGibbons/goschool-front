"use client";

import { useEffect, useState, useCallback } from "react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
} from "lucide-react";
import Link from "next/link";
import { fetchAllPages } from "@/utils/fetchAllPages";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";

interface Subject {
  id: number;
  name: string;
  course_id: number;
  teacher_id: number;
  course_name: string;
}

interface Course {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  full_name: string;
  email: string;
}

export default function SubjectsPage() {
  const { academicYears, selectedYearId, setSelectedYearId, isLoading: isLoadingYears } = useAcademicYears();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState({
    name: "",
    course_id: "",
    teacher_id: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Dialog-internal state for self-contained creation
  const [dialogYearId, setDialogYearId] = useState<string>("");
  const [dialogCourses, setDialogCourses] = useState<Course[]>([]);
  const [dialogTeachers, setDialogTeachers] = useState<Teacher[]>([]);
  const [isLoadingDialogData, setIsLoadingDialogData] = useState(false);

  // Delete dialog state
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const fetchSubjects = useCallback(async () => {
    if (!selectedYearId) return;

    setIsLoading(true);
    try {
      const data = await fetchAllPages<Subject>("/api/proxy/subjects/", {
        academic_year_id: selectedYearId,
      });
      setSubjects(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar materias");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYearId]);

  const fetchCourses = useCallback(async () => {
    if (!selectedYearId) return;

    try {
      const data = await fetchAllPages<Course>("/api/proxy/courses/", {
        academic_year_id: selectedYearId,
      });
      setCourses(data);
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  }, [selectedYearId]);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await fetchAllPages<Teacher>("/api/proxy/students/", {
        role: "teacher",
      });
      setTeachers(data);
    } catch (err) {
      console.error("Error loading teachers:", err);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchCourses();
    fetchTeachers();
  }, [fetchSubjects, fetchCourses, fetchTeachers]);

  const handleCreate = async () => {
    setEditingSubject(null);
    setForm({ name: "", course_id: "", teacher_id: "" });
    // Pre-select the page's current year if available
    const preselectedYear = selectedYearId ? selectedYearId.toString() : "";
    setDialogYearId(preselectedYear);
    setDialogCourses([]);
    setDialogOpen(true);

    // Load teachers for the dialog
    setIsLoadingDialogData(true);
    try {
      const teacherData = await fetchAllPages<Teacher>("/api/proxy/students/", { role: "teacher" });
      setDialogTeachers(teacherData);
    } catch { /* ignore */ }

    // If a year is pre-selected, load its courses
    if (preselectedYear) {
      try {
        const courseData = await fetchAllPages<Course>("/api/proxy/courses/", {
          academic_year_id: parseInt(preselectedYear),
        });
        setDialogCourses(courseData);
      } catch { /* ignore */ }
    }
    setIsLoadingDialogData(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({
      name: subject.name,
      course_id: subject.course_id.toString(),
      teacher_id: subject.teacher_id.toString(),
    });
    // For editing, use the page's existing courses and teachers
    setDialogYearId(selectedYearId ? selectedYearId.toString() : "");
    setDialogCourses(courses);
    setDialogTeachers(teachers);
    setDialogOpen(true);
  };

  const handleDialogYearChange = async (yearId: string) => {
    setDialogYearId(yearId);
    setForm((prev) => ({ ...prev, course_id: "" }));
    setDialogCourses([]);
    if (!yearId) return;
    try {
      const courseData = await fetchAllPages<Course>("/api/proxy/courses/", {
        academic_year_id: parseInt(yearId),
      });
      setDialogCourses(courseData);
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    if (!form.name || !form.course_id || !form.teacher_id) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingSubject
        ? `/api/proxy/admin/subjects/${editingSubject.id}`
        : "/api/proxy/admin/subjects";

      const method = editingSubject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          course_id: parseInt(form.course_id),
          teacher_id: parseInt(form.teacher_id),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar");
      }

      toast.success(
        editingSubject ? "Materia actualizada correctamente" : "Materia creada correctamente"
      );
      setDialogOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSubject) return;

    try {
      const res = await fetch(`/api/proxy/admin/subjects/${deletingSubject.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar");
      }

      toast.success("Materia eliminada correctamente");
      setDeletingSubject(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher?.full_name || teacher?.email || `Docente #${teacherId}`;
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Materias</h1>
          <p className="text-muted-foreground">Administra las materias del sistema</p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="size-4" />
          Nueva Materia
        </Button>
      </div>

      {/* Year Selector */}
      {academicYears.length > 0 && (
        <div className="flex items-center gap-4">
          <Label>Ciclo Lectivo:</Label>
          <AcademicYearSelector
            academicYears={academicYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
            disabled={isLoadingYears}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Materias ({filteredSubjects.length})
              </CardTitle>
              <CardDescription>
                Lista de materias del ciclo lectivo seleccionado
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || isLoadingYears ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !selectedYearId ? (
            <div className="text-center py-8 text-muted-foreground">
              Selecciona un ciclo lectivo para ver las materias
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay materias registradas en este ciclo lectivo
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Docente</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-mono text-sm">{subject.id}</TableCell>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.course_name}</TableCell>
                    <TableCell>{getTeacherName(subject.teacher_id)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingSubject(subject)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Editar Materia" : "Nueva Materia"}</DialogTitle>
            <DialogDescription>
              {editingSubject ? "Modifica los datos de la materia" : "Crea una nueva materia"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Materia *</Label>
              <Input
                id="name"
                placeholder="Ej: Matemática"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {!editingSubject && (
              <div className="space-y-2">
                <Label htmlFor="dialog-year">Ciclo Lectivo *</Label>
                <Select
                  value={dialogYearId}
                  onValueChange={handleDialogYearChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ciclo lectivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id.toString()}>
                        {year.name}{year.is_active ? " (Activo)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="course">Curso *</Label>
              <Select
                value={form.course_id}
                onValueChange={(value) => setForm({ ...form, course_id: value })}
                disabled={!editingSubject && !dialogYearId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!editingSubject && !dialogYearId ? "Selecciona un ciclo lectivo primero" : "Seleccionar curso"} />
                </SelectTrigger>
                <SelectContent>
                  {dialogCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Docente *</Label>
              <Select
                value={form.teacher_id}
                onValueChange={(value) => setForm({ ...form, teacher_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar docente" />
                </SelectTrigger>
                <SelectContent>
                  {dialogTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.full_name || teacher.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isLoadingDialogData}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSubject} onOpenChange={() => setDeletingSubject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar materia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la materia{" "}
              <strong>{deletingSubject?.name}</strong> y todos los datos asociados (evaluaciones,
              calificaciones, etc.).
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
