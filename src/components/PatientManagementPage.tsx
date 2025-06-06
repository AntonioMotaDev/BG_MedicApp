"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient } from "@/lib/schema";
import PatientTable from "@/components/PatientTable";
import PatientForm from "@/components/PatientForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePatients } from "@/hooks/usePatients";
import NetworkStatusBanner from "./NetworkStatusBanner";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function PatientManagementPage() {
  const router = useRouter();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const { toast } = useToast();

  const {
    patients,
    isLoading,
    error,
    isOnline,
    wasOffline,
    syncStatus,
    updatePatient,
    deletePatient: deletePatientOffline,
    forceSync,
  } = usePatients();

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditFormOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    const result = await deletePatientOffline(patientId);
    if (result.success) {
      toast({
        title: "Paciente Eliminado",
        description: isOnline 
          ? "El registro del paciente ha sido eliminado exitosamente."
          : "El registro del paciente ha sido eliminado localmente y se sincronizará cuando haya conexión.",
      });
    } else {
      toast({
        title: "Error al Eliminar",
        description: result.error || "No se pudo eliminar el registro del paciente.",
        variant: "destructive",
      });
    }
  };

  const handleCreateRecord = (patient: Patient) => {
    if (!patient.id) return;
    router.push(`/records/new?patientId=${patient.id}`);
  };

  const closeEditForm = () => {
    setIsEditFormOpen(false);
    setEditingPatient(undefined);
  };

  const handleFormSubmitSuccess = async () => {
    closeEditForm();
    toast({
      title: "Paciente Actualizado",
      description: isOnline 
        ? "Los datos del paciente han sido actualizados exitosamente."
        : "Los cambios han sido guardados localmente y se sincronizarán cuando haya conexión.",
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <NetworkStatusBanner
          isOnline={isOnline}
          wasOffline={wasOffline}
          syncStatus={syncStatus}
          onForceSync={forceSync}
        />
        <div className="text-center py-8">
          <p className="text-destructive">Error al cargar pacientes: {error}</p>
          <Button onClick={forceSync} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Status Banner */}
      <NetworkStatusBanner
        isOnline={isOnline}
        wasOffline={wasOffline}
        syncStatus={syncStatus}
        onForceSync={forceSync}
      />
      
      <PatientTable
        patients={patients}
        isLoading={isLoading}
        onEdit={handleEditPatient}
        onCreateRecord={handleCreateRecord}
        onDeleteRequest={async (patient: Patient) => {
          if (!patient.id) return;
          const confirmDeleteTrigger = document.getElementById(`delete-confirm-trigger-${patient.id}`);
          if (confirmDeleteTrigger) {
            confirmDeleteTrigger.click();
          } else {
            if (window.confirm(`¿Está seguro de que desea eliminar al paciente ${patient.firstName} ${patient.paternalLastName}?`)) {
              handleDeletePatient(patient.id);
            }
          }
        }}
        onExport={async (patient: Patient) => {
          // TODO: Implement export functionality
          console.log('Export patient:', patient);
        }}
        onViewDetails={(patient: Patient) => {
          if (!patient.id) return;
          router.push(`/patients/${patient.id}`);
        }}
      />

      {/* Edit Patient Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={(isOpen) => {
          if (!isOpen) closeEditForm(); // Ensure form closes correctly
          else setIsEditFormOpen(true);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro de Paciente</DialogTitle>
            <DialogDescription>
              Actualice los datos del paciente a continuación.
            </DialogDescription>
          </DialogHeader>
          <PatientForm 
            initialData={editingPatient} 
            onCancel={closeEditForm} 
            onSubmitSuccess={handleFormSubmitSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialogs */}
      {patients.map(p => p.id && (
         <AlertDialog key={`alert-${p.id}`}>
            <AlertDialogTrigger id={`delete-confirm-trigger-${p.id}`} className="hidden">Eliminar</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <AlertTriangle className="inline-block mr-2 text-destructive" /> ¿Está absolutamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente el registro del paciente {p.firstName} {p.paternalLastName}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeletePatient(p.id!)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Sí, eliminar paciente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      ))}
    </div>
  );
}
