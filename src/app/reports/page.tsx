'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FileText, Download, Plus, List, Calendar, BarChart } from 'lucide-react';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const handleReportGenerate = async (type: string) => {
    if (type === 'nuevo') {
      // Redirigir a la página de nuevo registro
      router.push('/records/new');
      return;
    }

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
      title: "Ver Registros",
      description: "Lista completa de registros",
      icon: FileText,
      type: "registros",
      buttonIcon: List,
      buttonText: "Ver Lista",
      onClick: () => router.push('/records'),
      requiresAdmin: false
    },
    { 
      title: "Nuevo Registro",
      description: "Crear Registro de Atención Prehospitalaria",
      icon: FileText, 
      type: "nuevo",
      buttonIcon: Plus,
      buttonText: "Crear Registro",
      requiresAdmin: true
    },
    // {
    //   title: "Reporte de Citas",
    //   description: "Historial de citas programadas",
    //   icon: FileText,
    //   type: "citas",
    //   buttonIcon: Calendar,
    //   buttonText: "Ver Citas",
    //   requiresAdmin: false
    // },
    // {
    //   title: "Estadísticas",
    //   description: "Estadísticas generales del sistema",
    //   icon: FileText,
    //   type: "estadísticas",
    //   buttonIcon: BarChart,
    //   buttonText: "Ver Estadísticas",
    //   requiresAdmin: true
    // }
  ];

  // Filtrar reportes según el rol del usuario
  const availableReports = reports.filter(report => {
    if (report.requiresAdmin) {
      return isAdmin;
    }
    return true;
  });

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Registros de Atención Prehospitalaria</h1>
            <p className="text-muted-foreground">
              Gestión de registros médicos - {user?.name}
            </p>
          </div>
        </div>

        {availableReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No tiene permisos para acceder a ningún reporte. 
                Contacte al administrador si necesita acceso.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableReports.map((report) => (
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
                    disabled={isLoading && report.type !== 'nuevo'}
                    className="w-full"
                    variant="default"
                  >
                    <report.buttonIcon className="mr-2 h-4 w-4" />
                    {isLoading && report.type !== 'nuevo' ? "Cargando..." : report.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}