
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
import { deletePatient, getPatients } from "@/app/actions"; // getPatients might be used for re-fetching
import { useToast } from "@/hooks/use-toast";
import { UserPlus, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface PatientManagementPageProps {
  initialPatients: Patient[];
}

export default function PatientManagementPage({ initialPatients }: PatientManagementPageProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const { toast } = useToast();

  // Effect to update patients if initialPatients prop changes (e.g., after server-side revalidation)
  useEffect(() => {
    setPatients(initialPatients);
  }, [initialPatients]);


  const handleAddPatient = () => {
    setEditingPatient(undefined);
    setIsFormOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    const result = await deletePatient(patientId);
    if (result.success) {
      toast({
        title: "Patient Deleted",
        description: "Patient record deleted successfully.",
      });
      // Optionally re-fetch patients or filter client-side:
      // For now, rely on revalidatePath from server action and updated initialPatients prop.
      // const updatedPatients = await getPatients(); // This would re-fetch
      // setPatients(updatedPatients);
    } else {
      toast({
        title: "Error Deleting Patient",
        description: result.error || "Failed to delete patient record.",
        variant: "destructive",
      });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPatient(undefined);
    // After closing form, data might have changed, rely on revalidation or fetch again if needed
    // async function fetchLatestPatients() {
    //   const latestPatients = await getPatients();
    //   setPatients(latestPatients);
    // }
    // fetchLatestPatients();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Patient Records</h2>
        <Button onClick={handleAddPatient} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <UserPlus className="mr-2 h-5 w-5" /> Add New Patient
        </Button>
      </div>
      
      <PatientTable
        patients={patients}
        onEdit={handleEditPatient}
        onDelete={(patientId) => {
          // Trigger AlertDialog for delete confirmation
          const patientToDelete = patients.find(p => p.id === patientId);
          if (patientToDelete) {
             // This logic needs to be connected to an AlertDialog trigger within the table row action for better UX.
             // For now, we'll use a generic confirmation.
             // A more robust solution would embed AlertDialogTrigger in PatientTable's action menu.
            const confirmDeleteTrigger = document.getElementById(`delete-confirm-trigger-${patientId}`);
            if (confirmDeleteTrigger) {
              confirmDeleteTrigger.click();
            } else {
              // Fallback if trigger not found (should not happen with proper setup)
               if (window.confirm(`Are you sure you want to delete patient ${patientToDelete.fullName}?`)) {
                 handleDeletePatient(patientId);
               }
            }
          }
        }}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient Record" : "Add New Patient Record"}</DialogTitle>
            <DialogDescription>
              {editingPatient ? "Update the patient's details below." : "Fill in the form to add a new patient record."}
            </DialogDescription>
          </DialogHeader>
          <PatientForm patient={editingPatient} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      {/* Example of how AlertDialog could be structured if triggered from table.
          This is a conceptual placeholder. For a real app, each row's delete
          button would be an AlertDialogTrigger specific to that patient.
      */}
      {patients.map(p => p.id && (
         <AlertDialog key={`alert-${p.id}`}>
            {/* This trigger would be visually hidden and programmatically clicked from PatientTable, or PatientTable would render its own AlertDialogs */}
            <AlertDialogTrigger id={`delete-confirm-trigger-${p.id}`} className="hidden">Delete</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <AlertTriangle className="inline-block mr-2 text-destructive" /> Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the patient record for {p.fullName}.
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
