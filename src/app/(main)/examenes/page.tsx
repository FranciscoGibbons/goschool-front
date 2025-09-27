"use client";

import { useState, useEffect, Suspense } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import CourseSelector from "@/components/CourseSelector";
import ExamList from "./components/ExamList";
import userInfoStore from "@/store/userInfoStore";
import { Role } from "@/utils/types";
import { Exam } from "@/utils/types";
import axios from "axios";
import { ErrorBoundary, ErrorDisplay } from "@/components/ui/error-boundary";
import { LoadingPage, LoadingCard, useLoadingState } from "@/components/ui/loading-spinner";
import { SkeletonList } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Use the Exam type from utils/types
type ExamWithSubjectId = Exam & {
  subject_id: number;
};

interface Subject {
  id: number;
  name: string;
  course_id: number;
  course_name?: string;
}

// Componente wrapper para ExamList con error boundary
function ExamListWrapper({ 
  exams, 
  role, 
  subjects 
}: { 
  exams: ExamWithSubjectId[]; 
  role: Role; 
  subjects: Subject[] 
}) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorDisplay 
          error="Error al cargar las evaluaciones"
          retry={() => window.location.reload()}
        />
      }
    >
      <Suspense fallback={<SkeletonList items={8} />}>
        <ExamList 
          exams={exams} 
          role={role} 
          subjects={subjects} 
        />
      </Suspense>
    </ErrorBoundary>
  );
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

  const [currentStep, setCurrentStep] = useState<"course" | "exams">("course");
  const [exams, setExams] = useState<ExamWithSubjectId[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { isLoading: dataLoading, startLoading, stopLoading } = useLoadingState();

  // Determinar el paso inicial según el rol
  useEffect(() => {
    if (userInfo?.role === "student" || userInfo?.role === "father") {
      setCurrentStep("exams");
    }
  }, [userInfo?.role]);

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentStep("exams");
  };

  const handleBackToCourse = () => {
    setCurrentStep("course");
  };

  // Cargar exámenes y materias cuando se selecciona un curso o es student
  useEffect(() => {
    const loadExamsAndSubjects = async () => {
      if (currentStep === "exams") {
        startLoading();
        try {
          const [examsResponse, subjectsResponse] = await Promise.all([
            axios.get("/api/proxy/assessments/", { withCredentials: true }),
            axios.get("/api/proxy/subjects/", { withCredentials: true }),
          ]);
          setExams(examsResponse.data);
          setSubjects(subjectsResponse.data);
        } catch (err) {
          console.error("Error loading exams and subjects:", err);
          toast.error("Error al cargar las evaluaciones");
        } finally {
          stopLoading();
        }
      }
    };

    loadExamsAndSubjects();
  }, [currentStep, startLoading, stopLoading]);

  // Filtrar por curso seleccionado
  const filteredSubjects = selectedCourseId
    ? subjects.filter((s) => Number(s.course_id) === Number(selectedCourseId))
    : subjects;

  const subjectIdSet = new Set(filteredSubjects.map((s) => s.id));
  const filteredExams = selectedCourseId
    ? exams.filter((e) => subjectIdSet.has(e.subject_id))
    : exams;

  // Loading states
  if (coursesLoading || dataLoading) {
    return <LoadingPage message="Cargando evaluaciones..." />;
  }

  // Error state
  if (coursesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
        </div>
        <ErrorDisplay 
          error={coursesError}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AcademicCapIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
      </div>

      {currentStep === "course" && (
        <ErrorBoundary
          fallback={
            <ErrorDisplay 
              error="Error al cargar los cursos"
              retry={handleBackToCourse}
            />
          }
        >
          <Suspense fallback={<LoadingCard />}>
            <CourseSelector
              courses={courses}
              onCourseSelect={handleCourseSelect}
              selectedCourseId={selectedCourseId}
              title="Selecciona un curso"
              description="Elige el curso para ver las evaluaciones"
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {currentStep === "exams" && (
        <div className="space-y-6">
          {userInfo?.role !== "student" && userInfo?.role !== "father" && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToCourse}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver a selección de curso
              </button>
            </div>
          )}
          <ExamListWrapper 
            exams={filteredExams} 
            role={userInfo?.role as Role} 
            subjects={filteredSubjects} 
          />
        </div>
      )}
    </div>
  );
}

export default function Exams() {
  return (
    <ErrorBoundary>
      <ExamsContent />
    </ErrorBoundary>
  );
}
