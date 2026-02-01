"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useCirculares } from "@/hooks/useCuaderno";
import { useUserCourses } from "@/hooks/useUserCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Props {
  onClose: () => void;
}

export default function CircularForm({ onClose }: Props) {
  const { createCircular, isLoading } = useCirculares();
  const { courses } = useUserCourses();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [requiresConfirmation, setRequiresConfirmation] = useState(true);

  const toggleCourse = (id: number) => {
    setSelectedCourses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || selectedCourses.length === 0) return;
    const success = await createCircular({ title, body, courses: selectedCourses, requires_confirmation: requiresConfirmation });
    if (success) onClose();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={onClose} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="page-title">Nueva circular</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la circular</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Titulo</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo de la circular" />
          </div>
          <div>
            <Label>Contenido</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Contenido de la circular" rows={6} />
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
          <div className="flex items-center gap-3">
            <Switch checked={requiresConfirmation} onCheckedChange={setRequiresConfirmation} />
            <Label>Requiere confirmacion de lectura</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="default" onClick={handleSubmit} disabled={isLoading || !title.trim() || !body.trim() || selectedCourses.length === 0}>
              Crear circular
            </Button>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
