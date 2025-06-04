"use client";

import { FC, useState, useEffect } from 'react';
import { Search, User, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatients } from '@/hooks/usePatients';
import NetworkStatusBanner from './NetworkStatusBanner';
import type { Patient } from '@/lib/schema';

interface PatientSelectorProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

const PatientSelector: FC<PatientSelectorProps> = ({ selectedPatient, onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  
  const { 
    patients, 
    isLoading, 
    error, 
    isOnline, 
    wasOffline, 
    syncStatus,
    forceSync 
  } = usePatients();

  useEffect(() => {
    // Solo mostrar pacientes si hay un término de búsqueda de al menos 2 caracteres
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setFilteredPatients([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = patients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName}`.toLowerCase();
      const phoneMatch = patient.phone?.toLowerCase().includes(searchLower);
      return fullName.includes(searchLower) || phoneMatch;
    });
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handlePatientSelect = (patient: Patient) => {
    if (selectedPatient?.id === patient.id) {
      onPatientSelect(null); // Deseleccionar si ya está seleccionado
    } else {
      onPatientSelect(patient);
    }
  };

  return (
    <div className="space-y-4">
      {/* Network Status Banner */}
      <NetworkStatusBanner
        isOnline={isOnline}
        wasOffline={wasOffline}
        syncStatus={syncStatus}
        onForceSync={forceSync}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seleccionar Paciente
          </CardTitle>
          <CardDescription>
            Busque y seleccione el paciente para el registro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Paciente Seleccionado */}
          {selectedPatient && (
            <div className="p-3 bg-primary/10 rounded-lg border-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">
                    {selectedPatient.firstName} {selectedPatient.paternalLastName} {selectedPatient.maternalLastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.phone} • {selectedPatient.age} años
                  </p>
                </div>
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  Seleccionado
                </Badge>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-center py-4 text-destructive">
              {error}
            </div>
          )}

          {/* Lista de Pacientes */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Cargando pacientes...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchTerm && searchTerm.trim().length >= 2 
                  ? 'No se encontraron pacientes que coincidan con la búsqueda' 
                  : searchTerm && searchTerm.trim().length < 2
                  ? 'Escriba al menos 2 caracteres para buscar'
                  : 'Escriba el nombre o teléfono del paciente para empezar a buscar'
                }
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <Button
                  key={patient.id}
                  variant={selectedPatient?.id === patient.id ? "default" : "outline"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="text-left">
                    <p className="font-medium">
                      {patient.firstName} {patient.paternalLastName} {patient.maternalLastName}
                    </p>
                    <p className="text-sm opacity-70">
                      {patient.phone} • {patient.age} años • {patient.sex}
                    </p>
                  </div>
                  {selectedPatient?.id === patient.id && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSelector; 