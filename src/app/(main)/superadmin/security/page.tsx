"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Clock,
  UserCheck,
  Ban,
  Hash,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Monitor,
  HardDrive,
  MemoryStick,
  Database,
  Gauge,
  AlertTriangle,
  Users,
} from "lucide-react";

interface SecurityOverview {
  active_sessions: number;
  total_sessions: number;
  sessions_today: number;
  revoked_sessions: number;
  total_failed_logins_today: number;
}

interface Session {
  session_id: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  revoked_at: string | null;
  status: string;
}

interface PaginatedSessions {
  sessions: Session[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface SystemHealth {
  uploaded_files: number;
  remainig_space: number;
  used_space_mb: number;
  limit_mb: number;
  used_mb: number;
  latency: number;
}

interface School {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
}

interface FailedLogin {
  id: number;
  email_tried: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  school_slug: string;
}

interface PaginatedFailedLogins {
  attempts: FailedLogin[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface TenantSession {
  session_id: string;
  user_id: number;
  ip: string | null;
  user_agent: string | null;
  is_temp: boolean;
  created_at: string;
  revoked_at: string | null;
  school_slug: string;
  status: string;
}

interface PaginatedTenantSessions {
  sessions: TenantSession[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown";
  let browser = "Unknown Browser";
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("curl/")) browser = "curl";
  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X") || ua.includes("Macintosh")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  return `${browser} / ${os}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

function formatMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

export default function SuperAdminSecurityPage() {
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [paginatedSessions, setPaginatedSessions] =
    useState<PaginatedSessions | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New state
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [failedLogins, setFailedLogins] =
    useState<PaginatedFailedLogins | null>(null);
  const [failedLoginsPage, setFailedLoginsPage] = useState(1);
  const [tenantSessions, setTenantSessions] =
    useState<PaginatedTenantSessions | null>(null);
  const [tenantSessionsPage, setTenantSessionsPage] = useState(1);

  const fetchOverview = useCallback(async () => {
    const res = await fetch("/api/proxy/superadmin/security/overview/", {
      credentials: "include",
    });
    if (res.ok) setOverview(await res.json());
  }, []);

  const fetchActiveSessions = useCallback(async () => {
    const res = await fetch("/api/proxy/superadmin/sessions/active/", {
      credentials: "include",
    });
    if (res.ok) setActiveSessions(await res.json());
  }, []);

  const fetchAllSessions = useCallback(async (page: number) => {
    const res = await fetch(
      `/api/proxy/superadmin/sessions/?page=${page}&per_page=20`,
      { credentials: "include" }
    );
    if (res.ok) {
      const data = await res.json();
      setPaginatedSessions(data);
      setCurrentPage(data.page);
    }
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    const res = await fetch("/api/proxy/superadmin/security/system/", {
      credentials: "include",
    });
    if (res.ok) setSystemHealth(await res.json());
  }, []);

  const fetchSchools = useCallback(async () => {
    const res = await fetch("/api/proxy/superadmin/schools/", {
      credentials: "include",
    });
    if (res.ok) {
      const data: School[] = await res.json();
      setSchools(data.filter((s) => s.is_active));
    }
  }, []);

  const fetchFailedLogins = useCallback(
    async (page: number, school: string) => {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "20",
      });
      if (school) params.set("school", school);
      const res = await fetch(
        `/api/proxy/superadmin/failed-logins/?${params}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setFailedLogins(data);
        setFailedLoginsPage(data.page);
      }
    },
    []
  );

  const fetchTenantSessions = useCallback(
    async (page: number, school: string) => {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "20",
      });
      if (school) params.set("school", school);
      const res = await fetch(
        `/api/proxy/superadmin/sessions/schools/?${params}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setTenantSessions(data);
        setTenantSessionsPage(data.page);
      }
    },
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchOverview(),
          fetchActiveSessions(),
          fetchAllSessions(1),
          fetchSystemHealth(),
          fetchSchools(),
          fetchFailedLogins(1, ""),
          fetchTenantSessions(1, ""),
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [
    fetchOverview,
    fetchActiveSessions,
    fetchAllSessions,
    fetchSystemHealth,
    fetchSchools,
    fetchFailedLogins,
    fetchTenantSessions,
  ]);

  const handleSchoolChange = (value: string) => {
    setSelectedSchool(value);
    setFailedLoginsPage(1);
    setTenantSessionsPage(1);
    fetchFailedLogins(1, value);
    fetchTenantSessions(1, value);
  };

  const handleRevoke = async (sessionId: string) => {
    if (!confirm("Are you sure you want to revoke this session?")) return;
    setIsRevoking(sessionId);
    try {
      const res = await fetch(
        `/api/proxy/superadmin/sessions/${sessionId}/`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        await Promise.all([
          fetchOverview(),
          fetchActiveSessions(),
          fetchAllSessions(currentPage),
        ]);
      } else {
        const msg = await res.json();
        alert(typeof msg === "string" ? msg : "Failed to revoke session");
      }
    } catch {
      alert("Failed to revoke session");
    } finally {
      setIsRevoking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success-muted text-success">Activa</Badge>
        );
      case "revoked":
        return <Badge className="bg-error-muted text-error">Revocada</Badge>;
      case "expired":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Expirada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seguridad</h1>
        <p className="text-muted-foreground">
          Sesiones de superadmin, salud del sistema y seguridad de colegios
        </p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success-muted rounded-full">
                  <Activity className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {overview.active_sessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sesiones activas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-status-info-muted rounded-full">
                  <Hash className="h-6 w-6 text-status-info" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {overview.total_sessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sesiones totales
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning-muted rounded-full">
                  <UserCheck className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {overview.sessions_today}
                  </p>
                  <p className="text-sm text-muted-foreground">Sesiones hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-error-muted rounded-full">
                  <Ban className="h-6 w-6 text-error" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {overview.revoked_sessions}
                  </p>
                  <p className="text-sm text-muted-foreground">Revocadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-error-muted rounded-full">
                  <AlertTriangle className="h-6 w-6 text-error" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {overview.total_failed_logins_today}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Failed logins hoy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Health */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Salud del Sistema
            </CardTitle>
            <CardDescription>
              Disco, memoria y latencia de base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Disk */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Disco</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Usado</span>
                    <span className="font-medium">
                      {formatMB(systemHealth.used_space_mb)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        systemHealth.remainig_space > 0 &&
                        systemHealth.used_space_mb /
                          (systemHealth.used_space_mb +
                            systemHealth.remainig_space) >
                          0.9
                          ? "bg-error"
                          : systemHealth.remainig_space > 0 &&
                              systemHealth.used_space_mb /
                                (systemHealth.used_space_mb +
                                  systemHealth.remainig_space) >
                                0.7
                            ? "bg-warning"
                            : "bg-success"
                      }`}
                      style={{
                        width: `${
                          systemHealth.remainig_space > 0
                            ? Math.round(
                                (systemHealth.used_space_mb /
                                  (systemHealth.used_space_mb +
                                    systemHealth.remainig_space)) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disponible</span>
                    <span className="font-medium">
                      {formatMB(systemHealth.remainig_space)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Archivos subidos
                    </span>
                    <span className="font-medium">
                      {systemHealth.uploaded_files}
                    </span>
                  </div>
                </div>
              </div>

              {/* RAM */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Memoria RAM</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Usada</span>
                    <span className="font-medium">
                      {formatMB(systemHealth.used_mb)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        systemHealth.limit_mb > 0 &&
                        systemHealth.used_mb / systemHealth.limit_mb > 0.9
                          ? "bg-error"
                          : systemHealth.limit_mb > 0 &&
                              systemHealth.used_mb / systemHealth.limit_mb > 0.7
                            ? "bg-warning"
                            : "bg-success"
                      }`}
                      style={{
                        width: `${
                          systemHealth.limit_mb > 0
                            ? Math.round(
                                (systemHealth.used_mb /
                                  systemHealth.limit_mb) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">
                      {formatMB(systemHealth.limit_mb)}
                    </span>
                  </div>
                </div>
              </div>

              {/* DB Latency */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Base de Datos</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-4xl font-bold">{systemHealth.latency}</p>
                  <span className="text-muted-foreground text-sm">ms</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Latencia (SELECT 1)
                </p>
                <Badge
                  className={
                    systemHealth.latency < 10
                      ? "bg-success-muted text-success"
                      : systemHealth.latency < 50
                        ? "bg-warning-muted text-warning"
                        : "bg-error-muted text-error"
                  }
                >
                  {systemHealth.latency < 10
                    ? "Excelente"
                    : systemHealth.latency < 50
                      ? "Normal"
                      : "Lenta"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sesiones Activas
          </CardTitle>
          <CardDescription>
            Sesiones de superadmin activas en este momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Navegador / SO</TableHead>
                  <TableHead>Iniciada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell className="font-mono text-sm">
                      {session.ip || "\u2014"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {parseUserAgent(session.user_agent)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {timeAgo(session.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isRevoking === session.session_id}
                        onClick={() => handleRevoke(session.session_id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        {isRevoking === session.session_id
                          ? "Revocando..."
                          : "Revocar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No hay sesiones activas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Sessions (paginated) */}
      {paginatedSessions && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historial de Sesiones
                </CardTitle>
                <CardDescription>
                  Todas las sesiones de superadmin ({paginatedSessions.total}{" "}
                  total)
                </CardDescription>
              </div>
              {paginatedSessions.total_pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage <= 1}
                    onClick={() => fetchAllSessions(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentPage} / {paginatedSessions.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage >= paginatedSessions.total_pages}
                    onClick={() => fetchAllSessions(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {paginatedSessions.sessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Navegador / SO</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Revocada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSessions.sessions.map((session) => (
                    <TableRow key={session.session_id}>
                      <TableCell className="font-mono text-xs">
                        {session.session_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {session.ip || "\u2014"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {parseUserAgent(session.user_agent)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(session.created_at)}
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.revoked_at
                          ? formatDate(session.revoked_at)
                          : "\u2014"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No hay sesiones registradas</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* School Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seguridad por Colegio
          </CardTitle>
          <CardDescription>
            Sesiones e intentos de login fallidos de los colegios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <label
              htmlFor="school-filter"
              className="text-sm font-medium text-muted-foreground"
            >
              Filtrar por colegio:
            </label>
            <select
              id="school-filter"
              value={selectedSchool}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Todos los colegios</option>
              {schools.map((school) => (
                <option key={school.slug} value={school.slug}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Failed Login Attempts */}
      {failedLogins && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Intentos de Login Fallidos
                </CardTitle>
                <CardDescription>
                  {failedLogins.total} intentos registrados
                  {selectedSchool
                    ? ` en ${selectedSchool}`
                    : " en todos los colegios"}
                </CardDescription>
              </div>
              {failedLogins.total_pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={failedLoginsPage <= 1}
                    onClick={() =>
                      fetchFailedLogins(failedLoginsPage - 1, selectedSchool)
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {failedLoginsPage} / {failedLogins.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={failedLoginsPage >= failedLogins.total_pages}
                    onClick={() =>
                      fetchFailedLogins(failedLoginsPage + 1, selectedSchool)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {failedLogins.attempts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colegio</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Navegador / SO</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedLogins.attempts.map((attempt) => (
                    <TableRow key={`${attempt.school_slug}-${attempt.id}`}>
                      <TableCell>
                        <Badge variant="outline">{attempt.school_slug}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {attempt.email_tried}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {attempt.ip || "\u2014"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {parseUserAgent(attempt.user_agent)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(attempt.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No hay intentos de login fallidos</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tenant Sessions */}
      {tenantSessions && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Sesiones de Colegios
                </CardTitle>
                <CardDescription>
                  {tenantSessions.total} sesiones
                  {selectedSchool
                    ? ` en ${selectedSchool}`
                    : " en todos los colegios"}
                </CardDescription>
              </div>
              {tenantSessions.total_pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={tenantSessionsPage <= 1}
                    onClick={() =>
                      fetchTenantSessions(
                        tenantSessionsPage - 1,
                        selectedSchool
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {tenantSessionsPage} / {tenantSessions.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={
                      tenantSessionsPage >= tenantSessions.total_pages
                    }
                    onClick={() =>
                      fetchTenantSessions(
                        tenantSessionsPage + 1,
                        selectedSchool
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {tenantSessions.sessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colegio</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Navegador / SO</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantSessions.sessions.map((session) => (
                    <TableRow
                      key={`${session.school_slug}-${session.session_id}`}
                    >
                      <TableCell>
                        <Badge variant="outline">{session.school_slug}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {session.session_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {session.user_id}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {session.ip || "\u2014"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {parseUserAgent(session.user_agent)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(session.created_at)}
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No hay sesiones de colegios</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
