"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PatientSelector from '@/components/PatientSelector';
import PreHospitalRecordForm from '@/components/PreHospitalRecordForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { usePatients } from '@/hooks/usePatients';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, AlertCircle, Loader2 } from 'lucide-react';
import type { Patient } from '@/lib/schema';

export default function NewRecordPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoadingPreselected, setIsLoadingPreselected] = useState(false);
  const { user, isAdmin } = useAuth();
  const { getPatientById } = usePatients();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  // Load preselected patient if patientId is provided in URL
  useEffect(() => {
    const loadPreselectedPatient = async () => {
      if (preselectedPatientId && !selectedPatient) {
        setIsLoadingPreselected(true);
        try {
          const patient = await getPatientById(preselectedPatientId);
          if (patient) {
            setSelectedPatient(patient);
          }
        } catch (error) {
          console.error('Error loading preselected patient:', error);
        } finally {
          setIsLoadingPreselected(false);
        }
      }
    };

    loadPreselectedPatient();
  }, [preselectedPatientId, selectedPatient, getPatientById]);

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
              {preselectedPatientId 
                ? "Complete el registro pre-hospitalario para el paciente seleccionado"
                : "Seleccione un paciente y complete el registro pre-hospitalario"
              }
            </p>
          </div>
        </div>

        {isLoadingPreselected ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Cargando información del paciente...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Selector - Left Side */}
            <div className="lg:col-span-1">
              <PatientSelector 
                onPatientSelect={setSelectedPatient}
                selectedPatient={selectedPatient}
              />
              {preselectedPatientId && selectedPatient && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Paciente preseleccionado desde la tabla de pacientes.
                  </AlertDescription>
                </Alert>
              )}
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
        )}
      </div>
    </ProtectedRoute>
  );
} 