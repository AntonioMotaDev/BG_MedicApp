'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAppointmentCreate = async () => {
    if (!date) return;
    setIsLoading(true);

    try {
      // Implementar la lógica de creación de cita aquí
      toast({
        title: "Cita creada",
        description: `Su cita ha sido programada para el ${format(date, 'dd/MM/yyyy', { locale: es })}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la cita. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Citas</h1>
        <p className="text-muted-foreground">
          Programe y gestione sus citas médicas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>
              Seleccione una fecha para programar una cita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={es}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la cita</CardTitle>
            <CardDescription>
              Complete la información de la cita
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {date && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Fecha seleccionada:</p>
                <p className="text-sm text-muted-foreground">
                  {format(date, 'EEEE, dd de MMMM de yyyy', { locale: es })}
                </p>
              </div>
            )}
            <Button
              onClick={handleAppointmentCreate}
              disabled={!date || isLoading}
              className="w-full"
            >
              {isLoading ? "Programando..." : "Programar cita"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 