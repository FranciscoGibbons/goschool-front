"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  window_end: string;
  requests_total: number;
  bytes_in: number;
  bytes_out: number;
  errors_4xx: number;
  errors_5xx: number;
}

export default function SecurityPage() {
  const router = useRouter();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [securityOverview, setSecurityOverview] = useState<SecurityOverview | null>(null);
  const [trafficStats, setTrafficStats] = useState<TrafficStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchTrafficStats(date);
  };

  const handlePreviousDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day - 1);
    const newDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    handleDateChange(newDate);
  };

  const handleNextDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day + 1);
    const newDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    // Don't allow future dates
    if (newDate <= today) {
      handleDateChange(newDate);
    }
  };

  const handleToday = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    handleDateChange(today);
  };

  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const isToday = selectedDate === getTodayString();

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFailedLoginsBadge = (count: number) => {
    if (count === 0) return "bg-success-muted text-success";
    if (count < 10) return "bg-warning-muted text-warning";
    return "bg-error-muted text-error";
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
                <div className="p-3 bg-status-info-muted rounded-full">
                  <Clock className="h-6 w-6 text-status-info" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{securityOverview.active_sessions}</p>
                  <p className="text-sm text-muted-foreground">Sesiones activas</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-3 bg-success-muted rounded-full">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{securityOverview.logins_today}</p>
                  <p className="text-sm text-muted-foreground">Inicios de sesion hoy</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-3 bg-warning-muted rounded-full">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{securityOverview.failed_logins_today}</p>
                  <p className="text-sm text-muted-foreground">Intentos fallidos hoy</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-3 bg-error-muted rounded-full">
                  <Shield className="h-6 w-6 text-error" />
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
                <div className="p-2 bg-icon-security-muted rounded-lg">
                  <FileText className="h-5 w-5 text-icon-security" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_assessments}</p>
                  <p className="text-xs text-muted-foreground">Evaluaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-icon-academic-muted rounded-lg">
                  <BarChart3 className="h-5 w-5 text-icon-academic" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_grades}</p>
                  <p className="text-xs text-muted-foreground">Calificaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-icon-messages-muted rounded-lg">
                  <MessageSquare className="h-5 w-5 text-icon-messages" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_messages}</p>
                  <p className="text-xs text-muted-foreground">Mensajes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-icon-stats-muted rounded-lg">
                  <Users className="h-5 w-5 text-icon-stats" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_sessions}</p>
                  <p className="text-xs text-muted-foreground">Sesiones Activas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-icon-users-muted rounded-lg">
                  <UserCheck className="h-5 w-5 text-icon-users" />
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
                Solicitudes, transferencia y errores por ventana de tiempo
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
                  max={getTodayString()}
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
                  <TableHead className="text-center">Entrada</TableHead>
                  <TableHead className="text-center">Salida</TableHead>
                  <TableHead className="text-center">4xx</TableHead>
                  <TableHead className="text-center">5xx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficStats.map((stat) => {
                  const end = new Date(stat.window_end);
                  const start = new Date(end.getTime() - 15 * 60 * 1000);
                  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                  return (
                    <TableRow key={stat.window_end}>
                      <TableCell className="font-medium">
                        {fmt(start)} - {fmt(end)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{stat.requests_total}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {formatBytes(stat.bytes_in)}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {formatBytes(stat.bytes_out)}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.errors_4xx > 0 ? (
                          <Badge variant="outline" className="text-warning border-warning">
                            {stat.errors_4xx}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.errors_5xx > 0 ? (
                          <Badge variant="outline" className="text-error border-error">
                            {stat.errors_5xx}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
              <Shield className="h-4 w-4 mt-0.5 text-success" />
              <p>Las sesiones expiran automaticamente despues de 1 hora de inactividad.</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-success" />
              <p>Los tokens JWT utilizan firma ES256 para maxima seguridad.</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-success" />
              <p>Los intentos de inicio de sesion fallidos se registran para auditoria.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
