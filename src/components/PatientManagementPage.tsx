"use client";

import { useState, useEffect } from 'react';
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
import { deletePatient } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface PatientManagementPageProps {
  initialPatients: Patient[];
}

export default function PatientManagementPage({ initialPatients }: PatientManagementPageProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    setPatients(initialPatients);
  }, [initialPatients]);


  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditFormOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    const result = await deletePatient(patientId);
    if (result.success) {
      toast({
        title: "Patient Deleted",
        description: "Patient record deleted successfully.",
      });
      // Relies on revalidatePath from server action updating initialPatients prop from parent.
    } else {
      toast({
        title: "Error Deleting Patient",
        description: result.error || "Failed to delete patient record.",
        variant: "destructive",
      });
    }
  };

  const closeEditForm = () => {
    setIsEditFormOpen(false);
    setEditingPatient(undefined);
    // Relies on revalidatePath from server action.
  };

  return (
    <div className="space-y-6">
      {/* Add Patient button and overall title are now in DashboardPageContent.tsx */}
      
      <PatientTable
        patients={patients}
        onEdit={handleEditPatient}
        onDelete={async (patientId) => {
          const patientToDelete = patients.find(p => p.id === patientId);
          if (patientToDelete) {
            const confirmDeleteTrigger = document.getElementById(`delete-confirm-trigger-${patientId}`);
            if (confirmDeleteTrigger) {
              confirmDeleteTrigger.click();
            } else {
               if (window.confirm(`Are you sure you want to delete patient ${patientToDelete.firstName} ${patientToDelete.paternalLastName}?`)) {
                 handleDeletePatient(patientId);
               }
            }
          }
        }}
        onExport={async () => {}}
        // onViewDetails prop is no longer used for dialog, navigation is handled in PatientTable
      />

      {/* Edit Patient Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={(isOpen) => {
          if (!isOpen) closeEditForm(); // Ensure form closes correctly
          else setIsEditFormOpen(true);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Record</DialogTitle>
            <DialogDescription>
              Update the patient's details below.
            </DialogDescription>
          </DialogHeader>
          <PatientForm 
            initialData={editingPatient} 
            onClose={closeEditForm} 
            onSubmit={async (data) => {
              // Handle form submission - this will likely involve an updatePatient action
              closeEditForm();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialogs */}
      {patients.map(p => p.id && (
         <AlertDialog key={`alert-${p.id}`}>
            <AlertDialogTrigger id={`delete-confirm-trigger-${p.id}`} className="hidden">Delete</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <AlertTriangle className="inline-block mr-2 text-destructive" /> Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the patient record for {p.firstName} {p.paternalLastName}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeletePatient(p.id!)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Yes, delete patient
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      ))}
    </div>
  );
}
