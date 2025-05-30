"use client";

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import PatientForm from '@/components/PatientForm';
import { useToast } from "@/hooks/use-toast";

const NewPatientPage: FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Paciente</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <PatientForm
          onCancel={() => router.back()}
          onSubmitSuccess={async () => {
            try {
              toast({
                title: "Paciente Agregado",
                description: "Registro del paciente creado exitosamente.",
              });
              router.push('/');
            } catch (error) {
              toast({
                title: "Error",
                description: "Ocurrió un error al agregar el paciente.",
                variant: "destructive",
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default NewPatientPage; 