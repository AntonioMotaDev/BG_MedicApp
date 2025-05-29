"use client";

import { FC } from 'react';
import type { Patient } from "@/lib/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, FileText, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => Promise<void>;
  onExport: (patient: Patient) => Promise<void>;
  onViewDetails: (patient: Patient) => Promise<void>;
}

const PatientTable: FC<PatientTableProps> = ({
  patients,
  onEdit,
  onDelete,
  onExport,
  onViewDetails,
}) => {
  const router = useRouter();

  const handleViewDetails = (patient: Patient) => {
    if (patient.id) {
      router.push(`/patients/${patient.id}`);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Derechohabiencia</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient, index) => (
            <TableRow key={patient.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {patient.firstName} {patient.paternalLastName} {patient.maternalLastName}
              </TableCell>
              <TableCell>{patient.age} años</TableCell>
              <TableCell>
                {patient.street} {patient.exteriorNumber}
                {patient.interiorNumber ? ` Int. ${patient.interiorNumber}` : ''}
                {', '}{patient.neighborhood}, {patient.city}
              </TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.insurance || '-'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(patient)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport(patient)}>
                      <FileText className="mr-2 h-4 w-4" /> Exportar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(patient)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(patient.id!)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientTable;
