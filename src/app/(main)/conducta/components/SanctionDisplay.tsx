import { DisciplinarySanction, SANCTION_LABELS, SanctionType } from "@/types/disciplinarySanction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface SanctionDisplayProps {
  sanctions: DisciplinarySanction[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit?: (sanction: DisciplinarySanction) => void;
  onDelete?: (sanction: DisciplinarySanction) => void;
  studentName?: string;
}

export function SanctionDisplay({ 
  sanctions, 
  canEdit, 
  canDelete, 
  onEdit, 
  onDelete,
  studentName 
}: SanctionDisplayProps) {
  if (sanctions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay sanciones registradas</h3>
          <p className="text-muted-foreground max-w-sm">
            {studentName 
              ? `${studentName} no tiene sanciones disciplinarias registradas.`
              : "No se encontraron sanciones disciplinarias para el criterio seleccionado."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSanctionBadgeVariant = (sanctionType: string) => {
    switch (sanctionType) {
      case 'admonition':
        return 'destructive'; // Amonestación - más severa
      case 'warning':
        return 'secondary'; // Apercibimiento - intermedia
      case 'free':
        return 'outline'; // Libre - menos severa (tal vez una liberación de sanción?)
      default:
        return 'default';
    }
  };

  const getSanctionSeverity = (sanctionType: string) => {
    const severityOrder = ['free', 'warning', 'admonition'];
    return severityOrder.indexOf(sanctionType) + 1;
  };

  const sortedSanctions = [...sanctions].sort((a, b) => {
    // Primero por fecha (más reciente primero)
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateB !== dateA) return dateB - dateA;
    
    // Luego por severidad (más grave primero)
    return getSanctionSeverity(b.sanction_type) - getSanctionSeverity(a.sanction_type);
  });

  return (
    <div className="space-y-4">
      {sortedSanctions.map((sanction) => (
        <Card key={sanction.disciplinary_sanction_id} className="transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant={getSanctionBadgeVariant(sanction.sanction_type)}>
                    {SANCTION_LABELS[sanction.sanction_type as SanctionType] || sanction.sanction_type}
                  </Badge>
                  {sanction.quantity > 1 && (
                    <span className="text-sm text-muted-foreground">
                      (x{sanction.quantity})
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(sanction.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
              {(canEdit || canDelete) && (
                <div className="flex gap-2">
                  {canEdit && onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(sanction)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(sanction)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          {sanction.description && (
            <CardContent className="pt-0">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground font-medium mb-1">Descripción:</p>
                <p className="text-sm">{sanction.description}</p>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}