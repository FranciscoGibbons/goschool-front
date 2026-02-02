'use client';

import { useEffect, useState, useCallback } from 'react';
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

export default function SchoolsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({ slug: '', name: '', admin_email: '', admin_password: '', admin_full_name: '', admin_birth_date: '', admin_address: '', admin_phone: '' });
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', is_active: true });

  // Delete state
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);

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

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/proxy/superadmin/schools/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Failed to create school');
        return;
      }
      toast.success('School created successfully');
      setShowCreate(false);
      setCreateForm({ slug: '', name: '', admin_email: '', admin_password: '', admin_full_name: '', admin_birth_date: '', admin_address: '', admin_phone: '' });
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

  const handleDelete = async () => {
    if (!deletingSchool) return;
    try {
      const res = await fetch(`/api/proxy/superadmin/schools/${deletingSchool.id}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        toast.error('Failed to deactivate school');
        return;
      }
      toast.success('School deactivated');
      setDeletingSchool(null);
      fetchSchools();
    } catch {
      toast.error('Connection error');
    }
  };

  const openEdit = (school: School) => {
    setEditingSchool(school);
    setEditForm({ name: school.name, is_active: school.is_active });
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
                        {school.is_active && (
                          <button
                            onClick={() => setDeletingSchool(school)}
                            className="inline-flex items-center justify-center rounded-md text-sm h-8 w-8 hover:bg-destructive/10 text-destructive transition-colors"
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="my-school"
                />
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only. Will be used as subdomain.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">School Name</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="admin@school.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Admin Password</label>
                <input
                  type="password"
                  value={createForm.admin_password}
                  onChange={(e) => setCreateForm({ ...createForm, admin_password: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Juan Perez"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Birth Date</label>
                <input
                  type="date"
                  value={createForm.admin_birth_date}
                  onChange={(e) => setCreateForm({ ...createForm, admin_birth_date: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address</label>
                <input
                  value={createForm.admin_address}
                  onChange={(e) => setCreateForm({ ...createForm, admin_address: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Av. Siempreviva 742"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <input
                  value={createForm.admin_phone}
                  onChange={(e) => setCreateForm({ ...createForm, admin_phone: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="341-1234567"
                />
              </div>
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeletingSchool(null)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-lg font-semibold">Deactivate School?</h2>
              <p className="text-sm text-muted-foreground">
                This will deactivate <strong>{deletingSchool.name}</strong> ({deletingSchool.slug}).
                Users will no longer be able to log in. The database will not be deleted.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingSchool(null)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
