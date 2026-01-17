/**
 * Sacred Input Components
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * COMPONENTS:
 * - Input: Text, email, password, number inputs
 * - Select: Dropdown select
 * - Textarea: Multi-line text input
 *
 * FEATURES:
 * - Label support
 * - Help text
 * - Error state with message
 * - Consistent styling
 *
 * RULES:
 * - Always include a label
 * - Use error state for validation
 * - No custom styling
 * ==========================================================================
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// ==========================================================================
// Form Group (wrapper for label + input + help/error)
// ==========================================================================

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  )
);
FormGroup.displayName = "FormGroup";

// ==========================================================================
// Label
// ==========================================================================

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-text-primary", className)}
      {...props}
    >
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  )
);
Label.displayName = "Label";

// ==========================================================================
// Help Text
// ==========================================================================

const HelpText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-text-muted", className)}
    {...props}
  />
));
HelpText.displayName = "HelpText";

// ==========================================================================
// Error Message
// ==========================================================================

const ErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-error", className)}
    role="alert"
    {...props}
  />
));
ErrorMessage.displayName = "ErrorMessage";

// ==========================================================================
// Input
// ==========================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/**
 * Sacred Input
 *
 * @example
 * <FormGroup>
 *   <Label htmlFor="email" required>Correo electrónico</Label>
 *   <Input id="email" type="email" placeholder="ejemplo@correo.com" />
 *   <HelpText>Usaremos este correo para notificaciones</HelpText>
 * </FormGroup>
 *
 * @example
 * // With error
 * <FormGroup>
 *   <Label htmlFor="password">Contraseña</Label>
 *   <Input id="password" type="password" error />
 *   <ErrorMessage>La contraseña es requerida</ErrorMessage>
 * </FormGroup>
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full",
        "px-3 py-2",
        "text-sm text-text-primary",
        "bg-background",
        "border border-border rounded-md",
        "placeholder:text-text-muted",
        "transition-colors duration-150",
        "focus:outline-none focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
        error && "border-error focus:border-error",
        className
      )}
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ==========================================================================
// Textarea
// ==========================================================================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

/**
 * Sacred Textarea
 *
 * @example
 * <FormGroup>
 *   <Label htmlFor="notes">Notas</Label>
 *   <Textarea id="notes" placeholder="Escribe tus notas aquí..." />
 * </FormGroup>
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full",
        "px-3 py-2",
        "text-sm text-text-primary",
        "bg-background",
        "border border-border rounded-md",
        "placeholder:text-text-muted",
        "transition-colors duration-150",
        "focus:outline-none focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
        "resize-vertical",
        error && "border-error focus:border-error",
        className
      )}
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// ==========================================================================
// Native Select
// ==========================================================================

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

/**
 * Sacred Select (native)
 *
 * @example
 * <FormGroup>
 *   <Label htmlFor="course">Curso</Label>
 *   <Select id="course">
 *     <option value="">Selecciona un curso</option>
 *     <option value="1">1° Primaria</option>
 *     <option value="2">2° Primaria</option>
 *   </Select>
 * </FormGroup>
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      className={cn(
        "flex h-10 w-full",
        "px-3 py-2 pr-8",
        "text-sm text-text-primary",
        "bg-background",
        "border border-border rounded-md",
        "cursor-pointer",
        "appearance-none",
        "bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em]",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]",
        "transition-colors duration-150",
        "focus:outline-none focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
        error && "border-error focus:border-error",
        className
      )}
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

// ==========================================================================
// Exports
// ==========================================================================

export {
  FormGroup,
  Label,
  HelpText,
  ErrorMessage,
  Input,
  Textarea,
  Select,
};
