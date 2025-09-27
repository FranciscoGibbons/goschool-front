import { useState, useEffect } from "react";
import { NewDisciplinarySanction, UpdateDisciplinarySanction, SANCTION_TYPES, SANCTION_LABELS, SanctionType } from "@/types/disciplinarySanction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface SanctionFormProps {
  studentId?: number;
  studentName?: string;
  initialData?: {
    disciplinary_sanction_id: number;
    student_id: number;
    sanction_type: string;
    quantity: number;
    description: string;
    date: string;
  };
  onSubmit: (data: NewDisciplinarySanction | { disciplinary_sanction_id: number; updateData: UpdateDisciplinarySanction }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function SanctionForm({ 
  studentId, 
  studentName, 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: SanctionFormProps) {
  const [formData, setFormData] = useState({
    sanction_type: initialData?.sanction_type || '',
    quantity: initialData?.quantity || 1,
    description: initialData?.description || '',
    date: initialData?.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        sanction_type: initialData.sanction_type,
        quantity: initialData.quantity,
        description: initialData.description,
        date: format(new Date(initialData.date), 'yyyy-MM-dd')
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sanction_type) {
      newErrors.sanction_type = 'El tipo de sanción es requerido';
    }

    if (formData.quantity < 1 || formData.quantity > 99) {
      newErrors.quantity = 'La cantidad debe estar entre 1 y 99';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.date);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      
      if (selectedDate > maxDate) {
        newErrors.date = 'La fecha no puede ser más de un año en el futuro';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (initialData) {
        // Modo edición
        await onSubmit({
          disciplinary_sanction_id: initialData.disciplinary_sanction_id,
          updateData: {
            sanction_type: formData.sanction_type,
            quantity: formData.quantity,
            description: formData.description.trim(),
            date: formData.date
          }
        });
      } else {
        // Modo creación
        if (!studentId) {
          setErrors({ general: 'No se ha seleccionado un estudiante' });
          return;
        }
        
        await onSubmit({
          student_id: studentId,
          sanction_type: formData.sanction_type,
          quantity: formData.quantity,
          description: formData.description.trim(),
          date: formData.date
        });
      }
    } catch {
      setErrors({ general: 'Error al procesar la sanción' });
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>
          {initialData ? 'Editar Sanción Disciplinaria' : 'Nueva Sanción Disciplinaria'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {studentName && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Estudiante: {studentName}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sanction_type">Tipo de Sanción *</Label>
            <Select
              value={formData.sanction_type}
              onValueChange={(value) => handleFieldChange('sanction_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de sanción" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SANCTION_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {SANCTION_LABELS[value as SanctionType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sanction_type && (
              <p className="text-destructive text-sm">{errors.sanction_type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="99"
              value={formData.quantity}
              onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 1)}
              placeholder="1"
            />
            {errors.quantity && (
              <p className="text-destructive text-sm">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
            />
            {errors.date && (
              <p className="text-destructive text-sm">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe la situación que motivó la sanción disciplinaria..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.description ? (
                <span className="text-destructive">{errors.description}</span>
              ) : (
                <span>Mínimo 10 caracteres</span>
              )}
              <span>{formData.description.length}/500</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Procesando...' : (initialData ? 'Actualizar Sanción' : 'Crear Sanción')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}