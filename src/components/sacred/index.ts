/**
 * Sacred Components - Barrel Export
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * These are the ONLY components allowed in the application.
 * All UI must be built using these components.
 *
 * See DESIGN_CONTRACT.md for usage rules.
 * ==========================================================================
 */

// Button
export { Button, buttonVariants } from "./Button";
export type { ButtonProps } from "./Button";

// Card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./Card";
export type { CardProps } from "./Card";

// Badge
export { Badge, badgeVariants } from "./Badge";
export type { BadgeProps } from "./Badge";

// Table
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./Table";
export type { TableHeadProps, SortDirection } from "./Table";

// Input/Form
export {
  FormGroup,
  Label,
  HelpText,
  ErrorMessage,
  Input,
  Textarea,
  Select,
} from "./Input";
export type {
  FormGroupProps,
  LabelProps,
  InputProps,
  TextareaProps,
  SelectProps,
} from "./Input";

// Layout
export {
  Container,
  Section,
  SectionHeader,
  PageHeader,
  Divider,
} from "./Section";
export type {
  ContainerProps,
  SectionProps,
  SectionHeaderProps,
  PageHeaderProps,
} from "./Section";

// Navigation
export {
  Header,
  Sidebar,
  NavGroup,
  NavItem,
  Breadcrumb,
} from "./Navigation";
export type {
  HeaderProps,
  SidebarProps,
  NavGroupProps,
  NavItemProps,
  BreadcrumbItem,
  BreadcrumbProps,
} from "./Navigation";

// Modal
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
} from "./Modal";
export type { ConfirmationModalProps } from "./Modal";

// Empty State
export { EmptyState } from "./EmptyState";
export type { EmptyStateProps, EmptyStateIconType } from "./EmptyState";
