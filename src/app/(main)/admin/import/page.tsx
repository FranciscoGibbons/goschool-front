'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, FileText, AlertCircle, CheckCircle, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { fetchAllPages } from '@/utils/fetchAllPages';

type EntityType = 'students' | 'teachers' | 'fathers' | 'subjects' | 'timetables';

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
  name: string;
}

interface Student {
  id: number;
  email: string;
  full_name: string | null;
}

interface AdminUser {
  id: number;
  email: string;
  roles: string[];
  full_name: string | null;
}

interface CsvImportError {
  row: number;
  field: string;
  message: string;
}

interface CsvImportResult {
  created: number;
  skipped: number;
  errors: CsvImportError[];
}

const tabs: { key: EntityType; label: string }[] = [
  { key: 'students', label: 'Alumnos' },
  { key: 'teachers', label: 'Docentes' },
  { key: 'fathers', label: 'Padres' },
  { key: 'subjects', label: 'Materias' },
  { key: 'timetables', label: 'Horarios' },
];

const csvTemplates: Record<EntityType, { headers: string[]; example: string[] }> = {
  students: {
    headers: ['email', 'password', 'full_name', 'birth_date', 'address', 'phone', 'course'],
    example: ['alumno1@school.com', 'Pass1234', 'Juan Perez', '2010-05-15', 'Av. Siempreviva 742', '341-1234567', '3-A-secondary-morning'],
  },
  teachers: {
    headers: ['email', 'password', 'full_name', 'birth_date', 'address', 'phone'],
    example: ['profesor1@school.com', 'Pass1234', 'Maria Garcia', '1985-03-20', 'Calle Falsa 123', '341-9876543'],
  },
  fathers: {
    headers: ['email', 'password', 'full_name', 'birth_date', 'address', 'phone', 'student_full_name'],
    example: ['padre1@school.com', 'Pass1234', 'Carlos Perez', '1980-01-10', 'Av. Siempreviva 742', '341-1111111', 'Juan Perez'],
  },
  subjects: {
    headers: ['name', 'course', 'teacher_email'],
    example: ['Matematica', '3-A-secondary-morning', 'profesor1@school.com'],
  },
  timetables: {
    headers: ['subject_name', 'course', 'day', 'start_time', 'end_time'],
    example: ['Matematica', '3-A-secondary-morning', 'Monday', '08:00', '08:50'],
  },
};

