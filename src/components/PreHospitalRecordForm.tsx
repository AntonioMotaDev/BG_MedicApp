"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, MapPin, Activity, FileText, User } from 'lucide-react';
import type { Patient } from '@/lib/schema';

interface PreHospitalRecordFormProps {
  patient: Patient;
  onCancel: () => void;
  onSubmitSuccess: () => void;
}

interface FormData {
  // Datos del registro
  convenio: string;
  episodio: string;
  folio: string;
  fecha: string;
  solicitadoPor: string;
  
  // Datos de captación
  horaLlegada: string;
  horaArribo: string;
  tiempoEspera: string;
  horaTermino: string;
  ubicacion: string;
  tipoServicio: string;
  otroTipoServicio: string;
  lugarOcurrencia: string;
  
  // Antecedentes patológicos
  antecedentesPatologicos: string[];
  otraPatologia: string;
  
  // Antecedentes clínicos
  tipoAntecedente: string;
  otroTipoAntecedente: string;
  agenteCasual: string;
  cinematica: string;
  medidaSeguridad: string;
}

export default function PreHospitalRecordForm({ patient, onCancel, onSubmitSuccess }: PreHospitalRecordFormProps) {
  const [activeTab, setActiveTab] = useState("datos-registro");
  const [selectedPatologias, setSelectedPatologias] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      antecedentesPatologicos: [],
    }
  });

  const tipoServicio = watch('tipoServicio');
  const tipoAntecedente = watch('tipoAntecedente');

  const handlePatologiaChange = (patologia: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedPatologias, patologia]
      : selectedPatologias.filter(p => p !== patologia);
    
    setSelectedPatologias(updated);
    setValue('antecedentesPatologicos', updated);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log('Datos del formulario:', data);
      // Aquí se enviarían los datos al backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular envío
      onSubmitSuccess();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tiposServicio = [
    { value: "traslado", label: "Traslado" },
    { value: "urgencia", label: "Urgencia" },
    { value: "estudio", label: "Estudio" },
    { value: "cuidados-intensivos", label: "Cuidados Intensivos" },
    { value: "otro", label: "Otro" }
  ];

  const lugaresOcurrencia = [
    { value: "hogar", label: "Hogar" },
    { value: "escuela", label: "Escuela" },
    { value: "trabajo", label: "Trabajo" },
    { value: "recreativo", label: "Recreativo" },
    { value: "via-publica", label: "Vía Pública" }
  ];

  const patologias = [
    { value: "respiratoria", label: "Respiratoria" },
    { value: "emocional", label: "Emocional" },
    { value: "sistemica", label: "Sistémica" },
    { value: "cardiovascular", label: "Cardiovascular" },
    { value: "neurologica", label: "Neurológica" },
    { value: "alergico", label: "Alérgico" },
    { value: "metabolica", label: "Metabólica" },
    { value: "otra", label: "Otra" }
  ];

  const tiposAntecedentes = [
    { value: "atropellado", label: "Atropellado" },
    { value: "lx-caida", label: "Lx. por caída" },
    { value: "intoxicacion", label: "Intoxicación" },
    { value: "amputacion", label: "Amputación" },
    { value: "choque", label: "Choque" },
    { value: "agresion", label: "Agresión" },
    { value: "hpaf", label: "H.P.A.F." },
    { value: "hpab", label: "H.P.A.B." },
    { value: "volcadura", label: "Volcadura" },
    { value: "quemadura", label: "Quemadura" },
    { value: "otro", label: "Otro" }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Registro de Atención Prehospitalaria
        </CardTitle>
        <CardDescription>
          Complete toda la información del registro médico
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Información del Paciente */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <h3 className="font-medium">Paciente:</h3>
          </div>
          <div className="text-sm space-y-1">
            <p><strong>{patient.firstName} {patient.paternalLastName} {patient.maternalLastName}</strong></p>
            <div className="flex gap-4">
              <Badge variant="outline">{patient.age} años</Badge>
              <Badge variant="outline">{patient.sex}</Badge>
              <Badge variant="outline">{patient.phone}</Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="datos-registro">
                <FileText className="h-4 w-4 mr-2" />
                Datos del Registro
              </TabsTrigger>
              <TabsTrigger value="datos-captacion">
                <Clock className="h-4 w-4 mr-2" />
                Datos de Captación
              </TabsTrigger>
              <TabsTrigger value="antecedentes">
                <Activity className="h-4 w-4 mr-2" />
                Antecedentes
              </TabsTrigger>
            </TabsList>

            {/* Sección 1: Datos del Registro */}
            <TabsContent value="datos-registro" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="convenio">Convenio</Label>
                  <Input
                    id="convenio"
                    {...register('convenio', { required: 'El convenio es requerido' })}
                    className={errors.convenio ? 'border-destructive' : ''}
                  />
                  {errors.convenio && (
                    <p className="text-sm text-destructive">{errors.convenio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="episodio">Episodio</Label>
                  <Input
                    id="episodio"
                    {...register('episodio', { required: 'El episodio es requerido' })}
                    className={errors.episodio ? 'border-destructive' : ''}
                  />
                  {errors.episodio && (
                    <p className="text-sm text-destructive">{errors.episodio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folio">Folio</Label>
                  <Input
                    id="folio"
                    {...register('folio', { required: 'El folio es requerido' })}
                    className={errors.folio ? 'border-destructive' : ''}
                  />
                  {errors.folio && (
                    <p className="text-sm text-destructive">{errors.folio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    {...register('fecha', { required: 'La fecha es requerida' })}
                    className={errors.fecha ? 'border-destructive' : ''}
                  />
                  {errors.fecha && (
                    <p className="text-sm text-destructive">{errors.fecha.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="solicitadoPor">Solicitado por</Label>
                <Input
                  id="solicitadoPor"
                  {...register('solicitadoPor', { required: 'Este campo es requerido' })}
                  className={errors.solicitadoPor ? 'border-destructive' : ''}
                />
                {errors.solicitadoPor && (
                  <p className="text-sm text-destructive">{errors.solicitadoPor.message}</p>
                )}
              </div>
            </TabsContent>

            {/* Sección 2: Datos de Captación */}
            <TabsContent value="datos-captacion" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horarios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horaLlegada">Hora de Llegada</Label>
                    <Input
                      id="horaLlegada"
                      type="time"
                      {...register('horaLlegada', { required: 'La hora de llegada es requerida' })}
                      className={errors.horaLlegada ? 'border-destructive' : ''}
                    />
                    {errors.horaLlegada && (
                      <p className="text-sm text-destructive">{errors.horaLlegada.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horaArribo">Hora de Arribo</Label>
                    <Input
                      id="horaArribo"
                      type="time"
                      {...register('horaArribo', { required: 'La hora de arribo es requerida' })}
                      className={errors.horaArribo ? 'border-destructive' : ''}
                    />
                    {errors.horaArribo && (
                      <p className="text-sm text-destructive">{errors.horaArribo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiempoEspera">Tiempo de Espera (minutos)</Label>
                    <Input
                      id="tiempoEspera"
                      type="number"
                      min="0"
                      {...register('tiempoEspera')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horaTermino">Hora de Término</Label>
                    <Input
                      id="horaTermino"
                      type="time"
                      {...register('horaTermino', { required: 'La hora de término es requerida' })}
                      className={errors.horaTermino ? 'border-destructive' : ''}
                    />
                    {errors.horaTermino && (
                      <p className="text-sm text-destructive">{errors.horaTermino.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ubicación (Lugar de traslado)
                  </Label>
                  <Input
                    id="ubicacion"
                    {...register('ubicacion', { required: 'La ubicación es requerida' })}
                    placeholder="Especifique el destino del traslado"
                    className={errors.ubicacion ? 'border-destructive' : ''}
                  />
                  {errors.ubicacion && (
                    <p className="text-sm text-destructive">{errors.ubicacion.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Tipo de Servicio</Label>
                  <Select onValueChange={(value) => setValue('tipoServicio', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposServicio.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {tipoServicio === 'otro' && (
                    <div className="space-y-2">
                      <Label htmlFor="otroTipoServicio">Especifique otro tipo de servicio</Label>
                      <Input
                        id="otroTipoServicio"
                        {...register('otroTipoServicio')}
                        placeholder="Especifique..."
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Lugar de Ocurrencia (Donde se recogió al paciente)</Label>
                  <RadioGroup onValueChange={(value) => setValue('lugarOcurrencia', value)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {lugaresOcurrencia.map((lugar) => (
                        <div key={lugar.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={lugar.value} id={lugar.value} />
                          <Label htmlFor={lugar.value}>{lugar.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>

            {/* Sección 3: Antecedentes */}
            <TabsContent value="antecedentes" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Antecedentes Patológicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {patologias.map((patologia) => (
                    <div key={patologia.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={patologia.value}
                        checked={selectedPatologias.includes(patologia.value)}
                        onCheckedChange={(checked) => 
                          handlePatologiaChange(patologia.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={patologia.value}>{patologia.label}</Label>
                    </div>
                  ))}
                </div>
                
                {selectedPatologias.includes('otra') && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="otraPatologia">Especifique otra patología</Label>
                    <Input
                      id="otraPatologia"
                      {...register('otraPatologia')}
                      placeholder="Especifique..."
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Antecedentes Clínicos</h3>
                
                <div className="space-y-3">
                  <Label>A) Tipo</Label>
                  <Select onValueChange={(value) => setValue('tipoAntecedente', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de antecedente" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAntecedentes.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {tipoAntecedente === 'otro' && (
                    <div className="space-y-2">
                      <Label htmlFor="otroTipoAntecedente">Especifique otro tipo</Label>
                      <Input
                        id="otroTipoAntecedente"
                        {...register('otroTipoAntecedente')}
                        placeholder="Especifique..."
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenteCasual">B) Agente Casual (Especificar)</Label>
                  <Textarea
                    id="agenteCasual"
                    {...register('agenteCasual')}
                    placeholder="Describa el agente causal del incidente..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cinematica">Cinemática</Label>
                  <Textarea
                    id="cinematica"
                    {...register('cinematica')}
                    placeholder="Describa la cinemática del trauma..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medidaSeguridad">Medida de Seguridad</Label>
                  <Textarea
                    id="medidaSeguridad"
                    {...register('medidaSeguridad')}
                    placeholder="Describa las medidas de seguridad aplicadas..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botones de Navegación y Acción */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex gap-2">
              {activeTab !== "datos-registro" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ["datos-registro", "datos-captacion", "antecedentes"];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                >
                  Anterior
                </Button>
              )}
              
              {activeTab !== "antecedentes" && (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ["datos-registro", "datos-captacion", "antecedentes"];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                >
                  Siguiente
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 