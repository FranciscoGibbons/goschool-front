"use client";

import { AcademicYear } from "@/types/academicYear";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

interface AcademicYearSelectorProps {
  academicYears: AcademicYear[];
  selectedYearId: number | null;
  onYearChange: (yearId: number | null) => void;
  showAllOption?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AcademicYearSelector({
  academicYears,
  selectedYearId,
  onYearChange,
  showAllOption = false,
  disabled = false,
  className = "",
}: AcademicYearSelectorProps) {
  const handleValueChange = (value: string) => {
    if (value === "all") {
      onYearChange(null);
    } else {
      onYearChange(parseInt(value, 10));
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedYearId?.toString() ?? (showAllOption ? "all" : "")}
        onValueChange={handleValueChange}
        disabled={disabled || academicYears.length === 0}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar ciclo" />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">Todos los ciclos</SelectItem>
          )}
          {academicYears.map((year) => (
            <SelectItem key={year.id} value={year.id.toString()}>
              {year.name}
              {year.is_active && (
                <span className="ml-2 text-xs text-primary">(Activo)</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
