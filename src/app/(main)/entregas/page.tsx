"use client";

import { useState, useEffect, Suspense } from "react";
import { CloudArrowUpIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import userInfoStore from "@/store/userInfoStore";
import CourseSelector from "@/components/CourseSelector";
import StudentSelector from "@/components/StudentSelector";
import { SubmissionTable } from "./components/SubmissionTable";
import { SubmissionForm } from "./components/SubmissionForm";
import { ErrorBoundary, ErrorDisplay } from "@/components/ui/error-boundary";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

import type { Submission, NewSubmission, UpdateSubmission } from "@/types/submission";

interface Task {
  id: number;
  task: string;
  subject_name?: string;
  due_date?: string;
  type?: string;
}

function EntregasContent() {
  const { userInfo } = userInfoStore();
  const [currentStep, setCurrentStep] = useState<"course" | "student" | "submissions">("course");
  
  // Form and filters state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTask, setFilterTask] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);

  const {
    courses,
    students,
    selectedCourseId,
    selectedStudentId,
    isLoading: isSelectionLoading,
    error: selectionError,
    setSelectedCourseId,
    setSelectedStudentId,
    loadStudents,
    resetSelection,
  } = useCourseStudentSelection(userInfo?.role || null);

  // Filtros para la consulta de submissions
  const submissionFilters = {
    ...(selectedStudentId && { student_id: selectedStudentId }),
    ...(selectedCourseId && { course_id: selectedCourseId }),
    ...(filterTask !== "all" && { task_id: Number(filterTask) }),
  };

  const {
    submissions,
    isLoading: isSubmissionLoading,
    error: submissionError,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    downloadSubmission,
    fetchSubmissions,
  } = useSubmissions(submissionFilters);

  const canCreateSubmission = userInfo?.role === "student" || userInfo?.role === "admin";

  // Determinar el paso inicial según el rol
  useEffect(() => {
    if (!userInfo?.role) return;
    
    if (userInfo.role === "student") {
      // Los estudiantes van directo a ver sus entregas
      setCurrentStep("submissions");
      loadAvailableTasks();
    } else if (userInfo.role === "admin" || userInfo.role === "preceptor" || userInfo.role === "teacher") {
      // Otros roles empiezan seleccionando curso
      setCurrentStep("course");
    }
  }, [userInfo?.role]);

  // Cargar tareas disponibles para estudiantes
  const loadAvailableTasks = async (courseId?: number) => {
    try {
      const queryParams = new URLSearchParams();
      if (courseId) queryParams.append("course", courseId.toString());
      
      const response = await fetch(`/api/proxy/assessments?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const tasks = Array.isArray(data) ? data.filter((assessment: { type: string }) => 
          assessment.type === "homework" || assessment.type === "project"
        ) : [];
        setAvailableTasks(tasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Refetch submissions when filters change
  useEffect(() => {
    if (currentStep === "submissions") {
      const filters = {
        ...(selectedStudentId && { student_id: selectedStudentId }),
        ...(selectedCourseId && { course_id: selectedCourseId }),
        ...(filterTask !== "all" && { task_id: Number(filterTask) }),
      };
      fetchSubmissions(filters);
    }
  }, [selectedStudentId, selectedCourseId, filterTask, currentStep, fetchSubmissions]);

  const handleCourseSelect = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId);
      await loadStudents(courseId);
      await loadAvailableTasks(courseId);
      
      if (userInfo?.role === "teacher") {
        // Los profesores van directo a ver las entregas del curso
        setCurrentStep("submissions");
      } else {
        setCurrentStep("student");
      }
    } catch (error) {
      console.error("Error al seleccionar curso:", error);
      toast.error("Error al cargar información del curso");
    }
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentStep("submissions");
  };

  const handleBackToCourse = () => {
    setCurrentStep("course");
    resetSelection();
    setAvailableTasks([]);
  };

  const handleBackToStudent = () => {
    setCurrentStep("student");
    setSelectedStudentId(null);
  };

  const handleCreateSubmission = () => {
    setEditingSubmission(null);
    setIsFormOpen(true);
  };

  const handleEditSubmission = (submission: Submission) => {
    setEditingSubmission(submission);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: NewSubmission | UpdateSubmission): Promise<boolean> => {
    try {
      if (editingSubmission) {
        return await updateSubmission(editingSubmission.id, data as UpdateSubmission);
      } else {
        return await createSubmission(data as NewSubmission);
      }
    } catch (error) {
      console.error("Error in form submit:", error);
      return false;
    }
  };

  const handleDeleteSubmission = async (submissionId: number) => {
    try {
      await deleteSubmission(submissionId);
    } catch (error) {
      console.error("Error deleting submission:", error);
    }
  };

  const handleDownloadSubmission = async (submission: Submission) => {
    try {
      await downloadSubmission(submission);
    } catch (error) {
      console.error("Error downloading submission:", error);
    }
  };

  // Filter submissions based on search and status criteria
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = !searchQuery || 
      (submission.student_full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (submission.student_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (submission.student_last_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (submission.task_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (submission.path?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (filterStatus !== "all") {
      if (filterStatus === "on_time" && submission.due_date) {
        const dueDate = new Date(submission.due_date);
        const submittedDate = new Date(submission.submitted_at);
        matchesStatus = submittedDate <= dueDate;
      } else if (filterStatus === "late" && submission.due_date) {
        const dueDate = new Date(submission.due_date);
        const submittedDate = new Date(submission.submitted_at);
        matchesStatus = submittedDate > dueDate;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: filteredSubmissions.length,
    onTime: filteredSubmissions.filter(s => {
      if (!s.due_date) return false;
      const dueDate = new Date(s.due_date);
      const submittedDate = new Date(s.submitted_at);
      return submittedDate <= dueDate;
    }).length,
    late: filteredSubmissions.filter(s => {
      if (!s.due_date) return false;
      const dueDate = new Date(s.due_date);
      const submittedDate = new Date(s.submitted_at);
      return submittedDate > dueDate;
    }).length,
    pending: availableTasks.length - filteredSubmissions.length,
  };

  // Loading states
  if (isSelectionLoading) {
    return <LoadingPage message="Cargando información de entregas..." />;
  }

  // Error state
  if (selectionError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CloudArrowUpIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Entregas
          </h1>
        </div>
        <ErrorDisplay 
          error={selectionError}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Para estudiantes, mostrar directamente las entregas
  if (userInfo?.role === "student") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CloudArrowUpIcon className="size-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mis Entregas
            </h1>
          </div>
          
          {canCreateSubmission && (
            <Button onClick={handleCreateSubmission}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nueva Entrega
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total entregas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.onTime}</p>
                  <p className="text-sm text-muted-foreground">A tiempo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.late}</p>
                  <p className="text-sm text-muted-foreground">Tardías</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.max(0, stats.pending)}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros para estudiantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar entregas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterTask} onValueChange={setFilterTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tarea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las tareas</SelectItem>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.task}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="on_time">A tiempo</SelectItem>
                  <SelectItem value="late">Tardías</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {submissionError && (
          <ErrorDisplay 
            error={submissionError}
            retry={() => fetchSubmissions()}
          />
        )}

        <SubmissionTable
          submissions={filteredSubmissions}
          onEdit={handleEditSubmission}
          onDelete={handleDeleteSubmission}
          onDownload={handleDownloadSubmission}
          isLoading={isSubmissionLoading}
        />

        {/* Form Modal */}
        <SubmissionForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSubmission(null);
          }}
          onSubmit={handleFormSubmit}
          selectedStudentId={userInfo?.id}
          availableTasks={availableTasks}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CloudArrowUpIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Entregas
          </h1>
        </div>
        
        {canCreateSubmission && currentStep === "submissions" && (
          <Button onClick={handleCreateSubmission}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nueva Entrega
          </Button>
        )}
      </div>

      {currentStep === "course" && (
        <CourseSelector
          courses={courses}
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourseId}
          title="Selecciona un curso"
          description="Elige el curso para gestionar las entregas de tareas"
        />
      )}

      {currentStep === "student" && (
        <StudentSelector
          students={students}
          onStudentSelect={handleStudentSelect}
          onBack={handleBackToCourse}
          selectedStudentId={selectedStudentId}
          title="Selecciona un estudiante"
          description="Elige el estudiante para ver o gestionar sus entregas"
        />
      )}

      {currentStep === "submissions" && (
        <div className="space-y-6">
          {/* Navegación - Solo para admin y preceptor */}
          {(userInfo?.role === "admin" || userInfo?.role === "preceptor") && selectedStudentId && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToStudent}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver a selección de estudiante
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total entregas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.onTime}</p>
                    <p className="text-sm text-muted-foreground">A tiempo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.late}</p>
                    <p className="text-sm text-muted-foreground">Tardías</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.max(0, stats.pending)}</p>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por estudiante o tarea..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterTask} onValueChange={setFilterTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tarea" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las tareas</SelectItem>
                    {availableTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.task}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="on_time">A tiempo</SelectItem>
                    <SelectItem value="late">Tardías</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {submissionError && (
            <ErrorDisplay 
              error={submissionError}
              retry={() => fetchSubmissions()}
            />
          )}

          <SubmissionTable
            submissions={filteredSubmissions}
            onEdit={handleEditSubmission}
            onDelete={handleDeleteSubmission}
            onDownload={handleDownloadSubmission}
            isLoading={isSubmissionLoading}
          />
        </div>
      )}

      {/* Form Modal */}
      <SubmissionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubmission(null);
        }}
        onSubmit={handleFormSubmit}
        selectedStudentId={selectedStudentId || userInfo?.id}
        availableTasks={availableTasks}
      />
    </div>
  );
}

function EntregasWithAuth() {
  const { isLoading: isAuthLoading } = useAuthRedirect();
  
  if (isAuthLoading) {
    return <LoadingPage message="Cargando información de entregas..." />;
  }

  return (
    <ErrorBoundary>
      <EntregasContent />
    </ErrorBoundary>
  );
}

export default function Entregas() {
  return (
    <Suspense fallback={<LoadingPage message="Cargando página de entregas..." />}>
      <EntregasWithAuth />
    </Suspense>
  );
}