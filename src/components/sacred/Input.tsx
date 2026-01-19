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
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";


// ==========================================================================
// Form Group (wrapper for label + input + help/error)
// ==========================================================================

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
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

export type SelectProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;
export type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;
export type SelectContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;
export type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;
export type SelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;
export type SelectSeparatorProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>;


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
        "flex h-11 w-full",
        "px-3 py-2",
        "text-sm text-text-primary",
        "bg-surface",
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
        "flex min-h-[96px] w-full",
        "px-3 py-2",
        "text-sm text-text-primary",
        "bg-surface",
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

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

/**
 * Sacred Native Select
 *
 * @example
 * <FormGroup>
 *   <Label htmlFor="course">Curso</Label>
 *   <NativeSelect id="course">
 *     <option value="">Selecciona un curso</option>
 *     <option value="1">1° Primaria</option>
 *     <option value="2">2° Primaria</option>
 *   </NativeSelect>
 * </FormGroup>
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      className={cn(
        "flex h-11 w-full",
        "px-3 py-2 pr-8",
        "text-sm text-text-primary",
        "bg-surface",
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
NativeSelect.displayName = "NativeSelect";

// ==========================================================================
// Radix Select
// ==========================================================================

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between",
      "rounded-md border border-border bg-surface",
      "px-3 py-2 text-sm text-text-primary",
      "placeholder:text-text-muted",
      "transition-colors duration-150",
      "focus:outline-none focus:border-primary",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-text-muted" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden",
        "rounded-md border border-border bg-surface text-text-primary shadow-sm",
        "data-[state=open]:animate-fade-in",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full select-none items-center rounded-sm",
      "py-1.5 pl-8 pr-2 text-sm text-text-primary",
      "outline-none transition-colors",
      "focus:bg-surface-muted focus:text-text-primary",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  SelectLabelProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-medium text-text-secondary", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4 rotate-180 text-text-muted" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4 text-text-muted" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  FormGroup,
  Label,
  HelpText,
  ErrorMessage,
  Input,
  Textarea,
  NativeSelect,
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectLabel,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

