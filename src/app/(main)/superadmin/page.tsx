'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle, XCircle } from 'lucide-react';

interface DashboardStats {
  total_schools: number;
  active_schools: number;
  inactive_schools: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy/superadmin/dashboard/', {
        credentials: 'include',
      });
      if (res.status === 401) {
        router.push('/superadmin-login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = stats
    ? [
        { label: 'Total Schools', value: stats.total_schools, icon: Building2, color: 'text-blue-600' },
        { label: 'Active', value: stats.active_schools, icon: CheckCircle, color: 'text-green-600' },
        { label: 'Inactive', value: stats.inactive_schools, icon: XCircle, color: 'text-red-600' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of the Klass platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-3" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            ))
          : statCards.map((card) => (
              <div key={card.label} className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            ))}
      </div>
    </div>
  );
}
