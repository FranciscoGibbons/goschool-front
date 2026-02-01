"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAutorizaciones } from "@/hooks/useCuaderno";
import { useUserCourses } from "@/hooks/useUserCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onClose: () => void;
}

export default function AutorizacionForm({ onClose }: Props) {
  const { createAutorizacion, isLoading } = useAutorizaciones();
  const { courses } = useUserCourses();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  const toggleCourse = (id: number) => {
    setSelectedCourses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || selectedCourses.length === 0) return;
    const success = await createAutorizacion({
      title,
      description,
      courses: selectedCourses,
      deadline: deadline || undefined,
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
        <h1 className="page-title">Nueva autorizacion</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la autorizacion</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Titulo</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo de la autorizacion" />
          </div>
          <div>
            <Label>Descripcion</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripcion detallada" rows={4} />
          </div>
          <div>
            <Label>Fecha limite (opcional)</Label>
            <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div>
            <Label>Cursos destinatarios</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {courses.map(c => (
                <Button
                  key={c.id}
                  variant={selectedCourses.includes(c.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCourse(c.id)}
                >
                  {c.year}° {c.division} ({c.level})
                </Button>
              ))}
            </div>
            {courses.length === 0 && <p className="text-sm text-text-muted mt-2">No hay cursos disponibles</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="default" onClick={handleSubmit} disabled={isLoading || !title.trim() || !description.trim() || selectedCourses.length === 0}>
              Crear autorizacion
            </Button>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
