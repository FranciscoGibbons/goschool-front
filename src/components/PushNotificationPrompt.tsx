"use client";

import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { X, Bell } from "lucide-react";

const DISMISS_KEY = "push_prompt_dismissed_at";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function PushNotificationPrompt() {
  const { isSupported, isSubscribed, permission, subscribe } =
    usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSupported || isSubscribed || permission !== "default") {
      return;
    }

    // Check if user recently dismissed the prompt
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) {
        return;
      }
    }

    // Show after a short delay to not be intrusive
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission]);

  const handleAccept = async () => {
    setVisible(false);
    await subscribe();
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Activar notificaciones
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Recibe avisos de calificaciones, mensajes y mas en tiempo real.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAccept}
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Activar
              </button>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center justify-center rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
