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
import { BodyMap } from '@/components/BodyMap';

interface PreHospitalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patient?: {
    age?: number;
    sex?: string;
    phone?: string;
    responsiblePerson?: string;
    emergencyContact?: string;
    street?: string;
    exteriorNumber?: string;
    interiorNumber?: string;
    neighborhood?: string;
    city?: string;
    insurance?: string;
    
    
  };
  fecha: string;
  createdAt: string;
  status: 'draft' | 'partial' | 'completed';
  completedSections: string[];
  totalSections: number;
  // Datos del registro
  convenio?: string;
  episodio?: string;
  folio?: string;
  solicitadoPor?: string;
  // Datos de captación
  horaLlegada?: string;
  horaArribo?: string;
  tiempoEspera?: string;
  horaTermino?: string;
  ubicacion?: string;
  tipoServicio?: string;
  otroTipoServicio?: string;
  lugarOcurrencia?: string;
  // Antecedentes patológicos
  antecedentesPatologicos?: string[];
  otraPatologia?: string;
  // Antecedentes clínicos
  tipoAntecedente?: string;
  otroTipoAntecedente?: string;
  agenteCasual?: string;
  cinematica?: string;
  medidaSeguridad?: string;
  // Localización de lesiones
  lesiones?: any[];
  // Manejo
  viaAerea?: boolean;
  canalizacion?: boolean;
  empaquetamiento?: boolean;
  inmovilizacion?: boolean;
  monitor?: boolean;
  rcpBasica?: boolean;
  mastPna?: boolean;
  collarinCervical?: boolean;
  desfibrilacion?: boolean;
  apoyoVent?: boolean;
  oxigeno?: string;
  otroManejo?: string;
  // Medicamentos
  medicamentos?: string;
  // Urgencias Gineco-obstétricas
  parto?: boolean;
  aborto?: boolean;
  hxVaginal?: boolean;
  fechaUltimaMenstruacion?: string;
  semanasGestacion?: string;
  ruidosCardiacosFetales?: string;
  expulsionPlacenta?: string;
  horaExpulsionPlacenta?: string;
  gesta?: string;
  partos?: string;
  cesareas?: string;
  abortos?: string;
  metodosAnticonceptivos?: string;
  // Negativa de atención
  negativaAtencion?: boolean;
  firmaPaciente?: string;
  firmaTestigo?: string;
  // Justificación de prioridad
  prioridad?: string;
  pupilas?: string;
  colorPiel?: string;
  piel?: string;
  temperatura?: string;
  influenciadoPor?: string[];
  otroInfluencia?: string;
  // Unidad Médica que Recibe
  lugarOrigen?: string;
  lugarConsulta?: string;
  lugarDestino?: string;
  ambulanciaNumero?: string;
  ambulanciaPlacas?: string;
  personal?: string;
  doctor?: string;
  // Médico receptor
  medicoReceptorNombre?: string;
  medicoReceptorFirma?: string;
  horaEntrega?: string;
  // Para mantener compatibilidad temporal
  motivoNegativa?: string;
  observaciones?: string;
  observacionesAdicionales?: string;
  // Campos derivados para procedimientos
  procedimientos?: string[];
}

// Copio los colores de lesión aquí para usarlos en la lista:
const lesionColors: Record<string, string> = {
  '1': '#ef4444', // Hemorragia
  '2': '#8b5cf6', // Herida
  '3': '#3b82f6', // Contusión
  '4': '#f59e0b', // Fractura
  '5': '#10b981', // Luxación/Esguince
  '6': '#6b7280', // Objeto extraño
  '7': '#dc2626', // Quemadura
  '8': '#059669', // Picadura/Mordedura
  '9': '#7c3aed', // Edema/Hematoma
  '10': '#1f2937', // Otro
};

