"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Calendar, 
  User, 
  Clock, 
  MapPin,
  Activity,
  FileText,
  Printer,
  MoreHorizontal,
  Heart,
  Stethoscope,
  Pill,
  AlertTriangle,
  UserCheck,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';

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
  // Datos del registro
  convenio?: string;
  episodio?: string;
  folio?: string;
  solicitadoPor?: string;
  horaLlamada?: string;
  horaSalida?: string;
  horaLlegada?: string;
  direccion?: string;
  tipoServicio?: string;
  // Información del paciente
  edad?: string;
  sexo?: string;
  telefono?: string;
  // Antecedentes y evaluación
  antecedentesPatologicos?: string[];
  historiaClinica?: string;
  lesiones?: any[];
  medicamentos?: string;
  procedimientos?: string[];
  // Signos vitales
  presionArterial?: string;
  frecuenciaCardiaca?: string;
  frecuenciaRespiratoria?: string;
  saturacionOxigeno?: string;
  temperatura?: string;
  glucosa?: string;
  // Evaluación neurológica
  glasgow?: string;
  pupilas?: string;
  // Evaluación física
  colorPiel?: string;
  piel?: string;
  // Sustancias
  influenciadoPor?: string[];
  // Tratamiento
  oxigeno?: boolean;
  medicamentosAdministrados?: string[];
  // Traslado
  trasladoA?: string;
  acompanante?: string;
  // Médico receptor
  medicoReceptorCedula?: string;
  medicoReceptorEspecialidad?: string;
  // Negativa de atención
  negativaAtencion?: boolean;
  motivoNegativa?: string;
  firmaPaciente?: string;
  firmaTestigo?: string;
  // Observaciones
  observaciones?: string;
  observacionesAdicionales?: string;
}

