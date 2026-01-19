import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary",
          "placeholder:text-text-muted",
          "focus-visible:outline-none focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
          "transition-colors duration-150",
          className
        )}
        ref={ref}
        {...props}
      />

    )
  }
)
Input.displayName = "Input"

export { Input }
