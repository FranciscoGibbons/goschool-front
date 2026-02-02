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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  GraduationCap,
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

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
  name: string;
  preceptor_id: number | null;
}

interface Teacher {
  id: number;
  full_name: string;
  email: string;
}

const LEVELS = [
  { value: "primary", label: "Primaria" },
  { value: "secondary", label: "Secundaria" },
];

const SHIFTS = [
  { value: "morning", label: "Mañana" },
  { value: "afternoon", label: "Tarde" },
];

const DIVISIONS_PRIMARY = ["1", "2", "3"]; // Mar, Gaviota, Estrella
const DIVISIONS_SECONDARY = ["1", "2", "3"]; // a, b, c

const getDivisionLabel = (division: string, level: string) => {
  if (level === "primary") {
    switch (division) {
      case "1": return "Mar";
      case "2": return "Gaviota";
      case "3": return "Estrella";
      default: return division;
    }
  } else {
    switch (division) {
      case "1": return "A";
      case "2": return "B";
      case "3": return "C";
      default: return division;
    }
  }
};

export default function CoursesPage() {
  const router = useRouter();
  const { academicYears, selectedYearId, setSelectedYearId, isLoading: isLoadingYears } = useAcademicYears();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({
    year: 1,
    division: "1",
    level: "secondary",
    shift: "morning",
    name: "",
    preceptor_id: "",
    customDivisionLabel: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!selectedYearId) return;

    setIsLoading(true);
    try {
      const data = await fetchAllPages<Course>("/api/proxy/courses/", {
        academic_year_id: selectedYearId,
      });
      setCourses(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar cursos");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYearId]);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await fetchAllPages<Teacher>("/api/proxy/students/", {
        role: "preceptor",
      });
      setTeachers(data);
    } catch (err) {
      console.error("Error loading teachers:", err);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [fetchCourses, fetchTeachers]);

  const generateCourseName = (year: number, division: string, level: string, customLabel?: string) => {
    const divLabel = customLabel || getDivisionLabel(division, level);
    const levelLabel = level === "primary" ? "Primaria" : "Secundaria";
    return `${year}° ${levelLabel} ${divLabel}`;
  };

  const handleCreate = () => {
    setEditingCourse(null);
    const defaultName = generateCourseName(1, "1", "secondary");
    setForm({
      year: 1,
      division: "1",
      level: "secondary",
      shift: "morning",
      name: defaultName,
      preceptor_id: "",
      customDivisionLabel: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    // Try to extract custom label: if name follows pattern "X° Level LABEL"
    const defaultDiv = getDivisionLabel(course.division, course.level);
    const prefix = `${course.year}° ${course.level === "primary" ? "Primaria" : "Secundaria"} `;
    const extractedLabel = course.name.startsWith(prefix)
      ? course.name.slice(prefix.length)
      : "";
    const isCustom = extractedLabel && extractedLabel !== defaultDiv;

    setForm({
      year: course.year,
      division: course.division,
      level: course.level,
      shift: course.shift,
      name: course.name,
      preceptor_id: course.preceptor_id?.toString() || "",
      customDivisionLabel: isCustom ? extractedLabel : "",
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field: string, value: string | number) => {
    const newForm = { ...form, [field]: value };

    // Reset custom label when level changes (different default labels)
    if (field === "level") {
      newForm.customDivisionLabel = "";
    }

    // Auto-generate name when year, division, level, or custom label changes
    if (field === "year" || field === "division" || field === "level" || field === "customDivisionLabel") {
      const year = field === "year" ? value as number : newForm.year;
      const division = field === "division" ? value as string : newForm.division;
      const level = field === "level" ? value as string : newForm.level;
      const custom = field === "customDivisionLabel" ? value as string : newForm.customDivisionLabel;
      newForm.name = generateCourseName(year, division, level, custom || undefined);
    }

    setForm(newForm);
  };

  const handleSave = async () => {
    if (!form.name || !selectedYearId) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingCourse
        ? `/api/proxy/admin/courses/${editingCourse.id}`
        : "/api/proxy/admin/courses";

      const method = editingCourse ? "PUT" : "POST";

      const payload = editingCourse
        ? {
            year: form.year,
            division: form.division,
            level: form.level,
            shift: form.shift,
            name: form.name,
            preceptor_id: form.preceptor_id ? parseInt(form.preceptor_id) : null,
          }
        : {
            year: form.year,
            division: form.division,
            level: form.level,
            shift: form.shift,
            name: form.name,
            preceptor_id: form.preceptor_id ? parseInt(form.preceptor_id) : null,
            academic_year_id: selectedYearId,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar");
      }

      toast.success(
        editingCourse ? "Curso actualizado correctamente" : "Curso creado correctamente"
      );
      setDialogOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;

    try {
      const res = await fetch(`/api/proxy/admin/courses/${deletingCourse.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar");
      }

      toast.success("Curso eliminado correctamente");
      setDeletingCourse(null);
      fetchCourses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const divisions = form.level === "primary" ? DIVISIONS_PRIMARY : DIVISIONS_SECONDARY;
  const maxYear = form.level === "primary" ? 7 : 6;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground">Administra los cursos del sistema</p>
        </div>
        <Button onClick={handleCreate} disabled={!selectedYearId}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
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
                <GraduationCap className="h-5 w-5" />
                Cursos ({filteredCourses.length})
              </CardTitle>
              <CardDescription>Lista de cursos del ciclo lectivo seleccionado</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar curso..."
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
              Selecciona un ciclo lectivo para ver los cursos
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay cursos registrados en este ciclo lectivo
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>División</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.year}°</TableCell>
                    <TableCell>{getDivisionLabel(course.division, course.level)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {course.level === "primary" ? "Primaria" : "Secundaria"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {course.shift === "morning" ? "Mañana" : "Tarde"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCourse(course)}
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
            <DialogTitle>{editingCourse ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Modifica los datos del curso" : "Crea un nuevo curso"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Nivel *</Label>
                <Select
                  value={form.level}
                  onValueChange={(value) => handleFormChange("level", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año *</Label>
                <Select
                  value={form.year.toString()}
                  onValueChange={(value) => handleFormChange("year", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxYear }, (_, i) => i + 1).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}°
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="division">División *</Label>
                <Select
                  value={form.division}
                  onValueChange={(value) => handleFormChange("division", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {getDivisionLabel(d, form.level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Turno *</Label>
                <Select
                  value={form.shift}
                  onValueChange={(value) => handleFormChange("shift", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((shift) => (
                      <SelectItem key={shift.value} value={shift.value}>
                        {shift.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDivisionLabel">Nombre personalizado de la division (opcional)</Label>
              <Input
                id="customDivisionLabel"
                value={form.customDivisionLabel}
                onChange={(e) => handleFormChange("customDivisionLabel", e.target.value)}
                placeholder={getDivisionLabel(form.division, form.level)}
              />
              <p className="text-xs text-muted-foreground">
                Por defecto: <strong>{getDivisionLabel(form.division, form.level)}</strong>. Deja vacio para usar el nombre por defecto.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Curso *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preceptor">Preceptor</Label>
              <Select
                value={form.preceptor_id || "none"}
                onValueChange={(value) => setForm({ ...form, preceptor_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin preceptor asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin preceptor</SelectItem>
                  {teachers.map((teacher) => (
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
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCourse} onOpenChange={() => setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el curso{" "}
              <strong>{deletingCourse?.name}</strong> y todas las materias, estudiantes y datos
              asociados.
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
