"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Calendar, 
  Filter, 
  Eye, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  User,
  Clock,
  MoreHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PreHospitalRecord {
  id: string;
  patientId: string;
  patientName: string;
  fecha: string;
  createdAt: string;
  status: 'draft' | 'partial' | 'completed';
  completedSections: string[];
  totalSections: number;
  prioridad?: string;
  lugarOcurrencia?: string;
  medicoReceptorNombre?: string;
}

const RECORDS_PER_PAGE = 20;

export default function PreHospitalRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PreHospitalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PreHospitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, dateFilter, statusFilter, priorityFilter, records]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prehospital-records');
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }
      const data = await response.json();
      
      // Convert createdAt strings to proper format and ensure required fields
      const processedRecords = data.map((record: any) => ({
        ...record,
        createdAt: record.createdAt || new Date().toISOString(),
        fecha: record.fecha || new Date().toISOString().split('T')[0],
        completedSections: record.completedSections || [],
        totalSections: record.totalSections || 11
      }));
      
      setRecords(processedRecords);
    } catch (error) {
      console.error('Error loading records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Filtro por nombre del paciente
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por fecha
    if (dateFilter) {
      filtered = filtered.filter(record =>
        record.fecha === dateFilter
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filtro por prioridad
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(record => record.prioridad === priorityFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset a la primera página cuando se aplican filtros
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Completado', variant: 'default' as const, color: 'text-green-700 bg-green-50' },
      partial: { label: 'Parcial', variant: 'secondary' as const, color: 'text-yellow-700 bg-yellow-50' },
      draft: { label: 'Borrador', variant: 'outline' as const, color: 'text-gray-700 bg-gray-50' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const priorityConfig = {
      rojo: { label: 'Rojo', color: 'bg-red-500' },
      amarillo: { label: 'Amarillo', color: 'bg-yellow-500' },
      verde: { label: 'Verde', color: 'bg-green-500' },
      negro: { label: 'Negro', color: 'bg-gray-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        <span className="text-sm">{config.label}</span>
      </div>
    );
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  // Paginación
  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const viewRecord = (recordId: string) => {
    router.push(`/prehospital-records/${recordId}`);
  };

  const downloadRecord = (recordId: string) => {
    // TODO: Implementar descarga de PDF
    console.log(`Downloading record ${recordId}`);
  };

  // Component for mobile record card
  const MobileRecordCard = ({ record }: { record: PreHospitalRecord }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with patient name and actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <h3 className="font-medium text-sm truncate">{record.patientName}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>{record.fecha ? format(new Date(record.fecha), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => viewRecord(record.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadRecord(record.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(record.status)}
              {getPriorityBadge(record.prioridad)}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso</span>
              <span className="text-muted-foreground">
                {record.completedSections.length}/{record.totalSections}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${getProgressPercentage(record.completedSections.length, record.totalSections)}%` 
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {getProgressPercentage(record.completedSections.length, record.totalSections)}%
              </span>
            </div>
          </div>

          {/* Additional info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</span>
            </div>
            <span className="truncate max-w-[120px]">
              {record.medicoReceptorNombre || 'Sin asignar'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando registros...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Registros Prehospitalarios</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestione todos los registros de atención médica prehospitalaria
          </p>
        </div>
        <Button 
          onClick={() => router.push('/records/new')}
          className="w-full sm:w-auto flex-shrink-0"
        >
          <FileText className="h-4 w-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      {/* Filtros - Responsive */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setFiltersExpanded(!filtersExpanded)}>
          <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {filtersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {filtersExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar por nombre del paciente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre del paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de atención</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Estado del registro</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="rojo">Rojo</SelectItem>
                  <SelectItem value="amarillo">Amarillo</SelectItem>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="negro">Negro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              Limpiar Filtros
            </Button>
            <Separator orientation="vertical" className="hidden sm:block h-6" />
            <span className="text-sm text-muted-foreground text-center sm:text-left">
              {filteredRecords.length} de {records.length} registros
            </span>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Lista de registros - Responsive */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Registros</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages} - Mostrando {currentRecords.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron registros</h3>
              <p className="text-muted-foreground">
                {filteredRecords.length === 0 && records.length > 0 
                  ? "Intente ajustar los filtros de búsqueda" 
                  : "No hay registros prehospitalarios disponibles"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile view */}
              <div className="block lg:hidden">
                {currentRecords.map((record) => (
                  <MobileRecordCard key={record.id} record={record} />
                ))}
              </div>

              {/* Desktop view */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Fecha de Atención</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Médico Receptor</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{record.patientName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {record.fecha ? format(new Date(record.fecha), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${getProgressPercentage(record.completedSections.length, record.totalSections)}%` 
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {record.completedSections.length}/{record.totalSections}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getProgressPercentage(record.completedSections.length, record.totalSections)}% completo
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(record.prioridad)}
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px]">
                          <span className="truncate block">{record.medicoReceptorNombre || 'No asignado'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewRecord(record.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadRecord(record.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación - Responsive */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredRecords.length)} de {filteredRecords.length} registros
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {/* Show fewer page numbers on mobile */}
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                      {totalPages > 3 && (
                        <>
                          <span className="px-2">...</span>
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(totalPages)}
                            className="w-8 h-8 p-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 