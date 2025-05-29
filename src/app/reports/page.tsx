'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download } from 'lucide-react';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReportGenerate = async (type: string) => {
    setIsLoading(true);

    try {
      // Implementar la lógica de generación de reportes aquí
      toast({
        title: "Reporte generado",
        description: `El reporte de ${type} ha sido generado correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el reporte. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reports = [
    { 
      title: "Nuevo Reporte",
      description: "Crea un nuevo reporte",
      icon: FileText,
      type: "nuevo"
    },
    {
      title: "Reporte de Pacientes",
      description: "Lista completa de pacientes registrados",
      icon: FileText,
      type: "pacientes"
    },
    {
      title: "Reporte de Citas",
      description: "Historial de citas programadas",
      icon: FileText,
      type: "citas"
    },
    {
      title: "Reporte de Estadísticas",
      description: "Estadísticas generales del sistema",
      icon: FileText,
      type: "estadísticas"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">
          Genere y descargue reportes del sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <report.icon className="h-5 w-5" />
                {report.title}
              </CardTitle>
              <CardDescription>
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleReportGenerate(report.type)}
                disabled={isLoading}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {isLoading ? "Generando..." : "Generar reporte"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 