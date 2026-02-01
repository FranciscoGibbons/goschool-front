"use client";

import { useState, useEffect } from "react";

import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { ProtectedPage } from "@/components/ProtectedPage";
import InlineCourseSelector from "@/components/InlineCourseSelector";
import { AcademicYearSelector } from "@/components/AcademicYearSelector";
import ExamList from "./components/ExamList";
import userInfoStore from "@/store/userInfoStore";
import { Role, Exam } from "@/utils/types";
import axios from "axios";
import {
  ErrorBoundary,
  ErrorDisplay,
  LoadingSpinner,
  PageHeader,
} from "@/components/sacred";

import { toast } from "sonner";

type ExamWithSubjectId = Exam & { subject_id: number };

interface Subject {
  id: number;
  name: string;
  course_id: number;
  course_name?: string;
}

function ExamsContent() {
  const { userInfo } = userInfoStore();
  const {
    courses,
    selectedCourseId,
    isLoading: coursesLoading,
    error: coursesError,
    setSelectedCourseId,
  } = useCourseStudentSelection(userInfo?.role || null);

  const {
    academicYears,
    selectedYearId,
    setSelectedYearId,
  } = useAcademicYears();

  const [exams, setExams] = useState<ExamWithSubjectId[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Load data when course or year changes
  useEffect(() => {
    const loadData = async () => {
      // For student/father, always load. For staff, load when ready.
      const isStudentOrFather = userInfo?.role === "student" || userInfo?.role === "father";
      if (!isStudentOrFather && !selectedCourseId) return;

      setDataLoading(true);
      try {
        const params = selectedYearId ? `?academic_year_id=${selectedYearId}` : "";
        const [examsRes, subjectsRes] = await Promise.all([
          axios.get(`/api/proxy/assessments/${params}`, { withCredentials: true }),
          axios.get(`/api/proxy/subjects/${params}`, { withCredentials: true }),
        ]);

        let examsData: ExamWithSubjectId[];
        if (examsRes.data && typeof examsRes.data === 'object' && 'data' in examsRes.data) {
          examsData = examsRes.data.data;
        } else if (Array.isArray(examsRes.data)) {
          examsData = examsRes.data;
        } else {
          examsData = [];
        }

        let subjectsData: Subject[];
        if (subjectsRes.data && typeof subjectsRes.data === 'object' && 'data' in subjectsRes.data) {
          subjectsData = subjectsRes.data.data;
        } else if (Array.isArray(subjectsRes.data)) {
          subjectsData = subjectsRes.data;
        } else {
          subjectsData = [];
        }

        setExams(examsData);
        setSubjects(subjectsData);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Error al cargar evaluaciones");
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [selectedCourseId, selectedYearId, userInfo?.role]);

  const filteredSubjects = selectedCourseId
    ? subjects.filter((s) => Number(s.course_id) === Number(selectedCourseId))
    : subjects;

  const subjectIdSet = new Set(filteredSubjects.map((s) => s.id));
  const filteredExams = selectedCourseId
    ? exams.filter((e) => subjectIdSet.has(e.subject_id))
    : exams;

  if (coursesLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Evaluaciones" />
        <ErrorDisplay error={coursesError} retry={() => window.location.reload()} />
      </div>
    );
  }

  // Student/Father view - no selector needed
  if (userInfo?.role === "student" || userInfo?.role === "father") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Evaluaciones"
          subtitle="Examenes y tareas programadas"
          action={
            academicYears.length > 1 ? (
              <AcademicYearSelector
                academicYears={academicYears}
                selectedYearId={selectedYearId}
                onYearChange={setSelectedYearId}
              />
            ) : null
          }
        />
        <ExamList
          exams={filteredExams}
          role={userInfo?.role as Role}
          subjects={filteredSubjects}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluaciones"
        subtitle="Examenes y tareas programadas"
      />

      <div className="flex flex-wrap items-center gap-3 p-3 sacred-card">
        <InlineCourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
        />
        {academicYears.length > 1 && (
          <AcademicYearSelector
            academicYears={academicYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
          />
        )}
      </div>

      {selectedCourseId ? (
        <ExamList
          exams={filteredExams}
          role={userInfo?.role as Role}
          subjects={filteredSubjects}
        />
      ) : (
        <div className="sacred-card text-center py-8">
          <p className="text-sm font-medium text-text-primary">Selecciona un curso</p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un curso del selector para ver las evaluaciones
          </p>
        </div>
      )}
    </div>
  );
}

export default function Exams() {
  return (
    <ProtectedPage>
      <ErrorBoundary>
        <ExamsContent />
      </ErrorBoundary>
    </ProtectedPage>
  );
}
