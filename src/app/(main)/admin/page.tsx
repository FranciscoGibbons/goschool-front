"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Shield,
  Settings,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Plus,
  MessageSquare,
  FileText,
  ClipboardCheck,
  UserCheck,
  Upload,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { FormsObj } from "@/utils/types";
import { ActionForm } from "../dashboard/components/adm_pre_tea/ActionForm";
import "../dashboard/dashboard-modal.css";

interface DashboardStats {
  total_users: number;
  students: number;
  teachers: number;
  preceptors: number;
  fathers: number;
  admins: number;
  active_courses: number;
  active_subjects: number;
  active_academic_year: string | null;
}

interface CourseGradeStats {
  course_id: number;
  course_name: string;
  total_students: number;
  total_teachers: number;
  total_grades: number;
  average_grade: number | null;
  min_grade: number | null;
  max_grade: number | null;
  passing_count: number;
  failing_count: number;
}

interface CourseAttendanceStats {
  course_id: number;
  course_name: string;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number | null;
}

interface CourseDisciplineStats {
  course_id: number;
  course_name: string;
  total_sanctions: number;
  admonitions: number;
  warnings: number;
}

interface AcademicStats {
  overall_average_grade: number | null;
  overall_attendance_rate: number | null;
  total_sanctions: number;
  grades_by_course: CourseGradeStats[];
  attendance_by_course: CourseAttendanceStats[];
  discipline_by_course: CourseDisciplineStats[];
}

const adminCreateActions = [
  { key: "Crear mensaje" as keyof FormsObj, label: "Nuevo Mensaje", icon: MessageSquare },
  { key: "Crear examen" as keyof FormsObj, label: "Nuevo Examen", icon: FileText },
  { key: "Crear conducta" as keyof FormsObj, label: "Registrar Conducta", icon: ClipboardCheck },
  { key: "Crear asistencia" as keyof FormsObj, label: "Tomar Asistencia", icon: UserCheck },
];

