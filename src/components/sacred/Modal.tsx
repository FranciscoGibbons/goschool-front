/**
 * Sacred Modal Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * USAGE:
 * - Confirmations only (per DESIGN_CONTRACT.md)
 * - No decorative modals
 * - Must be closable via keyboard (Escape)
 *
 * VARIANTS:
 * - confirmation: Standard confirmation dialog
 * - alert: Alert/warning dialog
 * - danger: Destructive action confirmation
 *
 * RULES:
 * - Focus trap is mandatory
 * - Must have clear title and action
 * - No complex forms in modals
 * ==========================================================================
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

// ==========================================================================
// Modal Root
// ==========================================================================

const Modal = DialogPrimitive.Root;

const ModalTrigger = DialogPrimitive.Trigger;

const ModalPortal = DialogPrimitive.Portal;

const ModalClose = DialogPrimitive.Close;

// ==========================================================================
// Modal Overlay
// ==========================================================================

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-black/40 dark:bg-black/60",
      "data-[state=open]:animate-fade-in",
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ==========================================================================
// Modal Content
// ==========================================================================

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
        "w-full max-w-md",
        "bg-surface border border-border rounded-lg",
        "p-6",
        "focus:outline-none",
        "data-[state=open]:animate-fade-in",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-4 top-4",
          "rounded-sm opacity-70",
          "transition-opacity duration-150",
          "hover:opacity-100",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:pointer-events-none"
        )}
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ModalPortal>
));
ModalContent.displayName = DialogPrimitive.Content.displayName;

// ==========================================================================
// Modal Header
// ==========================================================================

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1.5 mb-4", className)}
    {...props}
  />
);
ModalHeader.displayName = "ModalHeader";

// ==========================================================================
// Modal Title
// ==========================================================================

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-text-primary", className)}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

// ==========================================================================
// Modal Description
// ==========================================================================

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

// ==========================================================================
// Modal Footer
// ==========================================================================

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex justify-end gap-3 mt-6", className)}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";

// ==========================================================================
// Confirmation Modal (pre-built)
// ==========================================================================

export interface ConfirmationModalProps {
  /**
   * Modal open state
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Modal title
   */
  title: string;
  /**
   * Modal description
   */
  description: string;
  /**
   * Confirm button text
   */
  confirmText?: string;
  /**
   * Cancel button text
   */
  cancelText?: string;
  /**
   * Callback when confirmed
   */
  onConfirm: () => void;
  /**
   * Is this a destructive action?
   */
  danger?: boolean;
  /**
   * Is the confirm action loading?
   */
  loading?: boolean;
}

/**
 * Pre-built Confirmation Modal
 *
 * @example
 * <ConfirmationModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Eliminar alumno"
 *   description="¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer."
 *   onConfirm={handleDelete}
 *   danger
 * />
 */
function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  danger = false,
  loading = false,
}: ConfirmationModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ==========================================================================
// Exports
// ==========================================================================

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalClose,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ConfirmationModal,
};