export default function PreHospitalRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<PreHospitalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { generatePdf } = usePdfGenerator();

  useEffect(() => {
    loadRecord();
  }, [params.id]);

  const loadRecord = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prehospital-records/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setRecord(null);
          return;
        }
        throw new Error('Failed to fetch record');
      }
      const data = await response.json();
      setRecord(data);
    } catch (error) {
      console.error('Error loading record:', error);
      setRecord(null);
    } finally {
      setLoading(false);
    }
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
    if (!priority) return <span className="text-muted-foreground">No especificado</span>;
    
    const priorityConfig = {
      rojo: { label: 'Rojo - Crítico', color: 'bg-red-500' },
      amarillo: { label: 'Amarillo - Urgente', color: 'bg-yellow-500' },
      verde: { label: 'Verde - No urgente', color: 'bg-green-500' },
      negro: { label: 'Negro - Fallecido', color: 'bg-gray-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return <span className="text-muted-foreground">No especificado</span>;
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full ${config.color}`} />
        <span className="font-medium text-sm">{config.label}</span>
      </div>
    );
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const editRecord = () => {
    router.push(`/records/edit/${record?.id}`);
  };

  const downloadRecord = () => {
    if (record) {
      try {
        generatePdf(record);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const printRecord = () => {
    window.print();
  };

  // Helper function para mostrar valores con fallback
  const displayValue = (value: any, fallback: string = "No especificado") => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : fallback;
    }
    return value || fallback;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando registro...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Registro no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El registro solicitado no existe o no tiene permisos para verlo.
          </p>
          <Button onClick={() => router.push('/prehospital-records')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Button 
            variant="outline" 
            onClick={() => router.push('/prehospital-records')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold">Registro Prehospitalario</h1>
            <p className="text-muted-foreground text-sm lg:text-base truncate">
              Registro ID: {record.id} - {record.patientName}
            </p>
          </div>
        </div>
        
        {/* Action buttons - Responsive */}
        <div className="flex items-center gap-2">
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" onClick={printRecord}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={downloadRecord}>
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
            <Button onClick={editRecord}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
          
          {/* Mobile dropdown */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={editRecord}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadRecord}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={printRecord}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Estado y progreso - Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Estado del Registro</span>
            {getStatusBadge(record.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Progreso del registro</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ 
                        width: `${getProgressPercentage(record.completedSections.length, record.totalSections)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {record.completedSections.length}/{record.totalSections}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getProgressPercentage(record.completedSections.length, record.totalSections)}% completado
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fecha de atención</span>
              </div>
              <p className="text-lg">
                {record.fecha ? format(new Date(record.fecha), 'dd/MM/yyyy', { locale: es }) : 'No especificado'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fecha de creación</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'No especificado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del paciente - Completa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Datos Personales</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Nombre completo:</span>
                  <span className="font-medium break-words">{displayValue(record.patientName)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Edad:</span>
                  <span className="break-words">{displayValue(record.edad)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Sexo:</span>
                  <span className="break-words">{displayValue(record.sexo)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Teléfono:</span>
                  <span className="break-words">{displayValue(record.telefono)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Datos Administrativos</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Convenio:</span>
                  <span className="break-words">{displayValue(record.convenio)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Episodio:</span>
                  <span className="break-words">{displayValue(record.episodio)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Folio:</span>
                  <span className="break-words">{displayValue(record.folio)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Prioridad médica:</span>
                  <div>{getPriorityBadge(record.prioridad)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos de captación - Completos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Datos de Captación y Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Horarios del Servicio</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Hora de llamada:</span>
                  <span className="break-words">{displayValue(record.horaLlamada)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Hora de salida:</span>
                  <span className="break-words">{displayValue(record.horaSalida)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Hora de llegada:</span>
                  <span className="break-words">{displayValue(record.horaLlegada)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Tipo de servicio:</span>
                  <span className="break-words">{displayValue(record.tipoServicio)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Ubicación y Solicitud</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Dirección:</span>
                  <span className="break-words">{displayValue(record.direccion)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Lugar de ocurrencia:</span>
                  <span className="break-words">{displayValue(record.lugarOcurrencia)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Solicitado por:</span>
                  <span className="break-words">{displayValue(record.solicitadoPor)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signos vitales - Completos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Signos Vitales y Evaluación Física
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Signos Vitales</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Presión arterial:</span>
                  <span className="break-words">{displayValue(record.presionArterial)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Frecuencia cardíaca:</span>
                  <span className="break-words">{displayValue(record.frecuenciaCardiaca)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Frecuencia respiratoria:</span>
                  <span className="break-words">{displayValue(record.frecuenciaRespiratoria)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Saturación de oxígeno:</span>
                  <span className="break-words">{displayValue(record.saturacionOxigeno)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Temperatura:</span>
                  <span className="break-words">{displayValue(record.temperatura)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Glucosa:</span>
                  <span className="break-words">{displayValue(record.glucosa)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Evaluación Física</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Escala de Glasgow:</span>
                  <span className="break-words">{displayValue(record.glasgow)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Pupilas:</span>
                  <span className="break-words">{displayValue(record.pupilas)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Color de piel:</span>
                  <span className="break-words">{displayValue(record.colorPiel)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Condición de piel:</span>
                  <span className="break-words">{displayValue(record.piel)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Influenciado por:</span>
                  <span className="break-words">{displayValue(record.influenciadoPor)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Antecedentes médicos - Completos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Antecedentes Médicos e Historia Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Antecedentes Patológicos</h3>
              {record.antecedentesPatologicos && record.antecedentesPatologicos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {record.antecedentesPatologicos.map((antecedente, index) => (
                    <Badge key={index} variant="secondary">
                      {antecedente}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No se han registrado antecedentes patológicos</p>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-3">Historia Clínica</h3>
              <p className="text-sm break-words">
                {displayValue(record.historiaClinica, "No se ha registrado historia clínica")}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-3">Observaciones Médicas</h3>
              <p className="text-sm break-words">
                {displayValue(record.observaciones, "No se han registrado observaciones")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedimientos y medicamentos - Completos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Procedimientos Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {record.procedimientos && record.procedimientos.length > 0 ? (
              <ul className="space-y-2">
                {record.procedimientos.map((procedimiento, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm break-words">{procedimiento}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No se han registrado procedimientos</p>
            )}
            
            <Separator className="my-4" />
            
            <div>
              <h4 className="font-semibold mb-2">Oxígeno administrado</h4>
              <p className="text-sm">
                {record.oxigeno ? "Sí" : "No especificado"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medicamentos y Tratamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Medicamentos administrados</h4>
                <p className="text-sm break-words">
                  {displayValue(record.medicamentos, "No se han administrado medicamentos")}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Lista de medicamentos</h4>
                {record.medicamentosAdministrados && record.medicamentosAdministrados.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {record.medicamentosAdministrados.map((medicamento, index) => (
                      <Badge key={index} variant="outline">
                        {medicamento}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No se han registrado medicamentos específicos</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traslado y médico receptor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Traslado y Médico Receptor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Información de Traslado</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Trasladado a:</span>
                  <span className="break-words">{displayValue(record.trasladoA)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Acompañante:</span>
                  <span className="break-words">{displayValue(record.acompanante)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Médico Receptor</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Nombre:</span>
                  <span className="break-words">{displayValue(record.medicoReceptorNombre, "No asignado")}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Cédula profesional:</span>
                  <span className="break-words">{displayValue(record.medicoReceptorCedula)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Especialidad:</span>
                  <span className="break-words">{displayValue(record.medicoReceptorEspecialidad)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Negativa de atención */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Negativa de Atención
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Estado de la Atención</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">¿Negativa de atención?:</span>
                  <span className="break-words">
                    {record.negativaAtencion ? (
                      <Badge variant="destructive">Sí</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </span>
                </div>
                {record.negativaAtencion && (
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground font-medium">Motivo de la negativa:</span>
                    <span className="break-words">{displayValue(record.motivoNegativa)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Firmas</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Firma del paciente:</span>
                  <span className="break-words">{displayValue(record.firmaPaciente)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Firma del testigo:</span>
                  <span className="break-words">{displayValue(record.firmaTestigo)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Observaciones Adicionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm break-words">
              {displayValue(record.observacionesAdicionales, "No se han registrado observaciones adicionales")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 