"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PatientSelector from '@/components/PatientSelector';
import PreHospitalRecordForm from '@/components/PreHospitalRecordForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, AlertCircle } from 'lucide-react';
import type { Patient } from '@/lib/schema';

export default function NewRecordPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { user, isAdmin } = useAuth();

  const handleCancel = () => {
    setSelectedPatient(null);
  };

  const handleSubmitSuccess = () => {
    console.log('Registro guardado exitosamente');
    setSelectedPatient(null);
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Crear Nuevo Registro</h1>
            <p className="text-muted-foreground">
              Seleccione un paciente y complete el registro pre-hospitalario
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selector - Left Side */}
          <div className="lg:col-span-1">
            <PatientSelector 
              onPatientSelect={setSelectedPatient}
              selectedPatient={selectedPatient}
            />
          </div>

          {/* Record Form - Right Side */}
          <div className="lg:col-span-2">
            {!selectedPatient ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formulario de Registro de Atención Prehospitalaria
                  </CardTitle>
                  <CardDescription>
                    Complete la información del registro médico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Debe seleccionar un paciente antes de completar el formulario.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <PreHospitalRecordForm
                patient={selectedPatient}
                onCancel={handleCancel}
                onSubmitSuccess={handleSubmitSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 