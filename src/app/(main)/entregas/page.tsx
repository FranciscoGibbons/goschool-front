"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorBoundary,
  ErrorDisplay,
  LoadingPage,
  PageHeader,
} from "@/components/sacred";
import { CheckCircle, Clock, FileText, Filter, Search, XCircle } from "lucide-react";
import InlineSelectionBar from "@/components/InlineSelectionBar";
import { SubmissionForm } from "./components/SubmissionForm";
import { SubmissionTable } from "./components/SubmissionTable";
import userInfoStore from "@/store/userInfoStore";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { useSubmissions } from "@/hooks/useSubmissions";
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
  } = useCourseStudentSelection(userInfo?.role || null);

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

  useEffect(() => {
    if (!userInfo?.role) return;
    if (userInfo.role === "student") {
      loadAvailableTasks();
    }
  }, [userInfo?.role]);

  // Load tasks when course selected
  useEffect(() => {
    if (selectedCourseId) {
      loadAvailableTasks(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadAvailableTasks = async (courseId?: number) => {
    try {
      const queryParams = new URLSearchParams();
      if (courseId) queryParams.append("course", courseId.toString());

      const response = await fetch(`/api/proxy/assessments?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        let assessments: Task[] = [];
        if (data && typeof data === 'object' && 'data' in data) {
          assessments = data.data;
        } else if (Array.isArray(data)) {
          assessments = data;
        }
        const tasks = assessments.filter((assessment: { type?: string }) =>
          assessment.type === "homework" || assessment.type === "project"
        );
        setAvailableTasks(tasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Refetch submissions when filters change
  useEffect(() => {
    const shouldFetch = userInfo?.role === "student" || selectedCourseId;
    if (shouldFetch) {
      const filters = {
        ...(selectedStudentId && { student_id: selectedStudentId }),
        ...(selectedCourseId && { course_id: selectedCourseId }),
        ...(filterTask !== "all" && { task_id: Number(filterTask) }),
      };
      fetchSubmissions(filters);
    }
  }, [selectedStudentId, selectedCourseId, filterTask, fetchSubmissions, userInfo?.role]);

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

  if (isSelectionLoading) {
    return <LoadingPage message="Cargando informacion de entregas..." />;
  }

  if (selectionError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Entregas" />
        <ErrorDisplay
          error={selectionError}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Student view - direct submissions
  if (userInfo?.role === "student") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mis Entregas"
          action={
            canCreateSubmission ? (
              <Button onClick={handleCreateSubmission}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Nueva Entrega
              </Button>
            ) : null
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-text-secondary">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.onTime}</p>
                  <p className="text-sm text-text-secondary">A tiempo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-error-muted rounded-lg">
                  <XCircle className="h-5 w-5 text-error" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.late}</p>
                  <p className="text-sm text-text-secondary">Tardias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-muted rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.max(0, stats.pending)}</p>
                  <p className="text-sm text-text-secondary">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
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
                  <SelectItem value="late">Tardias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {submissionError && (
          <ErrorDisplay error={submissionError} retry={() => fetchSubmissions()} />
        )}

        <SubmissionTable
          submissions={filteredSubmissions}
          onEdit={handleEditSubmission}
          onDelete={handleDeleteSubmission}
          onDownload={handleDownloadSubmission}
          isLoading={isSubmissionLoading}
        />

        <SubmissionForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingSubmission(null); }}
          onSubmit={handleFormSubmit}
          selectedStudentId={userInfo?.id}
          availableTasks={availableTasks}
        />
      </div>
    );
  }

  // Staff view with inline selectors
  const isTeacher = userInfo?.role === "teacher";
  const showSubmissions = isTeacher ? !!selectedCourseId : !!selectedStudentId || !!selectedCourseId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entregas"
        action={
          canCreateSubmission && showSubmissions ? (
            <Button onClick={handleCreateSubmission}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nueva Entrega
            </Button>
          ) : null
        }
      />

      <InlineSelectionBar
        courses={courses}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        students={students}
        selectedStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
        showStudentSelector={!isTeacher}
      />

      {showSubmissions && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-text-secondary">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-muted rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.onTime}</p>
                    <p className="text-sm text-text-secondary">A tiempo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error-muted rounded-lg">
                    <XCircle className="h-5 w-5 text-error" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.late}</p>
                    <p className="text-sm text-text-secondary">Tardias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning-muted rounded-lg">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.max(0, stats.pending)}</p>
                    <p className="text-sm text-text-secondary">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
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
                    <SelectItem value="late">Tardias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {submissionError && (
            <ErrorDisplay error={submissionError} retry={() => fetchSubmissions()} />
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

      {!showSubmissions && (
        <div className="sacred-card text-center py-8">
          <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Selecciona un curso</p>
          <p className="text-sm text-text-secondary mt-1">
            Elige un curso del selector para ver las entregas
          </p>
        </div>
      )}

      <SubmissionForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingSubmission(null); }}
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
    return <LoadingPage message="Cargando informacion de entregas..." />;
  }

  return (
    <ErrorBoundary>
      <EntregasContent />
    </ErrorBoundary>
  );
}

export default function Entregas() {
  return (
    <Suspense fallback={<LoadingPage message="Cargando pagina de entregas..." />}>
      <EntregasWithAuth />
    </Suspense>
  );
}
