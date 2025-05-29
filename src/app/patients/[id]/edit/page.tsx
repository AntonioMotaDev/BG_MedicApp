"use client";

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import PatientForm from '@/components/PatientForm';
import { useToast } from "@/hooks/use-toast";
import type { Patient } from '@/lib/schema';
import { patientService } from '@/lib/services/patientService';

interface EditPatientPageProps {
  params: {
    patientId: string;
  };
}

const EditPatientPage: FC<EditPatientPageProps> = ({ params }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await patientService.getPatientById(params.patientId);
        if (!data) {
          toast({
            title: "Error",
            description: "Paciente no encontrado.",
            variant: "destructive",
          });
          router.push('/patients');
          return;
        }
        setPatient(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los datos del paciente.",
          variant: "destructive",
        });
        router.push('/patients');
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [params.patientId, router, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Editar Paciente</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <PatientForm
          initialData={patient}
          onClose={() => router.back()}
          onSubmit={async (data: Partial<Patient>) => {
            try {
              await patientService.updatePatient(params.patientId, data);
              toast({
                title: "Paciente Actualizado",
                description: "Registro del paciente actualizado exitosamente.",
              });
              router.push(`/patients/${params.patientId}`);
            } catch (error) {
              toast({
                title: "Error",
                description: "Ocurrió un error al actualizar el paciente.",
                variant: "destructive",
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default EditPatientPage; 