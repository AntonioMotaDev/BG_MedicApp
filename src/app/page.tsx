"use client";

import { FC, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from '@/lib/schema';
import { usePatients } from '@/hooks/usePatients';
import { useAuth } from '@/hooks/useAuth';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import PatientManagementPage from '@/components/PatientManagementPage';
import PatientForm from '@/components/PatientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Home: FC = () => {
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const { toast } = useToast();
  const { createPatient, isOnline } = usePatients();
  const { user, isAdmin } = useAuth();

  const handleAddPatient = () => {
    setIsAddPatientDialogOpen(true);
  };

  const handleFormSubmitSuccess = async () => {
    setIsAddPatientDialogOpen(false);
    toast({
      title: "Paciente Agregado",
      description: isOnline 
        ? "El nuevo paciente ha sido registrado exitosamente."
        : "El paciente ha sido registrado localmente y se sincronizará cuando haya conexión.",
    });
  };

  return (
    <ProtectedRoute requireAuth={true}>
    <main className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
        <h1 className="text-2xl font-bold">Gestión de Pacientes</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user?.name}
            </p>
          </div>
        <Button onClick={handleAddPatient} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Paciente
        </Button>
      </div>

        {/* Patient Management with offline capabilities */}
        <PatientManagementPage />

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientDialogOpen} onOpenChange={setIsAddPatientDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
              <DialogDescription>
                Complete los datos del paciente a continuación.
              </DialogDescription>
          </DialogHeader>
          <PatientForm
            onCancel={() => setIsAddPatientDialogOpen(false)}
              onSubmitSuccess={handleFormSubmitSuccess}
            />
        </DialogContent>
      </Dialog>
    </main>
    </ProtectedRoute>
  );
};

export default Home;
