"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import useNotificationStore from "@/store/notificationStore";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  grade: "Calificacion",
  message: "Mensaje",
  assessment: "Evaluacion",
  event: "Evento",
  sanction: "Conducta",
  attendance: "Asistencia",
  chat: "Chat",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default function NotificationBell({ className }: { className?: string }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    startPolling,
    stopPolling,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to shared polling on mount, unsubscribe on unmount
  useEffect(() => {
    startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md transition-colors hover:bg-surface-muted"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
      >
        <Bell className="h-5 w-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 max-h-96 bg-surface border border-border rounded-lg shadow-lg z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text-primary">Notificaciones</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 border-2 border-border border-t-primary rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bell className="h-8 w-8 text-text-muted mb-2" />
                <p className="text-sm text-text-secondary">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors",
                    n.is_read
                      ? "bg-surface hover:bg-surface-muted"
                      : "bg-primary/5 hover:bg-primary/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {n.is_read ? (
                        <Check className="h-4 w-4 text-text-muted" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-secondary">
                          {TYPE_LABELS[n.type] || n.type}
                        </span>
                        <span className="text-xs text-text-muted">{timeAgo(n.created_at)}</span>
                      </div>
                      <p className="text-sm font-medium text-text-primary mt-0.5 truncate">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2.5 text-center">
              <p className="text-xs text-text-muted">
                {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo leido"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
