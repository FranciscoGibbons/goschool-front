import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted",
          "focus-visible:outline-none focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
          className
        )}
        ref={ref}
        {...props}
      />

    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
