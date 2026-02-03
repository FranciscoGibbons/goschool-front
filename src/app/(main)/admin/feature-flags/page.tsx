"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FeatureFlag {
  id: number;
  feature: string;
  is_enabled: boolean;
}

export default function FeatureFlagsPage() {
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchFlags = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/admin/feature-flags", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Error al cargar los módulos");
      }

      const data = await res.json();
      setFlags(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggle = async (flag: FeatureFlag) => {
    setUpdatingId(flag.id);
    try {
      const res = await fetch(`/api/proxy/admin/feature-flags/${flag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_enabled: !flag.is_enabled }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al actualizar");
      }

      setFlags((prev) =>
        prev.map((f) =>
          f.id === flag.id ? { ...f, is_enabled: !f.is_enabled } : f
        )
      );
      toast.success(
        `Módulo "${flag.feature}" ${!flag.is_enabled ? "activado" : "desactivado"}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Módulos</h1>
          <p className="text-muted-foreground">
            Activa o desactiva funcionalidades del sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Funcionalidades
          </CardTitle>
          <CardDescription>
            Controla qué módulos están disponibles para los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay módulos configurados
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <Label
                    htmlFor={`flag-${flag.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {flag.feature}
                  </Label>
                  <Switch
                    id={`flag-${flag.id}`}
                    checked={flag.is_enabled}
                    onCheckedChange={() => handleToggle(flag)}
                    disabled={updatingId === flag.id}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
