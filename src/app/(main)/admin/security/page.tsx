"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Shield,
  Activity,
  ArrowLeft,
  Clock,
  UserCheck,
  AlertTriangle,
  Server,
  Database,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface SystemStats {
  total_assessments: number;
  total_grades: number;
  total_messages: number;
  total_sessions: number;
  logins_today: number;
}

interface SecurityOverview {
  active_sessions: number;
  logins_today: number;
  failed_logins_today: number;
  total_failed_logins: number;
}

interface TrafficStats {
  hour: number;
  request_count: number;
  unique_users: number;
}

export default function SecurityPage() {
  const router = useRouter();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [securityOverview, setSecurityOverview] = useState<SecurityOverview | null>(null);
  const [trafficStats, setTrafficStats] = useState<TrafficStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const fetchTrafficStats = useCallback(async (date: string) => {
    setIsLoadingTraffic(true);
    try {
      const trafficRes = await fetch(`/api/proxy/admin/traffic/stats?day=${date}`, {
        credentials: "include",
      });
      if (trafficRes.ok) {
        const traffic = await trafficRes.json();
        setTrafficStats(traffic);
      } else {
        setTrafficStats([]);
      }
    } catch (err) {
      console.error("Error fetching traffic stats:", err);
      setTrafficStats([]);
    } finally {
      setIsLoadingTraffic(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [systemRes, securityRes] = await Promise.all([
          fetch("/api/proxy/admin/system/stats", { credentials: "include" }),
          fetch("/api/proxy/admin/security/overview", { credentials: "include" }),
        ]);

        if (!systemRes.ok && systemRes.status === 401) {
          router.push("/dashboard");
          return;
        }

        const [system, security] = await Promise.all([
          systemRes.ok ? systemRes.json() : null,
          securityRes.ok ? securityRes.json() : null,
        ]);

        setSystemStats(system);
        setSecurityOverview(security);

        // Fetch initial traffic stats
        await fetchTrafficStats(selectedDate);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, fetchTrafficStats, selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchTrafficStats(date);
  };

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    const newDate = date.toISOString().split('T')[0];
    handleDateChange(newDate);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const today = new Date().toISOString().split('T')[0];
    const newDate = date.toISOString().split('T')[0];
    // Don't allow future dates
    if (newDate <= today) {
      handleDateChange(newDate);
    }
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    handleDateChange(today);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  const getFailedLoginsBadge = (count: number) => {
    if (count === 0) return "bg-green-100 text-green-800";
    if (count < 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seguridad y Sistema</h1>
          <p className="text-muted-foreground">
            Monitoreo de seguridad y estadisticas del sistema
          </p>
        </div>
      </div>

      {/* Security Overview */}
      {securityOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Resumen de Seguridad
            </CardTitle>
            <CardDescription>
              Estado actual de sesiones y autenticacion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{securityOverview.active_sessions}</p>
                  <p className="text-sm text-muted-foreground">Sesiones activas</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{securityOverview.logins_today}</p>
                  <p className="text-sm text-muted-foreground">Inicios de sesion hoy</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{securityOverview.failed_logins_today}</p>
                  <p className="text-sm text-muted-foreground">Intentos fallidos hoy</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-3 bg-red-100 rounded-full">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{securityOverview.total_failed_logins}</p>
                  <p className="text-sm text-muted-foreground">Total intentos fallidos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Stats */}
      {systemStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estadisticas del Sistema
            </CardTitle>
            <CardDescription>
              Metricas generales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_assessments}</p>
                  <p className="text-xs text-muted-foreground">Evaluaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_grades}</p>
                  <p className="text-xs text-muted-foreground">Calificaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_messages}</p>
                  <p className="text-xs text-muted-foreground">Mensajes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_sessions}</p>
                  <p className="text-xs text-muted-foreground">Sesiones Activas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.logins_today}</p>
                  <p className="text-xs text-muted-foreground">Logins Hoy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traffic Stats */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Trafico por Dia
              </CardTitle>
              <CardDescription>
                Solicitudes y usuarios unicos por hora
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousDay}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-auto"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextDay}
                disabled={isToday}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                >
                  Hoy
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 capitalize">
            {formatDisplayDate(selectedDate)}
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingTraffic ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : trafficStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead className="text-center">Solicitudes</TableHead>
                  <TableHead className="text-center">Usuarios Unicos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficStats.map((stat) => (
                  <TableRow key={stat.hour}>
                    <TableCell className="font-medium">
                      {String(stat.hour).padStart(2, '0')}:00 - {String(stat.hour).padStart(2, '0')}:59
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{stat.request_count}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {stat.unique_users}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No hay datos de trafico para este dia</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informacion del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-green-500" />
              <p>Las sesiones expiran automaticamente despues de 1 hora de inactividad.</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-green-500" />
              <p>Los tokens JWT utilizan firma ES256 para maxima seguridad.</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-green-500" />
              <p>Los intentos de inicio de sesion fallidos se registran para auditoria.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
