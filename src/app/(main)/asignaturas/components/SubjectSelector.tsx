"use client";

import { useState, useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import SubjectMessages from "./SubjectMessages";
import axios from "axios";
import useSubjectsStore from "@/store/subjectsStore";

interface Subject {
  id: number;
  name: string;
}

export default function SubjectSelector() {
  const subjectsStore = useSubjectsStore();
  const {
    subjects,
    fetchSubjects,
    isLoading: isLoadingSubjects,
  } = subjectsStore;
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (subjects.length === 0) {
      fetchSubjects();
    } else if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects.length]);

  if (isLoadingSubjects) {
    return <div className="text-center py-8">Cargando asignaturas...</div>;
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="text-red-500 text-center py-4">{errorMsg}</div>
      )}

      <div className="space-y-4">
        <div className="flex justify-start">
          <Select
            value={selectedSubject?.id.toString() || ""}
            onValueChange={(value) => {
              const subject = subjects.find((s) => s.id.toString() === value);
              setSelectedSubject(subject || null);
            }}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecciona una materia" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="size-4" />
                    {subject.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSubject &&
          (() => {
            console.log("Selected subject:", selectedSubject);
            return (
              <SubjectMessages
                subjectId={selectedSubject.id}
                subjectName={selectedSubject.name}
              />
            );
          })()}
      </div>

      {subjects.length === 0 && !errorMsg && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">
            No hay asignaturas disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
