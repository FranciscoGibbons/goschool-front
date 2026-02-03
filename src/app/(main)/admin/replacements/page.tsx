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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
} from "lucide-react";
import Link from "next/link";
import { fetchAllPages } from "@/utils/fetchAllPages";

interface Replacement {
  id: number;
  original_user_id: number;
  original_name: string;
  replacement_user_id: number;
  replacement_name: string;
  replacement_type: string;
  subject_id: number | null;
  subject_name: string | null;
  course_id: number | null;
  course_name: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserOption {
  id: number;
  full_name: string;
  email: string;
}

interface SubjectOption {
  id: number;
  name: string;
  course_name: string;
}

interface CourseOption {
  id: number;
  name: string;
}

function getStatus(r: Replacement): "active" | "expired" | "inactive" {
  if (!r.is_active) return "inactive";
  const today = new Date().toISOString().split("T")[0];
  if (r.start_date > today) return "inactive";
  if (r.end_date && r.end_date < today) return "expired";
  return "active";
}

function StatusBadge({ status }: { status: "active" | "expired" | "inactive" }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/15 text-green-700 border-green-500/30 hover:bg-green-500/25">Activo</Badge>;
    case "expired":
      return <Badge variant="secondary">Expirado</Badge>;
    case "inactive":
      return <Badge variant="destructive">Inactivo</Badge>;
  }
}