export default function AdminPage() {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [academicStats, setAcademicStats] = useState<AcademicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createAction, setCreateAction] = useState<keyof FormsObj | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, academicRes] = await Promise.all([
          fetch("/api/proxy/admin/dashboard", { credentials: "include" }),
          fetch("/api/proxy/admin/stats/academic", { credentials: "include" }),
        ]);

        if (!dashboardRes.ok) {
          if (dashboardRes.status === 401) {
            router.push("/dashboard");
            return;
          }
          throw new Error("Error al cargar estadísticas");
        }

        const [dashboard, academic] = await Promise.all([
          dashboardRes.json(),
          academicRes.ok ? academicRes.json() : null,
        ]);

        setDashboardStats(dashboard);
        setAcademicStats(academic);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminLinks = [
    {
      title: "Gestión de Usuarios",
      description: "Administrar usuarios del sistema",
      href: "/admin/users",
      icon: Users,
      color: "text-icon-academic",
    },
    {
      title: "Ciclos Lectivos",
      description: "Administrar años académicos",
      href: "/admin/academic-years",
      icon: Calendar,
      color: "text-icon-users",
    },
    {
      title: "Cursos",
      description: "Administrar cursos y divisiones",
      href: "/admin/courses",
      icon: GraduationCap,
      color: "text-icon-security",
    },
    {
      title: "Materias",
      description: "Administrar materias y asignaciones",
      href: "/admin/subjects",
      icon: BookOpen,
      color: "text-icon-stats",
    },
    {
      title: "Importar CSV",
      description: "Importar usuarios y materias desde CSV",
      href: "/admin/import",
      icon: Upload,
      color: "text-icon-academic",
    },
    {
      title: "Seguridad y Sistema",
      description: "Monitoreo y estadísticas técnicas",
      href: "/admin/security",
      icon: Shield,
      color: "text-icon-settings",
    },
    {
      title: "Suplentes",
      description: "Administrar suplencias de docentes y preceptores",
      href: "/admin/replacements",
      icon: UserCog,
      color: "text-icon-users",
    },
  ];

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-muted-foreground";
    if (grade >= 8) return "text-grade-good";
    if (grade >= 6) return "text-grade-average";
    return "text-grade-poor";
  };

  const getAttendanceColor = (rate: number | null) => {
    if (rate === null) return "text-muted-foreground";
    if (rate >= 90) return "text-grade-good";
    if (rate >= 75) return "text-grade-average";
    return "text-grade-poor";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona el sistema escolar desde aquí
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Ciclo activo: {dashboardStats?.active_academic_year || "Sin definir"}</span>
        </div>
      </div>

      {/* Quick Stats with Course Filter */}
      {(() => {
        const selectedGrade = selectedCourseId
          ? academicStats?.grades_by_course.find((c) => c.course_id === selectedCourseId)
          : null;
        const selectedAttendance = selectedCourseId
          ? academicStats?.attendance_by_course.find((c) => c.course_id === selectedCourseId)
          : null;
        const selectedDiscipline = selectedCourseId
          ? academicStats?.discipline_by_course.find((c) => c.course_id === selectedCourseId)
          : null;

        const usersValue = selectedCourseId && selectedGrade
          ? selectedGrade.total_students + selectedGrade.total_teachers
          : dashboardStats?.total_users || 0;
        const usersDetail = selectedCourseId && selectedGrade
          ? `${selectedGrade.total_students} estudiantes, ${selectedGrade.total_teachers} docentes`
          : `${dashboardStats?.students || 0} estudiantes, ${dashboardStats?.teachers || 0} docentes`;
        const gradeValue = selectedCourseId
          ? selectedGrade?.average_grade ?? null
          : academicStats?.overall_average_grade ?? null;
        const attendanceValue = selectedCourseId
          ? selectedAttendance?.attendance_rate ?? null
          : academicStats?.overall_attendance_rate ?? null;
        const sanctionsValue = selectedCourseId
          ? selectedDiscipline?.total_sanctions || 0
          : academicStats?.total_sanctions || 0;

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label htmlFor="course-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Filtrar por curso:
              </label>
              <select
                id="course-filter"
                value={selectedCourseId ?? ""}
                onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos los cursos</option>
                {academicStats?.grades_by_course.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usersValue}</div>
                  <p className="text-xs text-muted-foreground">{usersDetail}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getGradeColor(gradeValue)}`}>
                    {gradeValue?.toFixed(2) || "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Calificaciones del ciclo activo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Asistencia General</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getAttendanceColor(attendanceValue)}`}>
                    {attendanceValue?.toFixed(1) || "N/A"}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tasa de asistencia promedio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sanciones</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {sanctionsValue}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total en el ciclo activo
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })()}

      {/* Academic Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Cursos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardStats?.active_courses || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Materias Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardStats?.active_subjects || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Docentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardStats?.teachers || 0}</div>
          </CardContent>
        </Card>
      </div>


      {/* Grades by Course - Detailed Table */}
      {academicStats && academicStats.grades_by_course.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Detalle de Calificaciones por Curso
            </CardTitle>
            <CardDescription>Estadísticas detalladas de calificaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-center">Estudiantes</TableHead>
                  <TableHead className="text-center">Calificaciones</TableHead>
                  <TableHead className="text-center">Promedio</TableHead>
                  <TableHead className="text-center">Mín / Máx</TableHead>
                  <TableHead className="text-center">Aprobados</TableHead>
                  <TableHead className="text-center">Desaprobados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicStats.grades_by_course.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell className="font-medium">{course.course_name}</TableCell>
                    <TableCell className="text-center">{course.total_students}</TableCell>
                    <TableCell className="text-center">{course.total_grades}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-bold ${getGradeColor(course.average_grade)}`}>
                        {course.average_grade?.toFixed(2) || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {course.min_grade?.toFixed(1) || "-"} / {course.max_grade?.toFixed(1) || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-success border-success">
                        {course.passing_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-error border-error">
                        {course.failing_count}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Attendance by Course - Detailed Table */}
      {academicStats && academicStats.attendance_by_course.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Detalle de Asistencia por Curso
            </CardTitle>
            <CardDescription>Estadísticas detalladas de asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-center">Registros</TableHead>
                  <TableHead className="text-center">Presentes</TableHead>
                  <TableHead className="text-center">Ausentes</TableHead>
                  <TableHead className="text-center">Tardanzas</TableHead>
                  <TableHead className="text-center">Justificados</TableHead>
                  <TableHead>Tasa de Asistencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicStats.attendance_by_course.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell className="font-medium">{course.course_name}</TableCell>
                    <TableCell className="text-center">{course.total_records}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-success border-success">
                        {course.present_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-error border-error">
                        {course.absent_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-warning border-warning">
                        {course.late_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-status-info border-status-info">
                        {course.excused_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={course.attendance_rate || 0}
                          className="w-20 h-2"
                        />
                        <span className={`text-sm font-medium ${getAttendanceColor(course.attendance_rate)}`}>
                          {course.attendance_rate?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Discipline by Course */}
      {academicStats && academicStats.discipline_by_course.some(c => c.total_sanctions > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Sanciones Disciplinarias por Curso
            </CardTitle>
            <CardDescription>Resumen de sanciones por curso</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-center">Total Sanciones</TableHead>
                  <TableHead className="text-center">Amonestaciones</TableHead>
                  <TableHead className="text-center">Apercibimientos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicStats.discipline_by_course
                  .filter(c => c.total_sanctions > 0)
                  .map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell className="font-medium">{course.course_name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={course.total_sanctions > 5 ? "destructive" : "outline"}>
                        {course.total_sanctions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{course.admonitions}</TableCell>
                    <TableCell className="text-center">{course.warnings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* User breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Usuarios</CardTitle>
          <CardDescription>Usuarios registrados por rol</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-role-student-muted rounded-lg">
                <GraduationCap className="h-5 w-5 text-role-student" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardStats?.students || 0}</p>
                <p className="text-xs text-muted-foreground">Estudiantes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-role-teacher-muted rounded-lg">
                <Users className="h-5 w-5 text-role-teacher" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardStats?.teachers || 0}</p>
                <p className="text-xs text-muted-foreground">Docentes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-role-preceptor-muted rounded-lg">
                <Shield className="h-5 w-5 text-role-preceptor" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardStats?.preceptors || 0}</p>
                <p className="text-xs text-muted-foreground">Preceptores</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-role-father-muted rounded-lg">
                <Users className="h-5 w-5 text-role-father" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardStats?.fathers || 0}</p>
                <p className="text-xs text-muted-foreground">Padres</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-role-admin-muted rounded-lg">
                <Settings className="h-5 w-5 text-role-admin" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardStats?.admins || 0}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Create Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones rapidas</h2>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {adminCreateActions.map((action) => (
            <button
              key={action.key}
              onClick={() => {
                setCreateAction(action.key);
                setModalOpen(true);
              }}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-left cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-primary/10">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary">{action.label}</p>
              </div>
              <Plus className="h-4 w-4 text-primary flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Administrar</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <link.icon className={`h-8 w-8 ${link.color}`} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) setCreateAction(null);
      }}>
        <DialogContent className="max-w-2xl dashboard-modal-content">
          <DialogTitle>{createAction || "Crear"}</DialogTitle>
          {createAction && (
            <ActionForm
              action={createAction}
              onBack={() => {
                setCreateAction(null);
                setModalOpen(false);
              }}
              onClose={() => {
                setCreateAction(null);
                setModalOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
