import * as React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label
        className={
          "inline-flex items-center gap-2 cursor-pointer " + (className || "")
        }
      >
        <input
          type="checkbox"
          ref={ref}
          className="accent-primary w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary"
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
