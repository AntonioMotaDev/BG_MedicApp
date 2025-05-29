"use client";

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from '@/lib/schema';
import { patientService } from '@/lib/services/patientService';

// Components
import PatientTable from '@/components/PatientTable';
import PatientDetails from '@/components/PatientDetails';
import ConfirmDialog from '@/components/ConfirmDialog';
import SearchBar from '@/components/SearchBar';

const Home: FC = () => {
  const router = useRouter();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Cargar pacientes
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await patientService.getAllPatients();
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
  };

  // Buscar pacientes
  useEffect(() => {
    const searchPatients = async () => {
      if (!searchTerm.trim()) {
        await loadPatients();
        return;
      }

      try {
        const results = await patientService.searchPatients(searchTerm);
        setPatients(results);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al buscar pacientes.",
          variant: "destructive",
        });
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleAddPatient = () => {
    router.push('/patients/new');
  };

  const handleEditPatient = (patient: Patient) => {
    router.push(`/patients/${patient.id}/edit`);
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      const success = await patientService.deletePatient(patientId);
      if (success) {
        toast({
          title: "Paciente Eliminado",
          description: "El registro del paciente ha sido eliminado exitosamente.",
        });
        await loadPatients();
      } else {
        throw new Error("No se pudo eliminar el paciente");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el paciente. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleExportPatient = async (patient: Patient) => {
    try {
      // Aquí implementamos la lógica de exportación
      const patientData = {
        id: patient.id,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        emergencyContact: patient.emergencyContact,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        weightKg: patient.weightKg,
        heightCm: patient.heightCm,
        bloodType: patient.bloodType,
        allergies: patient.allergies,
        medicalNotes: patient.medicalNotes
      };
      
      // Convertir a JSON y descargar
      const blob = new Blob([JSON.stringify(patientData, null, 2)], { type: 'application/json' });
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

  return (
    <main className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pacientes</h1>
        <Button onClick={handleAddPatient}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Paciente
        </Button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por nombre, género o contacto..."
      />

      <PatientTable
        patients={patients}
        onEdit={handleEditPatient}
        onDelete={async (patientId: string) => {
          setSelectedPatient(patients.find(p => p.id === patientId) || null);
          setIsDeleteDialogOpen(true);
        }}
        onViewDetails={handleViewDetails}
        onExport={handleExportPatient}
        isLoading={isLoading}
      />

      {isDetailsOpen && selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          onClose={() => setIsDetailsOpen(false)}
          onEdit={() => {
            setIsDetailsOpen(false);
            handleEditPatient(selectedPatient);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (selectedPatient?.id) {
            handleDeletePatient(selectedPatient.id);
          }
          setIsDeleteDialogOpen(false);
        }}
        title="Eliminar Paciente"
        description="¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </main>
  );
};

export default Home;
