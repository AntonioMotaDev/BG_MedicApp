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
import { MoreHorizontal, Edit, Trash2, Eye, DownloadIcon } from 'lucide-react'; // Changed FileText to DownloadIcon
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDeleteRequest: (patient: Patient) => void; // Renamed from onDelete to onDeleteRequest
  onExport: (patient: Patient) => Promise<void>;
  onViewDetails: (patient: Patient) => void; // Kept as is, navigation handled in parent
}

const PatientTable: FC<PatientTableProps> = ({
  patients,
  onEdit,
  onDeleteRequest,
  onExport,
  onViewDetails,
}) => {

  const getDisplayAge = (patient: Patient): string => {
    if (patient.age !== undefined && patient.age !== null) return `${patient.age} años`;
    
    return 'N/A';
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Nombre Completo</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead className="hidden md:table-cell">Teléfono</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {patient.firstName} {patient.paternalLastName} {patient.maternalLastName || ''}
              </TableCell>
              <TableCell>{getDisplayAge(patient)}</TableCell>
              <TableCell className="hidden md:table-cell">{patient.phone}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(patient)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(patient)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport(patient)}>
                      <DownloadIcon className="mr-2 h-4 w-4" /> Exportar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteRequest(patient)} // Use onDeleteRequest
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
