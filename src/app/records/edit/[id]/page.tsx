"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from 'lucide-react';

// Placeholder para el formulario de edición
// Aquí debería importarse el componente de formulario principal cuando esté disponible
export default function EditPreHospitalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    loadRecord();
  }, [params.id]);

  const loadRecord = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prehospital-records/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch record');
      }
      const data = await response.json();
      setRecord(data);
    } catch (error) {
      console.error('Error loading record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const response = await fetch('/api/prehospital-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      // Redirect back to detail view
      router.push(`/prehospital-records/${params.id}`);
    } catch (error) {
      console.error('Error saving record:', error);
      // Handle error (show notification, etc.)
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Cargando registro...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">Registro no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El registro solicitado no existe o no tiene permisos para editarlo.
          </p>
          <Button onClick={() => router.push('/prehospital-records')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/prehospital-records/${params.id}`)}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Editar Registro Prehospitalario</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Editando registro ID: {params.id}
          </p>
        </div>
      </div>

      {/* Formulario de edición - Placeholder - Responsive */}
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Edición</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              El formulario de edición completo está en desarrollo.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Por ahora, puedes crear un nuevo registro desde la página principal.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => router.push('/records/new')}
                className="w-full sm:w-auto"
              >
                Crear Nuevo Registro
              </Button>
              <Button 
                onClick={() => router.push(`/prehospital-records/${params.id}`)}
                className="w-full sm:w-auto"
              >
                Ver Registro Actual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 