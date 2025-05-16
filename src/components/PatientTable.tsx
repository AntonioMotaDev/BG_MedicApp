
"use client";

import type { FC } from 'react';
import { useState, useMemo } from 'react';
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
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, ArrowUpDown, FileText, Files } from 'lucide-react'; // Replaced FileCsv with Files
import { format } from 'date-fns';

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
}

type SortKey = keyof Patient | null;

const PatientTable: FC<PatientTableProps> = ({ patients, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("pickupTimestamp");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter(
      (patient) =>
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.id && patient.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA instanceof Date && valB instanceof Date) {
          return sortOrder === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return filtered;
  }, [patients, searchTerm, sortKey, sortOrder]);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey === key) {
      return sortOrder === 'asc' ? <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 inline-block" /> : <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 inline-block transform rotate-180" />;
    }
    return <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 inline-block opacity-50" />;
  };

  // Placeholder export functions
  const handleExportPDF = () => alert("PDF export functionality not yet implemented.");
  const handleExportCSV = () => alert("CSV export functionality not yet implemented.");


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <Input
          placeholder="Search by name or Patient ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs md:max-w-sm"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExportPDF} className="flex-1 sm:flex-none"><FileText className="mr-1.5 sm:mr-2 h-4 w-4" /> Export PDF</Button>
          <Button variant="outline" onClick={handleExportCSV} className="flex-1 sm:flex-none"><Files className="mr-1.5 sm:mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>
      <div className="rounded-md border shadow-sm bg-card">
        <div className="relative w-full overflow-auto"> {/* Ensure overflow-auto is on the direct parent of table for scrolling */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer px-2 py-3 sm:px-4 sm:py-3" onClick={() => handleSort('id')}>
                  <div className="flex items-center">ID {renderSortIcon('id')}</div>
                </TableHead>
                <TableHead className="cursor-pointer px-2 py-3 sm:px-4 sm:py-3" onClick={() => handleSort('fullName')}>
                  <div className="flex items-center">Full Name {renderSortIcon('fullName')}</div>
                </TableHead>
                <TableHead className="px-2 py-3 sm:px-4 sm:py-3">DOB</TableHead>
                <TableHead className="px-2 py-3 sm:px-4 sm:py-3">Gender</TableHead>
                <TableHead className="cursor-pointer px-2 py-3 sm:px-4 sm:py-3" onClick={() => handleSort('pickupTimestamp')}>
                   <div className="flex items-center">Pickup {renderSortIcon('pickupTimestamp')}</div>
                </TableHead>
                <TableHead className="px-2 py-3 sm:px-4 sm:py-3 hidden md:table-cell">Weight (kg)</TableHead>
                <TableHead className="px-2 py-3 sm:px-4 sm:py-3 hidden md:table-cell">Height (cm)</TableHead>
                <TableHead className="px-2 py-3 sm:px-4 sm:py-3 hidden lg:table-cell">Emergency Contact</TableHead>
                <TableHead className="text-right px-2 py-3 sm:px-4 sm:py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPatients.length > 0 ? (
                filteredAndSortedPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium px-2 py-3 sm:px-4 sm:py-4 truncate max-w-[80px] sm:max-w-[120px]">{patient.id}</TableCell>
                    <TableCell className="px-2 py-3 sm:px-4 sm:py-4">{patient.fullName}</TableCell>
                    <TableCell className="px-2 py-3 sm:px-4 sm:py-4">{patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                    <TableCell className="px-2 py-3 sm:px-4 sm:py-4">{patient.gender}</TableCell>
                    <TableCell className="px-2 py-3 sm:px-4 sm:py-4">{patient.pickupTimestamp ? format(new Date(patient.pickupTimestamp), 'yy-MM-dd HH:mm') : 'N/A'}</TableCell>
                    <TableCell className="px-2 py-3 sm:px-4 sm:py-4 hidden md:table-cell">{patient.weightKg}</TableCell>
                    <TableCell className="px-2 py-3 sm:px-4 sm:py-4 hidden md:table-cell">{patient.heightCm}</TableCell>
                    <TableCell className="px-2 py-3 sm:px-4 sm:py-4 hidden lg:table-cell">{patient.emergencyContact}</TableCell>
                    <TableCell className="text-right px-2 py-3 sm:px-4 sm:py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(patient)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => patient.id && onDelete(patient.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center px-2 py-3 sm:px-4 sm:py-4">
                    No patient records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PatientTable;
