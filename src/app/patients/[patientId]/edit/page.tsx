"use client";

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from 'lucide-react';
import PatientForm from '@/components/PatientForm';
import { useToast } from "@/hooks/use-toast";
import type { Patient } from '@/lib/schema';
import { patientService } from '@/lib/services/patientService'; // Using mock service for now

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
      setIsLoading(true);
      try {
        const data = await patientService.getPatientById(params.patientId); // Using mock service
        if (!data) {
          toast({
            title: "Error",
            description: "Paciente no encontrado.",
            variant: "destructive",
          });
          router.push('/'); // Redirect to home if patient not found
          return;
        }
        setPatient(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los datos del paciente.",
          variant: "destructive",
        });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.patientId) {
      loadPatient();
    } else {
      toast({ title: "Error", description: "ID de paciente no válido.", variant: "destructive" });
      router.push('/');
      setIsLoading(false);
    }
  }, [params.patientId, router, toast]);

  const handleFormSubmitSuccess = () => {
    toast({
      title: "Paciente Actualizado",
      description: "Registro del paciente actualizado exitosamente.",
    });
    router.push(`/patients/${params.patientId}`); // Navigate to details page after update
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Cargando datos del paciente...</p>
      </div>
    );
  }

  if (!patient) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback:
    return (
      <div className="container mx-auto py-10 text-center">
        <p>No se pudo cargar la información del paciente.</p>
        <Button onClick={() => router.push('/')} className="mt-4">
            Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()} // Or router.push(`/patients/${params.patientId}`)
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Editar Paciente</h1>
      </div>

      <div className="max-w-3xl mx-auto bg-card p-6 sm:p-8 rounded-lg shadow-md">
        <PatientForm
          initialData={patient}
          onSubmitSuccess={handleFormSubmitSuccess}
          onCancel={() => router.back()} // Or specific page like `/patients/${params.patientId}`
        />
      </div>
    </div>
  );
};

export default EditPatientPage;
