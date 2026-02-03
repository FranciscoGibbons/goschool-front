"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useObservaciones } from "@/hooks/useObservaciones";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InlineSelectionBar from "@/components/InlineSelectionBar";
import userInfoStore from "@/store/userInfoStore";

interface Props {
  onClose: () => void;
}

export default function ObservacionForm({ onClose }: Props) {
  const { createObservacion, isLoading } = useObservaciones();
  const { userInfo } = userInfoStore();
  const {
    courses,
    students,
    selectedCourseId,
    selectedStudentId,
    setSelectedCourseId,
    setSelectedStudentId,
  } = useCourseStudentSelection(userInfo?.role || null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !selectedStudentId) return;
    const success = await createObservacion({ student_id: selectedStudentId, title, body });
    if (success) onClose();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={onClose} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="page-title">Nueva observacion</h1>
      </div>

      <InlineSelectionBar
        courses={courses}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        students={students}
        selectedStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
        showStudentSelector={true}
      />

      {selectedStudentId && (
        <Card>
          <CardHeader><CardTitle className="text-base">Datos de la observacion</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titulo</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo de la observacion" />
            </div>
            <div>
              <Label>Mensaje</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escriba la observacion..." rows={5} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="default" onClick={handleSubmit} disabled={isLoading || !title.trim() || !body.trim()}>
                Enviar observacion
              </Button>
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
