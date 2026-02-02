'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface School {
  id: number;
  slug: string;
  name: string;
  database_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateForm {
  slug: string;
  name: string;
  admin_email: string;
  admin_password: string;
  admin_full_name: string;
  admin_birth_date: string;
  admin_address: string;
  admin_phone: string;
}

interface EditForm {
  name: string;
  is_active: boolean;
}

interface LevelConfig {
  enabled: boolean;
  year_from: number;
  year_to: number;
  division_names: string[];
  shifts: { morning: boolean; afternoon: boolean };
}

interface CourseTemplateConfig {
  enabled: boolean;
  academic_year_name: string;
  academic_year_start: string;
  academic_year_end: string;
  primary: LevelConfig;
  secondary: LevelConfig;
}

const defaultLevelConfig = (level: 'primary' | 'secondary'): LevelConfig => ({
  enabled: false,
  year_from: 1,
  year_to: level === 'primary' ? 7 : 6,
  division_names: ['A', 'B', 'C'],
  shifts: { morning: true, afternoon: false },
});

const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function SchoolsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({ slug: '', name: '', admin_email: '', admin_password: '', admin_full_name: '', admin_birth_date: '', admin_address: '', admin_phone: '' });
  const [creating, setCreating] = useState(false);
  const [courseTemplate, setCourseTemplate] = useState<CourseTemplateConfig>({
    enabled: false,
    academic_year_name: new Date().getFullYear().toString(),
    academic_year_start: `${new Date().getFullYear()}-03-01`,
    academic_year_end: `${new Date().getFullYear()}-12-15`,
    primary: defaultLevelConfig('primary'),
    secondary: defaultLevelConfig('secondary'),
  });

  // Edit state
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', is_active: true });

  // Delete state
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [confirmSlug, setConfirmSlug] = useState('');

  const fetchSchools = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy/superadmin/schools/', {
        credentials: 'include',
      });
      if (res.status === 401) {
        router.push('/superadmin-login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSchools(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Calculate course preview count
  const coursesPreview = useMemo(() => {
    if (!courseTemplate.enabled) return 0;
    let count = 0;
    for (const key of ['primary', 'secondary'] as const) {
      const level = courseTemplate[key];
      if (!level.enabled) continue;
      const years = level.year_to - level.year_from + 1;
      const shifts = (level.shifts.morning ? 1 : 0) + (level.shifts.afternoon ? 1 : 0);
      count += years * level.division_names.filter(n => n.trim() !== '').length * shifts;
    }
    return count;
  }, [courseTemplate]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      // Build the request body
      const body: Record<string, unknown> = { ...createForm };

      if (courseTemplate.enabled) {
        const levels = [];
        for (const key of ['primary', 'secondary'] as const) {
          const level = courseTemplate[key];
          if (!level.enabled) continue;
          const shifts = [];
          if (level.shifts.morning) shifts.push('morning');
          if (level.shifts.afternoon) shifts.push('afternoon');
          if (shifts.length === 0) continue;
          levels.push({
            level: key,
            year_from: level.year_from,
            year_to: level.year_to,
            division_names: level.division_names.filter(n => n.trim() !== ''),
            shifts,
          });
        }
        if (levels.length > 0) {
          body.course_template = {
            academic_year_name: courseTemplate.academic_year_name,
            academic_year_start: courseTemplate.academic_year_start,
            academic_year_end: courseTemplate.academic_year_end || null,
            levels,
          };
        }
      }

      const res = await fetch('/api/proxy/superadmin/schools/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Failed to create school');
        return;
      }
      const result = await res.json();
      const coursesMsg = result.courses_created ? ` (${result.courses_created} cursos creados)` : '';
      toast.success(`School created successfully${coursesMsg}`);
      setShowCreate(false);
      setCreateForm({ slug: '', name: '', admin_email: '', admin_password: '', admin_full_name: '', admin_birth_date: '', admin_address: '', admin_phone: '' });
      setCourseTemplate({
        enabled: false,
        academic_year_name: new Date().getFullYear().toString(),
        academic_year_start: `${new Date().getFullYear()}-03-01`,
        academic_year_end: `${new Date().getFullYear()}-12-15`,
        primary: defaultLevelConfig('primary'),
        secondary: defaultLevelConfig('secondary'),
      });
      fetchSchools();
    } catch {
      toast.error('Connection error');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!editingSchool) return;
    try {
      const res = await fetch(`/api/proxy/superadmin/schools/${editingSchool.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Failed to update school');
        return;
      }
      toast.success('School updated');
      setEditingSchool(null);
      fetchSchools();
    } catch {
      toast.error('Connection error');
    }
  };

  const handleDelete = async (permanent: boolean) => {
    if (!deletingSchool) return;
    try {
      const url = permanent
        ? `/api/proxy/superadmin/schools/${deletingSchool.id}/?permanent=true`
        : `/api/proxy/superadmin/schools/${deletingSchool.id}/`;
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Error');
        return;
      }
      toast.success(permanent ? 'Colegio eliminado permanentemente' : 'Colegio desactivado');
      setDeletingSchool(null);
      setConfirmSlug('');
      fetchSchools();
    } catch {
      toast.error('Connection error');
    }
  };

  const openEdit = (school: School) => {
    setEditingSchool(school);
    setEditForm({ name: school.name, is_active: school.is_active });
  };

  const updateLevel = (level: 'primary' | 'secondary', updates: Partial<LevelConfig>) => {
    setCourseTemplate(prev => ({
      ...prev,
      [level]: { ...prev[level], ...updates },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-muted-foreground">Manage all schools on the platform</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create School
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Database</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-5 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    No schools found
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{school.slug}</td>
                    <td className="px-4 py-3 font-medium">{school.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{school.database_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        school.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {school.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(school.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(school)}
                          className="inline-flex items-center justify-center rounded-md text-sm h-8 w-8 hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSchool(school)}
                          className="inline-flex items-center justify-center rounded-md text-sm h-8 w-8 hover:bg-destructive/10 text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-lg font-semibold">Create School</h2>
              <p className="text-sm text-muted-foreground">This will create a new database and all tables.</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Slug</label>
                <input
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className={inputClass}
                  placeholder="my-school"
                />
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only. Will be used as subdomain.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">School Name</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={inputClass}
                  placeholder="Colegio Example"
                />
              </div>
              <hr className="my-1" />
              <p className="text-xs text-muted-foreground font-medium">Initial Administrator</p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Admin Email</label>
                <input
                  value={createForm.admin_email}
                  onChange={(e) => setCreateForm({ ...createForm, admin_email: e.target.value })}
                  className={inputClass}
                  placeholder="admin@school.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Admin Password</label>
                <input
                  type="password"
                  value={createForm.admin_password}
                  onChange={(e) => setCreateForm({ ...createForm, admin_password: e.target.value })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <hr className="my-1" />
              <p className="text-xs text-muted-foreground font-medium">Admin Personal Data</p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  value={createForm.admin_full_name}
                  onChange={(e) => setCreateForm({ ...createForm, admin_full_name: e.target.value })}
                  className={inputClass}
                  placeholder="Juan Perez"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Birth Date</label>
                <input
                  type="date"
                  value={createForm.admin_birth_date}
                  onChange={(e) => setCreateForm({ ...createForm, admin_birth_date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address</label>
                <input
                  value={createForm.admin_address}
                  onChange={(e) => setCreateForm({ ...createForm, admin_address: e.target.value })}
                  className={inputClass}
                  placeholder="Av. Siempreviva 742"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <input
                  value={createForm.admin_phone}
                  onChange={(e) => setCreateForm({ ...createForm, admin_phone: e.target.value })}
                  className={inputClass}
                  placeholder="341-1234567"
                />
              </div>

              {/* Course Template Toggle */}
              <hr className="my-1" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Configurar cursos iniciales</p>
                  <p className="text-xs text-muted-foreground">Crear ciclo lectivo y cursos automaticamente</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCourseTemplate(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    courseTemplate.enabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    courseTemplate.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Course Template Config */}
              {courseTemplate.enabled && (
                <div className="space-y-3 rounded-lg border p-3 bg-muted/20">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Nombre del ciclo lectivo</label>
                    <input
                      value={courseTemplate.academic_year_name}
                      onChange={(e) => setCourseTemplate(prev => ({ ...prev, academic_year_name: e.target.value }))}
                      className={inputClass}
                      placeholder="2026"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Fecha inicio</label>
                      <input
                        type="date"
                        value={courseTemplate.academic_year_start}
                        onChange={(e) => setCourseTemplate(prev => ({ ...prev, academic_year_start: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Fecha fin</label>
                      <input
                        type="date"
                        value={courseTemplate.academic_year_end}
                        onChange={(e) => setCourseTemplate(prev => ({ ...prev, academic_year_end: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Levels */}
                  {(['primary', 'secondary'] as const).map((levelKey) => {
                    const level = courseTemplate[levelKey];
                    const label = levelKey === 'primary' ? 'Primaria' : 'Secundaria';
                    return (
                      <div key={levelKey} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={level.enabled}
                            onChange={(e) => updateLevel(levelKey, { enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        {level.enabled && (
                          <div className="ml-6 space-y-2 rounded border p-2 bg-background">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Desde</label>
                                <input
                                  type="number" min={1} max={9}
                                  value={level.year_from}
                                  onChange={(e) => updateLevel(levelKey, { year_from: parseInt(e.target.value) || 1 })}
                                  className={inputClass}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Hasta</label>
                                <input
                                  type="number" min={1} max={9}
                                  value={level.year_to}
                                  onChange={(e) => updateLevel(levelKey, { year_to: parseInt(e.target.value) || 1 })}
                                  className={inputClass}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs text-muted-foreground">Divisiones ({level.division_names.length})</label>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (level.division_names.length > 1) {
                                        updateLevel(levelKey, { division_names: level.division_names.slice(0, -1) });
                                      }
                                    }}
                                    disabled={level.division_names.length <= 1}
                                    className="inline-flex items-center justify-center rounded text-xs h-6 w-6 border border-input hover:bg-accent disabled:opacity-40"
                                  >-</button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (level.division_names.length < 9) {
                                        updateLevel(levelKey, { division_names: [...level.division_names, ''] });
                                      }
                                    }}
                                    disabled={level.division_names.length >= 9}
                                    className="inline-flex items-center justify-center rounded text-xs h-6 w-6 border border-input hover:bg-accent disabled:opacity-40"
                                  >+</button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {level.division_names.map((name, idx) => (
                                  <input
                                    key={idx}
                                    value={name}
                                    onChange={(e) => {
                                      const newNames = [...level.division_names];
                                      newNames[idx] = e.target.value;
                                      updateLevel(levelKey, { division_names: newNames });
                                    }}
                                    className={`${inputClass} w-24`}
                                    placeholder={`Div ${idx + 1}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="text-xs text-muted-foreground">Turnos:</label>
                              <label className="flex items-center gap-1.5 text-sm">
                                <input
                                  type="checkbox"
                                  checked={level.shifts.morning}
                                  onChange={(e) => updateLevel(levelKey, { shifts: { ...level.shifts, morning: e.target.checked } })}
                                  className="h-3.5 w-3.5 rounded border-input"
                                />
                                Manana
                              </label>
                              <label className="flex items-center gap-1.5 text-sm">
                                <input
                                  type="checkbox"
                                  checked={level.shifts.afternoon}
                                  onChange={(e) => updateLevel(levelKey, { shifts: { ...level.shifts, afternoon: e.target.checked } })}
                                  className="h-3.5 w-3.5 rounded border-input"
                                />
                                Tarde
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Preview */}
                  {coursesPreview > 0 && (
                    <div className="text-sm text-muted-foreground bg-primary/5 rounded p-2 text-center">
                      Se crearan <strong className="text-foreground">{coursesPreview}</strong> cursos
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createForm.slug || !createForm.name || !createForm.admin_email || !createForm.admin_password || !createForm.admin_full_name || !createForm.admin_birth_date || !createForm.admin_address || !createForm.admin_phone}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingSchool(null)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-lg font-semibold">Edit School</h2>
              <p className="text-sm text-muted-foreground">Editing: {editingSchool.slug}</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">School Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Active</label>
                <button
                  onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editForm.is_active ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editForm.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingSchool(null)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setDeletingSchool(null); setConfirmSlug(''); }}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-lg font-semibold">Eliminar colegio</h2>
              <p className="text-sm text-muted-foreground">
                <strong>{deletingSchool.name}</strong> ({deletingSchool.slug})
              </p>
            </div>

            {/* Deactivate option */}
            {deletingSchool.is_active && (
              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-medium">Desactivar</p>
                <p className="text-xs text-muted-foreground">
                  Los usuarios no podran iniciar sesion. La base de datos se conserva y se puede reactivar.
                </p>
                <button
                  onClick={() => handleDelete(false)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors bg-orange-600 text-white hover:bg-orange-700 h-9 px-4 py-2"
                >
                  Desactivar
                </button>
              </div>
            )}

            {/* Permanent delete option */}
            <div className="rounded-lg border border-destructive/50 p-3 space-y-2">
              <p className="text-sm font-medium text-destructive">Eliminar permanentemente</p>
              <p className="text-xs text-muted-foreground">
                Se eliminara la base de datos y todos los datos del colegio. Esta accion no se puede deshacer.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Escribi <strong>{deletingSchool.slug}</strong> para confirmar:
                </label>
                <input
                  value={confirmSlug}
                  onChange={(e) => setConfirmSlug(e.target.value)}
                  className={inputClass}
                  placeholder={deletingSchool.slug}
                />
              </div>
              <button
                onClick={() => handleDelete(true)}
                disabled={confirmSlug !== deletingSchool.slug}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2"
              >
                Eliminar permanentemente
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => { setDeletingSchool(null); setConfirmSlug(''); }}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
