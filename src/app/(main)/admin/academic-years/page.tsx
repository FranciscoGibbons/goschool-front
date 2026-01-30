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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Power,
} from "lucide-react";
import Link from "next/link";

interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  courses_count?: number;
  subjects_count?: number;
}

export default function AcademicYearsPage() {
  const router = useRouter();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_active: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deletingYear, setDeletingYear] = useState<AcademicYear | null>(null);

  const fetchYears = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/admin/academic/overview", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Error al cargar ciclos lectivos");
      }

      const data = await res.json();
      setYears(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  const handleCreate = () => {
    setEditingYear(null);
    setForm({
      name: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      is_active: false,
    });
    setDialogOpen(true);
  };

  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setForm({
      name: year.name,
      start_date: year.start_date,
      end_date: year.end_date || "",
      is_active: year.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.start_date) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingYear
        ? `/api/proxy/admin/academic-years/${editingYear.id}`
        : "/api/proxy/admin/academic-years";

      const method = editingYear ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          start_date: form.start_date,
          end_date: form.end_date || null,
          is_active: form.is_active,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar");
      }

      toast.success(
        editingYear
          ? "Ciclo lectivo actualizado correctamente"
          : "Ciclo lectivo creado correctamente"
      );
      setDialogOpen(false);
      fetchYears();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingYear) return;

    try {
      const res = await fetch(`/api/proxy/admin/academic-years/${deletingYear.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar");
      }

      toast.success("Ciclo lectivo eliminado correctamente");
      setDeletingYear(null);
      fetchYears();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleActivate = async (year: AcademicYear) => {
    try {
      const res = await fetch(`/api/proxy/admin/academic-years/${year.id}/activate`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al activar");
      }

      toast.success(`Ciclo lectivo "${year.name}" activado`);
      fetchYears();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Ciclos Lectivos</h1>
          <p className="text-muted-foreground">
            Administra los años académicos del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ciclo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ciclos Lectivos
          </CardTitle>
          <CardDescription>
            Gestiona los años académicos y activa el ciclo actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : years.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay ciclos lectivos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Cursos</TableHead>
                  <TableHead>Materias</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">{year.name}</TableCell>
                    <TableCell>{year.start_date}</TableCell>
                    <TableCell>{year.end_date || "-"}</TableCell>
                    <TableCell>{year.courses_count || 0}</TableCell>
                    <TableCell>{year.subjects_count || 0}</TableCell>
                    <TableCell>
                      {year.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!year.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleActivate(year)}
                          title="Activar ciclo"
                        >
                          <Power className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(year)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingYear(year)}
                        disabled={year.is_active}
                        title={year.is_active ? "No se puede eliminar el ciclo activo" : "Eliminar"}
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
            <DialogTitle>
              {editingYear ? "Editar Ciclo Lectivo" : "Nuevo Ciclo Lectivo"}
            </DialogTitle>
            <DialogDescription>
              {editingYear
                ? "Modifica los datos del ciclo lectivo"
                : "Crea un nuevo año académico"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Ej: Ciclo Lectivo 2025"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha Inicio *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha Fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Marcar como activo</Label>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
            {form.is_active && (
              <p className="text-sm text-muted-foreground">
                Esto desactivará cualquier otro ciclo lectivo actualmente activo.
              </p>
            )}
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
      <AlertDialog open={!!deletingYear} onOpenChange={() => setDeletingYear(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ciclo lectivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el ciclo lectivo{" "}
              <strong>{deletingYear?.name}</strong> y todos los cursos y materias asociados.
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
