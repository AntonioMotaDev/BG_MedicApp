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
  Printer
} from 'lucide-react';
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
  // Datos adicionales para la vista detallada
  convenio?: string;
  episodio?: string;
  folio?: string;
  solicitadoPor?: string;
  horaLlamada?: string;
  horaSalida?: string;
  horaLlegada?: string;
  direccion?: string;
  tipoServicio?: string;
  antecedentesPatologicos?: string[];
  historiaClinica?: string;
  lesiones?: any[];
  medicamentos?: string;
  procedimientos?: string[];
}

export default function PreHospitalRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<PreHospitalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecord();
  }, [params.id]);

  const loadRecord = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada real a la API
      // const response = await fetch(`/api/prehospital-records/${params.id}`);
      // const data = await response.json();
      
      // Datos de ejemplo para demostración
      const mockRecord: PreHospitalRecord = {
        id: params.id as string,
        patientId: '1',
        patientName: 'Juan Pérez García',
        fecha: '2024-01-15',
        createdAt: '2024-01-15T10:30:00Z',
        status: 'completed',
        completedSections: ['datos-registro', 'datos-captacion', 'antecedentes', 'localizacion', 'manejo'],
        totalSections: 11,
        prioridad: 'rojo',
        lugarOcurrencia: 'via-publica',
        medicoReceptorNombre: 'Dr. María González',
        convenio: 'ISSSTE',
        episodio: 'EP001234',
        folio: 'F567890',
        solicitadoPor: 'Cruz Roja',
        horaLlamada: '10:15',
        horaSalida: '10:20',
        horaLlegada: '10:35',
        direccion: 'Av. Principal #123, Col. Centro',
        tipoServicio: 'emergencia',
        antecedentesPatologicos: ['Hipertensión', 'Diabetes'],
        historiaClinica: 'Paciente masculino de 45 años con dolor torácico agudo...',
        lesiones: [
          { tipo: 'contusion', region: 'torax', severidad: 'moderada' }
        ],
        medicamentos: 'Nitroglicerina sublingual 0.4mg',
        procedimientos: ['RCP', 'Oxígeno suplementario', 'Monitoreo cardíaco']
      };
      
      setRecord(mockRecord);
    } catch (error) {
      console.error('Error loading record:', error);
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
    if (!priority) return null;
    
    const priorityConfig = {
      rojo: { label: 'Rojo - Crítico', color: 'bg-red-500' },
      amarillo: { label: 'Amarillo - Urgente', color: 'bg-yellow-500' },
      verde: { label: 'Verde - No urgente', color: 'bg-green-500' },
      negro: { label: 'Negro - Fallecido', color: 'bg-gray-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full ${config.color}`} />
        <span className="font-medium">{config.label}</span>
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
    // TODO: Implementar descarga de PDF
    console.log(`Downloading record ${record?.id}`);
  };

  const printRecord = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
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
      <div className="container mx-auto py-6">
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/prehospital-records')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Registro Prehospitalario</h1>
            <p className="text-muted-foreground">
              Registro ID: {record.id} - {record.patientName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Estado y progreso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
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
                {format(new Date(record.fecha), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fecha de creación</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Datos Generales</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="font-medium">{record.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Convenio:</span>
                  <span>{record.convenio || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Episodio:</span>
                  <span>{record.episodio || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Folio:</span>
                  <span>{record.folio || 'No especificado'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Prioridad Médica</h3>
              <div className="mb-4">
                {getPriorityBadge(record.prioridad)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Médico Receptor:</span>
                  <span>{record.medicoReceptorNombre || 'No asignado'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos de captación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Datos de Captación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Horarios</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora de llamada:</span>
                  <span>{record.horaLlamada || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora de salida:</span>
                  <span>{record.horaSalida || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora de llegada:</span>
                  <span>{record.horaLlegada || 'No especificado'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Ubicación</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lugar de ocurrencia:</span>
                  <span>{record.lugarOcurrencia || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dirección:</span>
                  <span className="text-right">{record.direccion || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solicitado por:</span>
                  <span>{record.solicitadoPor || 'No especificado'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Antecedentes médicos */}
      {record.antecedentesPatologicos && record.antecedentesPatologicos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Antecedentes Patológicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {record.antecedentesPatologicos.map((antecedente, index) => (
                <Badge key={index} variant="secondary">
                  {antecedente}
                </Badge>
              ))}
            </div>
            {record.historiaClinica && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Historia Clínica</h4>
                <p className="text-sm text-muted-foreground">{record.historiaClinica}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Procedimientos y medicamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {record.procedimientos && record.procedimientos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Procedimientos Realizados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {record.procedimientos.map((procedimiento, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">{procedimiento}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {record.medicamentos && (
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos Administrados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{record.medicamentos}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 