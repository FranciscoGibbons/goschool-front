"use client";

import { useState } from "react";
import { Exam, Role, SelfAssessableExam } from "@/utils/types";
import AnswerSelfAssessable from "./AnswerSelfAssessable";
import { Button } from "@/components/ui/button";

interface Props {
  exams: Exam[];
  role: Role;
}

export default function ExamList({ exams, role }: Props) {
  const [activeExamId, setActiveExamId] = useState<number | null>(null);

  const isSelfAssessableExam = (exam: Exam): exam is SelfAssessableExam => {
    return (
      exam.type === "selfassessable" &&
      "questions" in exam &&
      Array.isArray(exam.questions)
    );
  };

  if (exams.length === 0) {
    return (
      <p className="text-muted-foreground">
        No se encontraron evaluaciones asignadas.
      </p>
    );
  }

  return (
    <>
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="bg-card shadow-md rounded-xl p-6 border border-border"
        >
          <h2 className="text-xl font-semibold text-primary">{exam.task}</h2>
          <p className="text-muted-foreground">
            Fecha de entrega: {exam.due_date}
          </p>
          <p className="text-muted-foreground">Materia ID: {exam.subject_id}</p>
          <p className="text-muted-foreground mb-4">Tipo: {exam.type}</p>

          {isSelfAssessableExam(exam) && role === "student" && (
            <>
              {activeExamId !== exam.id ? (
                <Button onClick={() => setActiveExamId(exam.id)}>
                  Responder
                </Button>
              ) : (
                <AnswerSelfAssessable
                  assessmentId={exam.id}
                  questions={exam.questions}
                  onClose={() => setActiveExamId(null)}
                />
              )}
            </>
          )}

          {role !== "student" && exam.type === "oral" && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-primary font-medium">
                Evaluación oral - Requiere corrección manual
              </p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
