"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/sacred";

interface Student {
  id: number;
  full_name: string;
}

interface InlineStudentSelectorProps {
  students: Student[];
  selectedStudentId: number | null;
  onStudentChange: (studentId: number) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function InlineStudentSelector({
  students,
  selectedStudentId,
  onStudentChange,
  disabled = false,
  className = "",
  placeholder = "Seleccionar estudiante",
}: InlineStudentSelectorProps) {
  const sortedStudents = [...students].sort((a, b) =>
    a.full_name.localeCompare(b.full_name)
  );

  return (
    <Select
      value={selectedStudentId?.toString() ?? ""}
      onValueChange={(value) => onStudentChange(Number(value))}
      disabled={disabled || students.length === 0}
    >
      <SelectTrigger className={`w-[220px] ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {sortedStudents.map((student) => (
          <SelectItem key={student.id} value={student.id.toString()}>
            {student.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