const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function ImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EntityType>('students');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teacherSearch, setTeacherSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAllPages<Course>('/api/proxy/courses/')
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
    fetchAllPages<Student>('/api/proxy/students/')
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
    fetchAllPages<AdminUser>('/api/proxy/admin/users/')
      .then((users) => setTeachers(users.filter((u) => u.roles.includes('teacher'))))
      .catch(() => setTeachers([]))
      .finally(() => setTeachersLoading(false));
  }, []);

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) => s.email.toLowerCase().includes(q) || (s.full_name && s.full_name.toLowerCase().includes(q))
    );
  }, [students, studentSearch]);

  const filteredTeachers = useMemo(() => {
    if (!teacherSearch) return teachers;
    const q = teacherSearch.toLowerCase();
    return teachers.filter(
      (t) => t.email.toLowerCase().includes(q) || (t.full_name && t.full_name.toLowerCase().includes(q))
    );
  }, [teachers, teacherSearch]);

  const formatCourseCode = (c: Course) => `${c.year}-${c.division}-${c.level}-${c.shift}`;

  const downloadTemplate = useCallback(() => {
    const template = csvTemplates[activeTab];
    const csvContent = [
      template.headers.join(','),
      template.example.join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    setErrorMessage(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/proxy/admin/import/csv?entity_type=${activeTab}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push('/dashboard');
        return;
      }

      if (!res.ok) {
        // Check if it's a structured error with errors array
        if (data && data.errors && Array.isArray(data.errors)) {
          setResult(data as CsvImportResult);
        } else {
          setErrorMessage(typeof data === 'string' ? data : data.error || JSON.stringify(data));
        }
        return;
      }

      const importResult = data as CsvImportResult;
      setResult(importResult);
      const parts = [`${importResult.created} creados`];
      if (importResult.skipped > 0) parts.push(`${importResult.skipped} omitidos (duplicados)`);
      toast.success(parts.join(', '));
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setErrorMessage('Error de conexion');
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      setResult(null);
      setErrorMessage(null);
    } else {
      toast.error('Solo se aceptan archivos CSV o Excel (.xlsx)');
    }
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importar datos</h1>
          <p className="text-muted-foreground">Importar usuarios, materias y horarios desde archivos CSV o Excel</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setFile(null);
              setResult(null);
              setErrorMessage(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Template download */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Plantilla CSV</p>
              <p className="text-xs text-muted-foreground">
                Headers: {csvTemplates[activeTab].headers.join(', ')}
              </p>
              {(activeTab === 'students' || activeTab === 'subjects' || activeTab === 'timetables') && (
                <p className="text-xs text-muted-foreground mt-1">
                  Formato curso: <code className="bg-muted px-1 rounded">year-division-level-shift</code> (ej: 3-A-secondary-morning)
                </p>
              )}
              {activeTab === 'subjects' && (
                <p className="text-xs text-muted-foreground mt-1">
                  En <code className="bg-muted px-1 rounded">teacher_email</code> poner el email del docente que dicta la materia
                </p>
              )}
              {activeTab === 'timetables' && (
                <>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dias validos: <code className="bg-muted px-1 rounded">Monday</code>, <code className="bg-muted px-1 rounded">Tuesday</code>, <code className="bg-muted px-1 rounded">Wednesday</code>, <code className="bg-muted px-1 rounded">Thursday</code>, <code className="bg-muted px-1 rounded">Friday</code>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato hora: <code className="bg-muted px-1 rounded">HH:MM</code> (ej: 08:00, 13:30). La materia debe existir previamente en el curso indicado.
                  </p>
                </>
              )}
              {activeTab === 'fathers' && (
                <p className="text-xs text-muted-foreground mt-1">
                  En <code className="bg-muted px-1 rounded">student_full_name</code> poner el nombre completo del alumno/a hijo/a.
                  Si hay nombres repetidos, usar <code className="bg-muted px-1 rounded">student_email</code> en su lugar.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 rounded-md text-sm font-medium h-9 px-3 border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar plantilla
          </button>
        </div>

        {(activeTab === 'students' || activeTab === 'subjects' || activeTab === 'timetables') && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Cursos disponibles:</p>
            {coursesLoading ? (
              <p className="text-xs text-muted-foreground">Cargando cursos...</p>
            ) : courses.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay cursos creados en el ciclo lectivo activo.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {courses.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs"
                  >
                    <span className="text-muted-foreground">{c.name}</span>
                    <code className="font-mono text-[11px] bg-background rounded px-1">{formatCourseCode(c)}</code>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Docentes cargados ({teachers.length}) — usa el email del docente en la columna <code className="bg-muted px-1 rounded">teacher_email</code>:
            </p>
            {teachersLoading ? (
              <p className="text-xs text-muted-foreground">Cargando docentes...</p>
            ) : teachers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay docentes cargados. Importa los docentes primero.</p>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded border bg-background">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">Nombre</th>
                        <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">Email (usar en CSV)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.map((t) => (
                        <tr key={t.id} className="border-t border-muted/50">
                          <td className="px-2.5 py-1.5 text-muted-foreground">{t.full_name || '—'}</td>
                          <td className="px-2.5 py-1.5">
                            <code className="font-mono text-[11px] bg-muted rounded px-1">{t.email}</code>
                          </td>
                        </tr>
                      ))}
                      {filteredTeachers.length === 0 && (
                        <tr>
                          <td colSpan={2} className="px-2.5 py-3 text-center text-muted-foreground">
                            No se encontraron docentes
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fathers' && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Alumnos cargados ({students.length}) — usa el nombre tal cual aparece aca. Si hay nombres repetidos, usa el email en la columna <code className="bg-muted px-1 rounded">student_email</code>:
            </p>
            {studentsLoading ? (
              <p className="text-xs text-muted-foreground">Cargando alumnos...</p>
            ) : students.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay alumnos cargados. Importa los alumnos primero.</p>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded border bg-background">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">Nombre</th>
                        <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">Email (usar en CSV)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="border-t border-muted/50">
                          <td className="px-2.5 py-1.5 text-muted-foreground">{s.full_name || '—'}</td>
                          <td className="px-2.5 py-1.5">
                            <code className="font-mono text-[11px] bg-muted rounded px-1">{s.email}</code>
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={2} className="px-2.5 py-3 text-center text-muted-foreground">
                            No se encontraron alumnos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Upload */}
      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="space-y-2">
            <FileText className="w-10 h-10 mx-auto text-primary" />
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setErrorMessage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-xs text-destructive hover:underline"
            >
              Quitar archivo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Arrastra un archivo CSV o Excel aqui o
            </p>
            <p className="text-xs text-muted-foreground/70">
              Formatos permitidos: .csv, .xlsx
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Seleccionar archivo
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Import Button */}
      <div className="flex justify-end">
        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
        >
          {importing ? 'Importando...' : 'Importar'}
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {(result.created > 0 || result.skipped > 0) && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-sm font-medium text-green-700 dark:text-green-400">
                {result.created > 0 && <p>{result.created} registros creados correctamente</p>}
                {result.skipped > 0 && (
                  <p className="text-yellow-700 dark:text-yellow-400">
                    {result.skipped} omitidos (email ya existente)
                  </p>
                )}
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm font-medium text-destructive">
                  {result.errors.length} error{result.errors.length > 1 ? 'es' : ''} encontrado{result.errors.length > 1 ? 's' : ''}. No se inserto ningun registro.
                </p>
              </div>
              <div className="rounded border bg-background overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fila</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Campo</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-3 py-2 font-mono text-xs">{err.row}</td>
                        <td className="px-3 py-2 font-mono text-xs">{err.field}</td>
                        <td className="px-3 py-2 text-destructive/80">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
