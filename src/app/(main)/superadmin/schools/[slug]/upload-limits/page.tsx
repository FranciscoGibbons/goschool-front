'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, HardDrive, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface UploadLimit {
  id: number;
  category: string;
  max_size_mb: number;
}

const categoryLabels: Record<string, string> = {
  profile_pictures: 'Fotos de perfil',
  documents: 'Documentos',
  videos: 'Videos',
  chat_files: 'Archivos de chat',
};

const categoryDescriptions: Record<string, string> = {
  profile_pictures: 'Tamaño máximo para fotos de perfil de usuarios',
  documents: 'Tamaño máximo para documentos (PDF, DOCX)',
  videos: 'Tamaño máximo para videos subidos',
  chat_files: 'Tamaño máximo para archivos en el chat',
};

export default function SchoolUploadLimitsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [limits, setLimits] = useState<UploadLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLimit, setEditingLimit] = useState<UploadLimit | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLimits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proxy/superadmin/schools/${slug}/upload-limits/`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        router.push('/superadmin-login');
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Error loading limits');
        return;
      }
      const data = await res.json();
      setLimits(data);
    } catch {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  }, [router, slug]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const handleEdit = (limit: UploadLimit) => {
    setEditingLimit(limit);
    setEditValue(limit.max_size_mb);
  };

  const handleSave = async () => {
    if (!editingLimit) return;

    if (editValue < 1 || editValue > 500) {
      toast.error('El valor debe estar entre 1 y 500 MB');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/proxy/superadmin/schools/${slug}/upload-limits/${editingLimit.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ max_size_mb: editValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Error');
        return;
      }

      setLimits((prev) =>
        prev.map((l) =>
          l.id === editingLimit.id ? { ...l, max_size_mb: editValue } : l
        )
      );
      toast.success(`Límite de "${categoryLabels[editingLimit.category] || editingLimit.category}" actualizado`);
      setEditingLimit(null);
    } catch {
      toast.error('Connection error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingLimit(null);
    setEditValue(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/superadmin/schools">
          <button className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Límites de Subida</h1>
          <p className="text-muted-foreground">
            Configurar límites para <span className="font-mono font-medium text-foreground">{slug}</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Define el tamaño máximo de archivos que los usuarios pueden subir en cada categoría (1-500 MB).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descripción</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Límite (MB)</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="h-5 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : limits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron límites de subida
                  </td>
                </tr>
              ) : (
                limits.map((limit) => (
                  <tr key={limit.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {categoryLabels[limit.category] || limit.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {categoryDescriptions[limit.category] || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {limit.max_size_mb} MB
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(limit)}
                        className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-input text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleCancel}
          />
          <div className="relative z-50 w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-1">
              Editar Límite de Subida
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {categoryLabels[editingLimit.category] || editingLimit.category}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Tamaño máximo (MB)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={editValue}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Valor entre 1 y 500 MB
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="h-9 px-4 rounded-md border border-input text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || editValue < 1 || editValue > 500}
                  className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
