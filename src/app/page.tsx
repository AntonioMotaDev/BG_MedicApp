"use client";

import { FC, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from '@/lib/schema';
import { patientService } from '@/lib/services/patientService'; // Using mock service

// Components
import PatientTable from '@/components/PatientTable';
// PatientDetails component is for inline display, navigation is to /patients/[id]
import ConfirmDialog from '@/components/ConfirmDialog';
import SearchBar from '@/components/SearchBar';
import PatientForm from '@/components/PatientForm'; // For Add/Edit Modals
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


const Home: FC = () => {
  const router = useRouter();
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await patientService.getAllPatients(); // Using mock service
      setPatients(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pacientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    const searchPatients = async () => {
      if (!searchTerm.trim()) {
        await loadPatients();
        return;
      }
      setIsLoading(true);
      try {
        const results = await patientService.searchPatients(searchTerm); // Using mock service
        setPatients(results);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al buscar pacientes.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchPatients();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, loadPatients, toast]);

  const handleAddPatient = () => {
    setSelectedPatient(null); // Ensure no lingering data
    setIsAddPatientDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditPatientDialogOpen(true);
  };

  const handleViewDetails = (patient: Patient) => {
    if (patient.id) {
      router.push(`/patients/${patient.id}`);
    } else {
      toast({title: "Error", description: "ID de paciente no válido.", variant: "destructive" });
    }
  };
  
  const openDeleteConfirmDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedPatient?.id) return;
    try {
      const success = await patientService.deletePatient(selectedPatient.id); // Using mock service
      if (success) {
        toast({
          title: "Paciente Eliminado",
          description: "El registro del paciente ha sido eliminado exitosamente.",
        });
        await loadPatients(); // Refresh list
      } else {
        throw new Error("No se pudo eliminar el paciente desde el servicio");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el paciente. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const handleExportPatient = async (patient: Patient) => {
    try {
      const fullName = `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName || ''}`.trim();
      const patientDataToExport = {
        id: patient.id,
        fullName: fullName,
        dateOfBirth: patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "yyyy-MM-dd") : undefined,
        sex: patient.sex,
        phone: patient.phone,
        emergencyContact: patient.emergencyContact,
        weightKg: patient.weightKg,
        heightCm: patient.heightCm,
        medicalNotes: patient.medicalNotes,
        // street: patient.street, // Example: if you want to add more fields
        // exteriorNumber: patient.exteriorNumber,
        // neighborhood: patient.neighborhood,
        // city: patient.city,
        // insurance: patient.insurance,
      };
      
      const blob = new Blob([JSON.stringify(patientDataToExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-${patient.id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Exportación Exitosa",
        description: "Los datos del paciente han sido exportados correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error en la Exportación",
        description: "Ocurrió un error al exportar los datos del paciente.",
        variant: "destructive",
      });
    }
  };
  
  const handleFormSubmitSuccess = () => {
    setIsAddPatientDialogOpen(false);
    setIsEditPatientDialogOpen(false);
    loadPatients(); // Refresh the list
  };


  return (
    <main className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Gestión de Pacientes</h1>
        <Button onClick={handleAddPatient} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Paciente
        </Button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por nombre, teléfono, sexo..."
      />

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Cargando pacientes...</p>
        </div>
      )}

      {!isLoading && patients.length === 0 && !searchTerm && (
         <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No hay pacientes registrados.</p>
          <Button onClick={handleAddPatient}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Nuevo Paciente
          </Button>
        </div>
      )}

      {!isLoading && patients.length === 0 && searchTerm && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron pacientes con el término "{searchTerm}".</p>
        </div>
      )}


      {!isLoading && patients.length > 0 && (
        <PatientTable
          patients={patients}
          onEdit={handleEditPatient}
          onDeleteRequest={openDeleteConfirmDialog} // Changed prop name
          onViewDetails={handleViewDetails}
          onExport={handleExportPatient}
        />
      )}

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientDialogOpen} onOpenChange={setIsAddPatientDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
            <DialogDescription>Complete el formulario para agregar un nuevo paciente.</DialogDescription>
          </DialogHeader>
          <PatientForm
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={() => setIsAddPatientDialogOpen(false)}
            initialData={null}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditPatientDialogOpen} onOpenChange={setIsEditPatientDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>Actualice los datos del paciente.</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <PatientForm
              onSubmitSuccess={handleFormSubmitSuccess}
              onCancel={() => setIsEditPatientDialogOpen(false)}
              initialData={selectedPatient}
            />
          )}
        </DialogContent>
      </Dialog>


      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Eliminar Paciente"
        description={`¿Estás seguro de que deseas eliminar a ${selectedPatient?.firstName} ${selectedPatient?.paternalLastName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </main>
  );
};

export default Home;