export default function ReplacementsPage() {
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [teachers, setTeachers] = useState<UserOption[]>([]);
  const [preceptors, setPreceptors] = useState<UserOption[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectOption[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReplacement, setEditingReplacement] = useState<Replacement | null>(null);
  const [form, setForm] = useState({
    replacement_type: "",
    original_user_id: "",
    replacement_user_id: "",
    subject_id: "",
    course_id: "",
    start_date: "",
    end_date: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deletingReplacement, setDeletingReplacement] = useState<Replacement | null>(null);

  const fetchReplacements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/admin/replacements", { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar suplencias");
      const data = await res.json();
      setReplacements(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar suplencias");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [teacherData, preceptorData] = await Promise.all([
        fetchAllPages<UserOption>("/api/proxy/students/", { role: "teacher" }),
        fetchAllPages<UserOption>("/api/proxy/students/", { role: "preceptor" }),
      ]);
      setTeachers(teacherData);
      setPreceptors(preceptorData);
    } catch (err) {
      console.error("Error loading options:", err);
    }
  }, []);

  const fetchSubjectsForTeacher = useCallback(async (teacherId: string) => {
    setIsLoadingOptions(true);
    try {
      const data = await fetchAllPages<SubjectOption>("/api/proxy/subjects/", { teacher_id: teacherId });
      setFilteredSubjects(data);
    } catch (err) {
      console.error("Error loading subjects:", err);
      setFilteredSubjects([]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  const fetchCoursesForPreceptor = useCallback(async (preceptorId: string) => {
    setIsLoadingOptions(true);
    try {
      const data = await fetchAllPages<CourseOption>("/api/proxy/courses/", { preceptor_id: preceptorId });
      setFilteredCourses(data);
    } catch (err) {
      console.error("Error loading courses:", err);
      setFilteredCourses([]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchReplacements();
    fetchOptions();
  }, [fetchReplacements, fetchOptions]);

  const handleCreate = () => {
    setEditingReplacement(null);
    setForm({
      replacement_type: "",
      original_user_id: "",
      replacement_user_id: "",
      subject_id: "",
      course_id: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setFilteredSubjects([]);
    setFilteredCourses([]);
    setDialogOpen(true);
  };

  const handleEdit = (replacement: Replacement) => {
    setEditingReplacement(replacement);
    setForm({
      replacement_type: replacement.replacement_type,
      original_user_id: replacement.original_user_id.toString(),
      replacement_user_id: replacement.replacement_user_id.toString(),
      subject_id: replacement.subject_id?.toString() || "",
      course_id: replacement.course_id?.toString() || "",
      start_date: replacement.start_date,
      end_date: replacement.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.replacement_type || !form.original_user_id || !form.replacement_user_id || !form.start_date) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    if (form.replacement_type === "teacher" && !form.subject_id) {
      toast.error("Selecciona una materia para suplencia de docente");
      return;
    }
    if (form.replacement_type === "preceptor" && !form.course_id) {
      toast.error("Selecciona un curso para suplencia de preceptor");
      return;
    }

    setIsSaving(true);
    try {
      if (editingReplacement) {
        // Update only end_date and is_active
        const res = await fetch(`/api/proxy/admin/replacements/${editingReplacement.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            end_date: form.end_date || null,
            is_active: editingReplacement.is_active,
          }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Error al actualizar");
        }
        toast.success("Suplencia actualizada correctamente");
      } else {
        const res = await fetch("/api/proxy/admin/replacements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            original_user_id: parseInt(form.original_user_id),
            replacement_user_id: parseInt(form.replacement_user_id),
            replacement_type: form.replacement_type,
            subject_id: form.subject_id ? parseInt(form.subject_id) : null,
            course_id: form.course_id ? parseInt(form.course_id) : null,
            start_date: form.start_date,
            end_date: form.end_date || null,
          }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Error al crear");
        }
        toast.success("Suplencia creada correctamente");
      }
      setDialogOpen(false);
      fetchReplacements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (replacement: Replacement) => {
    try {
      const res = await fetch(`/api/proxy/admin/replacements/${replacement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          is_active: !replacement.is_active,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al actualizar");
      }
      toast.success(replacement.is_active ? "Suplencia desactivada" : "Suplencia activada");
      fetchReplacements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleDelete = async () => {
    if (!deletingReplacement) return;
    try {
      const res = await fetch(`/api/proxy/admin/replacements/${deletingReplacement.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar");
      }
      toast.success("Suplencia eliminada correctamente");
      setDeletingReplacement(null);
      fetchReplacements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  // Users available for original selection based on type
  const originalUsers = form.replacement_type === "teacher" ? teachers : form.replacement_type === "preceptor" ? preceptors : [];
  // All teachers/preceptors can be replacements
  const replacementUsers = form.replacement_type === "teacher" ? teachers : form.replacement_type === "preceptor" ? preceptors : [];

  const filteredReplacements = replacements.filter(
    (r) =>
      r.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.replacement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.subject_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.course_name || "").toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Suplentes</h1>
          <p className="text-muted-foreground">Administra las suplencias de docentes y preceptores</p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="size-4" />
          Nueva Suplencia
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Suplencias ({filteredReplacements.length})
              </CardTitle>
              <CardDescription>
                Lista de suplencias activas y pasadas
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar suplencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredReplacements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay suplencias registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original</TableHead>
                  <TableHead>Suplente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Materia/Curso</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReplacements.map((replacement) => {
                  const status = getStatus(replacement);
                  return (
                    <TableRow key={replacement.id}>
                      <TableCell className="font-medium">{replacement.original_name}</TableCell>
                      <TableCell>{replacement.replacement_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {replacement.replacement_type === "teacher" ? "Docente" : "Preceptor"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {replacement.subject_name || replacement.course_name || "-"}
                      </TableCell>
                      <TableCell>{replacement.start_date}</TableCell>
                      <TableCell>{replacement.end_date || "Sin definir"}</TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(replacement)}
                          title={replacement.is_active ? "Desactivar" : "Activar"}
                        >
                          <UserCheck className={`h-4 w-4 ${replacement.is_active ? "text-green-600" : "text-muted-foreground"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(replacement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingReplacement(replacement)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReplacement ? "Editar Suplencia" : "Nueva Suplencia"}</DialogTitle>
            <DialogDescription>
              {editingReplacement
                ? "Modifica la fecha de fin o el estado de la suplencia"
                : "Asigna un suplente a un docente o preceptor"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingReplacement && (
              <>
                <div className="space-y-2">
                  <Label>Tipo de Suplencia *</Label>
                  <Select
                    value={form.replacement_type}
                    onValueChange={(value) => {
                      setForm({ ...form, replacement_type: value, original_user_id: "", replacement_user_id: "", subject_id: "", course_id: "" });
                      setFilteredSubjects([]);
                      setFilteredCourses([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Docente</SelectItem>
                      <SelectItem value="preceptor">Preceptor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.replacement_type && (
                  <>
                    <div className="space-y-2">
                      <Label>
                        {form.replacement_type === "teacher" ? "Docente Original *" : "Preceptor Original *"}
                      </Label>
                      <Select
                        value={form.original_user_id}
                        onValueChange={(value) => {
                          setForm({ ...form, original_user_id: value, subject_id: "", course_id: "" });
                          if (form.replacement_type === "teacher") {
                            fetchSubjectsForTeacher(value);
                          } else if (form.replacement_type === "preceptor") {
                            fetchCoursesForPreceptor(value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar usuario original" />
                        </SelectTrigger>
                        <SelectContent>
                          {originalUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id.toString()}>
                              {u.full_name || u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Suplente *</Label>
                      <Select
                        value={form.replacement_user_id}
                        onValueChange={(value) => setForm({ ...form, replacement_user_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar suplente" />
                        </SelectTrigger>
                        <SelectContent>
                          {replacementUsers
                            .filter((u) => u.id.toString() !== form.original_user_id)
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id.toString()}>
                                {u.full_name || u.email}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {form.replacement_type === "teacher" && form.original_user_id && (
                      <div className="space-y-2">
                        <Label>Materia *</Label>
                        <Select
                          value={form.subject_id}
                          onValueChange={(value) => setForm({ ...form, subject_id: value })}
                          disabled={isLoadingOptions}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingOptions ? "Cargando materias..." : "Seleccionar materia"} />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSubjects.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name} ({s.course_name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {form.replacement_type === "preceptor" && form.original_user_id && (
                      <div className="space-y-2">
                        <Label>Curso *</Label>
                        <Select
                          value={form.course_id}
                          onValueChange={(value) => setForm({ ...form, course_id: value })}
                          disabled={isLoadingOptions}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingOptions ? "Cargando cursos..." : "Seleccionar curso"} />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredCourses.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>Fecha de Inicio *</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                disabled={!!editingReplacement}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin (opcional)</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
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
      <AlertDialog open={!!deletingReplacement} onOpenChange={() => setDeletingReplacement(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suplencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara la suplencia de{" "}
              <strong>{deletingReplacement?.replacement_name}</strong> como suplente de{" "}
              <strong>{deletingReplacement?.original_name}</strong>.
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