export default function PreHospitalRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<PreHospitalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { generatePdf } = usePdfGenerator();
  const [side, setSide] = useState<'front' | 'back'>('front');

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
    if (!priority) return <span className="text-muted-foreground">-</span>;
    
    const priorityConfig = {
      rojo: { label: 'Rojo - Crítico', color: 'bg-red-500' },
      amarillo: { label: 'Amarillo - Urgente', color: 'bg-yellow-500' },
      verde: { label: 'Verde - No urgente', color: 'bg-green-500' },
      negro: { label: 'Negro - Fallecido', color: 'bg-gray-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return <span className="text-muted-foreground">-</span>;
    
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
  const displayValue = (value: any, fallback: string = "-") => {
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
            <h1 className="text-2xl lg:text-3xl font-bold">{record.patientName}</h1>
            <p className="text-muted-foreground text-sm lg:text-base truncate">
              Registro ID: {record.id}
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
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-sm text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Progreso: {getProgressPercentage(record.completedSections.length, record.totalSections)}% completado</p>
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
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Atendido el</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {record.fecha ? format(new Date(record.fecha), 'dd/MM/yyyy', { locale: es }) : '-'}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fecha de creación</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : '-'}
              </p>
            </div>

            <div className="col-span-3 space-y-2">
              <h3 className="font-semibold mb-3">Datos del Registro</h3>
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
                  <span className="text-muted-foreground font-medium">Solicitado por:</span>
                  <span className="break-words">{displayValue(record.solicitadoPor)}</span>
                </div>
              </div>
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
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Nombre:</span>
                  <span className="font-medium break-words">{displayValue(record.patientName)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Edad:</span>
                  <span className="break-words">{record.patient?.age || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Sexo:</span>
                  <span className="break-words">{record.patient?.sex || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Teléfono:</span>
                  <span className="break-words">{record.patient?.phone || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Persona responsable:</span>
                  <span className="break-words">{record.patient?.responsiblePerson || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Calle:</span>
                  <span className="break-words">{record.patient?.street || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Número exterior:</span>
                  <span className="break-words">{record.patient?.exteriorNumber || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Número interior:</span>
                  <span className="break-words">{record.patient?.interiorNumber || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Colonia:</span>
                  <span className="break-words">{record.patient?.neighborhood || '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                  <span className="text-muted-foreground font-medium">Ciudad:</span>
                  <span className="break-words">{record.patient?.city || '-'}</span>
                </div>
                
                {record.patient?.emergencyContact && (
                  <div className="flex flex-col sm:flex-row sm:justify-start gap-1">
                    <span className="text-muted-foreground font-medium">Contacto de emergencia:</span>
                    <span className="break-words">{record.patient.emergencyContact}</span>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Datos de captación - Completos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Datos de Captación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Horarios del Servicio</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Hora de llegada:</span>
                  <span className="break-words">{displayValue(record.horaLlegada)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Hora de arribo:</span>
                  <span className="break-words">{displayValue(record.horaArribo)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Tiempo de espera:</span>
                  <span className="break-words">{displayValue(record.tiempoEspera)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Hora de término:</span>
                  <span className="break-words">{displayValue(record.horaTermino)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Ubicación y Servicio</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Ubicación:</span>
                  <span className="break-words">{displayValue(record.ubicacion)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Tipo de servicio:</span>
                  <span className="break-words">{displayValue(record.tipoServicio)}</span>
                </div>
                {record.otroTipoServicio && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-muted-foreground font-medium">Otro tipo especificado:</span>
                    <span className="break-words">{record.otroTipoServicio}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Lugar de ocurrencia:</span>
                  <span className="break-words">{displayValue(record.lugarOcurrencia)}</span>
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
            <FileText className="h-5 w-5" />
            Antecedentes Médicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
              {record.otraPatologia && (
                <div className="mt-3">
                  <span className="text-muted-foreground font-medium">Otra patología especificada: </span>
                  <span className="break-words">{record.otraPatologia}</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-3">Antecedentes Clínicos</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Tipo de antecedente:</span>
                  <span className="break-words">{displayValue(record.tipoAntecedente)}</span>
                </div>
                {record.otroTipoAntecedente && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-muted-foreground font-medium">Otro tipo especificado:</span>
                    <span className="break-words">{record.otroTipoAntecedente}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Agente casual:</span>
                  <span className="break-words">{displayValue(record.agenteCasual)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Cinemática:</span>
                  <span className="break-words">{displayValue(record.cinematica)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Medida de seguridad:</span>
                  <span className="break-words">{displayValue(record.medidaSeguridad)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localización de lesiones */}
      <Card className="border bg-white/80 shadow-none rounded-xl p-4">
        <CardHeader className="pb-2 border-none bg-transparent">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-5 w-5" />
            Localización de Lesiones
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {record.lesiones && record.lesiones.length > 0 ? (
            <>
              <BodyMap
                lesions={record.lesiones}
                side={side}
                onSideChange={setSide}
                showSwitch={true}
              />
              <div className="w-full mt-2">
                <ul className="space-y-1">
                  {record.lesiones.map((lesion: any, index: number) => (
                    <li key={index} className="text-xs text-gray-700 flex gap-2 items-center">
                      <span className="inline-block w-2 h-2 rounded-full" style={{background: lesionColors[lesion.type] || '#333'}}></span>
                      <span>Lesión {index + 1}:</span>
                      <span className="font-medium">Tipo {lesion.type}</span>
                      <span>- {lesion.side === 'front' ? 'Anverso' : 'Reverso'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No se han registrado lesiones</p>
          )}
        </CardContent>
      </Card>

      {/* Manejo y procedimientos - Completos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Manejo y Procedimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Procedimientos Realizados</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.viaAerea ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Vía aérea</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.canalizacion ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Canalización</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.empaquetamiento ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Empaquetamiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.inmovilizacion ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Inmovilización</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.monitor ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Monitor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.rcpBasica ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">RCP Básica</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.mastPna ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">MAST o PNA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.collarinCervical ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Collarín Cervical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.desfibrilacion ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Desfibrilación</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${record.apoyoVent ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Apoyo Vent.</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground font-medium">Oxígeno (L/min):</span>
                <span className="break-words">{displayValue(record.oxigeno)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground font-medium">Otro manejo:</span>
                <span className="break-words">{displayValue(record.otroManejo)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h4 className="font-semibold mb-2">Medicamentos administrados</h4>
            <p className="text-sm break-words">
              {displayValue(record.medicamentos, "No se han administrado medicamentos")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Urgencias Gineco-obstétricas - Solo si hay datos */}
      {(record.parto || record.aborto || record.hxVaginal || record.fechaUltimaMenstruacion || 
        record.semanasGestacion || record.ruidosCardiacosFetales || record.expulsionPlacenta ||
        record.horaExpulsionPlacenta || record.gesta || record.partos || record.cesareas ||
        record.abortos || record.metodosAnticonceptivos) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Urgencias Gineco-obstétricas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Condiciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${record.parto ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Parto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${record.aborto ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Aborto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${record.hxVaginal ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Hx. Vaginal</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Información Ginecológica</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Fecha última menstruación:</span>
                      <span className="break-words">{displayValue(record.fechaUltimaMenstruacion)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Semanas de gestación:</span>
                      <span className="break-words">{displayValue(record.semanasGestacion)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Ruidos cardíacos fetales:</span>
                      <span className="break-words">{displayValue(record.ruidosCardiacosFetales)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Expulsión placenta:</span>
                      <span className="break-words">{displayValue(record.expulsionPlacenta)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Hora expulsión placenta:</span>
                      <span className="break-words">{displayValue(record.horaExpulsionPlacenta)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Historia Obstétrica</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Gesta:</span>
                      <span className="break-words">{displayValue(record.gesta)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Partos:</span>
                      <span className="break-words">{displayValue(record.partos)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Cesáreas:</span>
                      <span className="break-words">{displayValue(record.cesareas)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Abortos:</span>
                      <span className="break-words">{displayValue(record.abortos)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-medium">Métodos anticonceptivos:</span>
                      <span className="break-words">{displayValue(record.metodosAnticonceptivos)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Negativa de atención */}
      {(record.negativaAtencion || record.firmaPaciente || record.firmaTestigo) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Negativa de Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
              
              {(record.firmaPaciente || record.firmaTestigo) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {record.firmaPaciente && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Firma del paciente:</span>
                      <span className="break-words">{displayValue(record.firmaPaciente)}</span>
                    </div>
                  )}
                  {record.firmaTestigo && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground font-medium">Firma del testigo:</span>
                      <span className="break-words">{displayValue(record.firmaTestigo)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Justificación de prioridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Justificación de Prioridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Prioridad Médica</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Prioridad:</span>
                  <div>{getPriorityBadge(record.prioridad)}</div>
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
                  <span className="text-muted-foreground font-medium">Piel:</span>
                  <span className="break-words">{displayValue(record.piel)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Temperatura:</span>
                  <span className="break-words">{displayValue(record.temperatura)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Influencias</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Influenciado por:</span>
                  {record.influenciadoPor && record.influenciadoPor.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {record.influenciadoPor.map((influencia, index) => (
                        <Badge key={index} variant="outline">
                          {influencia}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                {record.otroInfluencia && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-muted-foreground font-medium">Otra influencia especificada:</span>
                    <span className="break-words">{record.otroInfluencia}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unidad médica que recibe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Unidad Médica que Recibe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Lugares</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Lugar de origen:</span>
                  <span className="break-words">{displayValue(record.lugarOrigen)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Lugar de consulta:</span>
                  <span className="break-words">{displayValue(record.lugarConsulta)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Lugar de destino:</span>
                  <span className="break-words">{displayValue(record.lugarDestino)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Ambulancia y Personal</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Ambulancia número:</span>
                  <span className="break-words">{displayValue(record.ambulanciaNumero)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Placas de ambulancia:</span>
                  <span className="break-words">{displayValue(record.ambulanciaPlacas)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Personal:</span>
                  <span className="break-words">{displayValue(record.personal)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Doctor:</span>
                  <span className="break-words">{displayValue(record.doctor)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Médico receptor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Médico Receptor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-muted-foreground font-medium">Nombre del médico:</span>
              <span className="break-words">{displayValue(record.medicoReceptorNombre, "No asignado")}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-muted-foreground font-medium">Hora de entrega:</span>
              <span className="break-words">{displayValue(record.horaEntrega)}</span>
            </div>
            {record.medicoReceptorFirma && (
              <div className="md:col-span-2">
                <span className="text-muted-foreground font-medium">Firma del médico:</span>
                <div className="mt-2 border rounded p-2 bg-gray-50">
                  <img 
                    src={record.medicoReceptorFirma} 
                    alt="Firma del médico receptor" 
                    className="max-w-[200px] h-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observaciones adicionales - Solo si hay */}
      {(record.observaciones || record.observacionesAdicionales) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {record.observaciones && (
                <div>
                  <h4 className="font-semibold mb-2">Observaciones médicas</h4>
                  <p className="text-sm break-words">{record.observaciones}</p>
                </div>
              )}
              {record.observacionesAdicionales && (
                <>
                  {record.observaciones && <Separator />}
                  <div>
                    <h4 className="font-semibold mb-2">Observaciones adicionales</h4>
                    <p className="text-sm break-words">{record.observacionesAdicionales}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 