'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Lock, LockOpen } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface FeatureFlag {
  id: number;
  feature: string;
  is_enabled: boolean;
  locked_by_superadmin: boolean;
}

const inputClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function SchoolFeaturesPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchFlags = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proxy/superadmin/schools/${slug}/feature-flags/`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        router.push('/superadmin-login');
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Error loading features');
        return;
      }
      const data = await res.json();
      setFlags(data);
    } catch {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  }, [router, slug]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggleEnabled = async (flag: FeatureFlag) => {
    if (flag.locked_by_superadmin) return;
    setUpdatingId(flag.id);
    try {
      const res = await fetch(`/api/proxy/superadmin/schools/${slug}/feature-flags/${flag.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          is_enabled: !flag.is_enabled,
          locked_by_superadmin: flag.locked_by_superadmin,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Error');
        return;
      }
      setFlags((prev) =>
        prev.map((f) =>
          f.id === flag.id ? { ...f, is_enabled: !f.is_enabled } : f
        )
      );
      toast.success(`"${flag.feature}" ${!flag.is_enabled ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Connection error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleLock = async (flag: FeatureFlag) => {
    const newLocked = !flag.locked_by_superadmin;
    setUpdatingId(flag.id);
    try {
      const res = await fetch(`/api/proxy/superadmin/schools/${slug}/feature-flags/${flag.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          is_enabled: newLocked ? false : flag.is_enabled,
          locked_by_superadmin: newLocked,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(typeof data === 'string' ? data : data.error || 'Error');
        return;
      }
      setFlags((prev) =>
        prev.map((f) =>
          f.id === flag.id
            ? { ...f, locked_by_superadmin: newLocked, is_enabled: newLocked ? false : f.is_enabled }
            : f
        )
      );
      toast.success(
        newLocked
          ? `"${flag.feature}" locked - admin cannot change it`
          : `"${flag.feature}" unlocked - admin can now toggle it`
      );
    } catch {
      toast.error('Connection error');
    } finally {
      setUpdatingId(null);
    }
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
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">
            Manage features for <span className="font-mono font-medium text-foreground">{slug}</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Lock a feature to force it off and prevent the school admin from re-enabling it.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Feature</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Enabled</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Locked</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td colSpan={3} className="px-4 py-4">
                      <div className="h-5 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : flags.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No feature flags found
                  </td>
                </tr>
              ) : (
                flags.map((flag) => (
                  <tr
                    key={flag.id}
                    className={`border-b transition-colors ${
                      flag.locked_by_superadmin
                        ? 'bg-destructive/5'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{flag.feature}</span>
                        {flag.locked_by_superadmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                            <Lock className="h-3 w-3" />
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleEnabled(flag)}
                        disabled={updatingId === flag.id || flag.locked_by_superadmin}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          flag.is_enabled ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            flag.is_enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleLock(flag)}
                        disabled={updatingId === flag.id}
                        className={`${inputClass} h-8 px-3 gap-1.5 border ${
                          flag.locked_by_superadmin
                            ? 'border-destructive/50 text-destructive hover:bg-destructive/10'
                            : 'border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        } disabled:opacity-50 disabled:pointer-events-none`}
                        title={flag.locked_by_superadmin ? 'Unlock this feature' : 'Lock this feature'}
                      >
                        {flag.locked_by_superadmin ? (
                          <>
                            <LockOpen className="h-3.5 w-3.5" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            Lock
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
