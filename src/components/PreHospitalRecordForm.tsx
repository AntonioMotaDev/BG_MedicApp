"use client";

import { useState, useRef, useEffect } from 'react';
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
import { AlertCircle, Clock, MapPin, Activity, FileText, User, Heart, Pill, Zap, Baby, UserX, AlertTriangle, Building2, Eraser, Download, Upload, PenTool, Save, CheckCircle2, Clock4 } from 'lucide-react';
import type { Patient, TabStatus, TabConfig } from '@/lib/schema';
import { savePreHospitalRecord, updatePreHospitalRecordProgress } from '@/app/actions';
import { toast } from 'sonner';

interface PreHospitalRecordFormProps {
  patient: Patient;
  onCancel: () => void;
  onSubmitSuccess: () => void;
}

interface BodyLocation {
  id: string;
  type: string;
  x: number;
  y: number;
  side: 'front' | 'back';
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

  // Localización de lesiones
  lesiones: BodyLocation[];

  // Manejo
  viaAerea: boolean;
  canalizacion: boolean;
  empaquetamiento: boolean;
  inmovilizacion: boolean;
  monitor: boolean;
  rcpBasica: boolean;
  mastPna: boolean;
  collarinCervical: boolean;
  desfibrilacion: boolean;
  apoyoVent: boolean;
  oxigeno: string;
  otroManejo: string;

  // Medicamentos
  medicamentos: string;

  // Urgencias Gineco-obstétricas
  parto: boolean;
  aborto: boolean;
  hxVaginal: boolean;
  fechaUltimaMenstruacion: string;
  semanasGestacion: string;
  ruidosCardiacosFetales: string;
  expulsionPlacenta: string;
  horaExpulsionPlacenta: string;
  gesta: string;
  partos: string;
  cesareas: string;
  abortos: string;
  metodosAnticonceptivos: string;

  // Negativa de Atención
  negativaAtencion: boolean;
  firmaPaciente: string;
  firmaTestigo: string;

  // Justificación de prioridad
  prioridad: string;
  pupilas: string;
  colorPiel: string;
  piel: string;
  temperatura: string;
  influenciadoPor: string[];
  otroInfluencia: string;

  // Unidad Médica que Recibe
  lugarOrigen: string;
  lugarConsulta: string;
  lugarDestino: string;
  ambulanciaNumero: string;
  ambulanciaPlacas: string;
  personal: string;
  doctor: string;

  // Médico Receptor
  medicoReceptorNombre: string;
  medicoReceptorFirma: string; // Base64 string de la firma
  horaEntrega: string;
}

export default function PreHospitalRecordForm({ patient, onCancel, onSubmitSuccess }: PreHospitalRecordFormProps) {
  const [activeTab, setActiveTab] = useState("datos-registro");
  const [selectedPatologias, setSelectedPatologias] = useState<string[]>([]);
  const [lesiones, setLesiones] = useState<BodyLocation[]>([]);
  const [selectedLesionType, setSelectedLesionType] = useState("1");
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedInfluencias, setSelectedInfluencias] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [firmaDataURL, setFirmaDataURL] = useState<string>('');
  const [recordId, setRecordId] = useState<string | null>(null);
  const [tabStatuses, setTabStatuses] = useState<Record<string, TabStatus>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab configurations with required fields for completion status
  const tabConfigs: TabConfig[] = [
    {
      id: "datos-registro",
      name: "Datos Registro",
      icon: AlertCircle,
      requiredFields: ["fecha"],
      optionalFields: ["convenio", "episodio", "folio", "solicitadoPor"]
    },
    {
      id: "datos-captacion",
      name: "Captación",
      icon: Clock,
      requiredFields: [],
      optionalFields: ["horaLlegada", "horaArribo", "tiempoEspera", "horaTermino", "ubicacion", "tipoServicio", "lugarOcurrencia"]
    },
    {
      id: "antecedentes",
      name: "Antecedentes",
      icon: FileText,
      requiredFields: [],
      optionalFields: ["antecedentesPatologicos", "tipoAntecedente", "agenteCasual", "cinematica", "medidaSeguridad"]
    },
    {
      id: "lesiones",
      name: "Lesiones",
      icon: Activity,
      requiredFields: [],
      optionalFields: ["lesiones"]
    },
    {
      id: "manejo",
      name: "Manejo",
      icon: Heart,
      requiredFields: [],
      optionalFields: ["viaAerea", "canalizacion", "empaquetamiento", "inmovilizacion", "monitor", "rcpBasica", "mastPna", "collarinCervical", "desfibrilacion", "apoyoVent", "oxigeno", "otroManejo"]
    },
    {
      id: "medicamentos",
      name: "Medicamentos",
      icon: Pill,
      requiredFields: [],
      optionalFields: ["medicamentos"]
    },
    {
      id: "gineco-obstetrica",
      name: "Gineco-obstétrica",
      icon: Baby,
      requiredFields: [],
      optionalFields: ["parto", "aborto", "hxVaginal", "fechaUltimaMenstruacion", "semanasGestacion"]
    },
    {
      id: "negativa",
      name: "Negativa",
      icon: UserX,
      requiredFields: [],
      optionalFields: ["negativaAtencion", "firmaPaciente", "firmaTestigo"]
    },
    {
      id: "justificacion-prioridad",
      name: "Prioridad",
      icon: AlertTriangle,
      requiredFields: [],
      optionalFields: ["prioridad", "pupilas", "colorPiel", "piel", "temperatura", "influenciadoPor"]
    },
    {
      id: "unidad-medica",
      name: "Unidad Médica",
      icon: Building2,
      requiredFields: [],
      optionalFields: ["lugarOrigen", "lugarConsulta", "lugarDestino", "ambulanciaNumero", "ambulanciaPlacas", "personal", "doctor"]
    },
    {
      id: "medico-receptor",
      name: "Médico Receptor",
      icon: User,
      requiredFields: ["medicoReceptorNombre", "horaEntrega"],
      optionalFields: ["medicoReceptorFirma"]
    }
  ];

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      antecedentesPatologicos: [],
      lesiones: [],
      viaAerea: false,
      canalizacion: false,
      empaquetamiento: false,
      inmovilizacion: false,
      monitor: false,
      rcpBasica: false,
      mastPna: false,
      collarinCervical: false,
      desfibrilacion: false,
      apoyoVent: false,
      oxigeno: '',
      otroManejo: '',
      medicamentos: '',
      // Urgencias Gineco-obstétricas
      parto: false,
      aborto: false,
      hxVaginal: false,
      fechaUltimaMenstruacion: '',
      semanasGestacion: '',
      ruidosCardiacosFetales: '',
      expulsionPlacenta: '',
      horaExpulsionPlacenta: '',
      gesta: '',
      partos: '',
      cesareas: '',
      abortos: '',
      metodosAnticonceptivos: '',
      // Negativa de Atención
      negativaAtencion: false,
      firmaPaciente: '',
      firmaTestigo: '',
      // Justificación de prioridad
      prioridad: '',
      pupilas: '',
      colorPiel: '',
      piel: '',
      temperatura: '',
      influenciadoPor: [],
      otroInfluencia: '',
      // Unidad Médica que Recibe
      lugarOrigen: '',
      lugarConsulta: '',
      lugarDestino: '',
      ambulanciaNumero: '',
      ambulanciaPlacas: '',
      personal: '',
      doctor: '',
      // Médico Receptor
      medicoReceptorNombre: '',
      medicoReceptorFirma: '',
      horaEntrega: '',
    }
  });

  const tipoServicio = watch('tipoServicio');
  const tipoAntecedente = watch('tipoAntecedente');
  const negativaAtencion = watch('negativaAtencion');

  // Calculate tab status based on form data
  const calculateTabStatus = (tabId: string, formData: any): TabStatus => {
    const config = tabConfigs.find(tab => tab.id === tabId);
    if (!config) return 'empty';

    const requiredFilled = config.requiredFields.every(field => {
      const value = formData[field];
      return value !== null && value !== undefined && value !== '' && value !== false;
    });

    const optionalFilled = config.optionalFields.some(field => {
      const value = formData[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '' && value !== false;
    });

    if (!requiredFilled && !optionalFilled) return 'empty';
    if (requiredFilled) return 'completed';
    return 'partial';
  };

  // Update tab statuses when form data changes
  useEffect(() => {
    const formData = getValues();
    const newStatuses: Record<string, TabStatus> = {};
    
    tabConfigs.forEach(config => {
      newStatuses[config.id] = calculateTabStatus(config.id, formData);
    });
    
    setTabStatuses(newStatuses);
  }, [watch(), selectedPatologias, lesiones, selectedInfluencias, firmaDataURL]);

  // Get tab trigger class based on status
  const getTabTriggerClass = (tabId: string): string => {
    const status = tabStatuses[tabId] || 'empty';
    const baseClasses = "flex flex-col items-center gap-1 p-3 h-auto text-xs transition-colors";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=inactive]:text-green-600 data-[state=inactive]:bg-green-50`;
      case 'partial':
        return `${baseClasses} data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800 data-[state=inactive]:text-yellow-600 data-[state=inactive]:bg-yellow-50`;
      default:
        return `${baseClasses} data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800 data-[state=inactive]:text-gray-600`;
    }
  };

  // Get status icon
  const getStatusIcon = (tabId: string) => {
    const status = tabStatuses[tabId] || 'empty';
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'partial':
        return <Clock4 className="h-3 w-3 text-yellow-600" />;
      default:
        return null;
    }
  };

  // Save progress function
  const saveProgress = async () => {
    setIsSavingProgress(true);
    try {
      const formData = getValues();
      const completedSections = Object.entries(tabStatuses)
        .filter(([_, status]) => status === 'completed')
        .map(([tabId, _]) => tabId);

      const recordData = {
        ...(recordId && { id: recordId }),
        patientId: patient.id || '',
        ...formData,
        antecedentesPatologicos: selectedPatologias,
        lesiones,
        influenciadoPor: selectedInfluencias,
        medicoReceptorFirma: firmaDataURL,
        completedSections,
        status: completedSections.length === 0 ? 'draft' : 
                completedSections.length < tabConfigs.length ? 'partial' : 'completed'
      };

      const savedRecordId = await savePreHospitalRecord(recordData);
      setRecordId(savedRecordId);
      
      toast.success('Progreso guardado exitosamente');
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Error al guardar el progreso');
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handlePatologiaChange = (patologia: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedPatologias, patologia]
      : selectedPatologias.filter(p => p !== patologia);
    
    setSelectedPatologias(updated);
    setValue('antecedentesPatologicos', updated);
  };

  const handleBodyClick = (event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const newLesion: BodyLocation = {
      id: `lesion-${Date.now()}`,
      type: selectedLesionType,
      x,
      y,
      side: activeSide
    };
    
    const updatedLesiones = [...lesiones, newLesion];
    setLesiones(updatedLesiones);
    setValue('lesiones', updatedLesiones);
  };

  const removeLesion = (id: string) => {
    const updatedLesiones = lesiones.filter(l => l.id !== id);
    setLesiones(updatedLesiones);
    setValue('lesiones', updatedLesiones);
  };

  const handleInfluenciaChange = (influencia: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedInfluencias, influencia]
      : selectedInfluencias.filter(i => i !== influencia);
    
    setSelectedInfluencias(updated);
    setValue('influenciadoPor', updated);
  };

  // Funciones para el manejo de firma digital
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Guardar la firma como base64
    const dataURL = canvas.toDataURL();
    setFirmaDataURL(dataURL);
    setValue('medicoReceptorFirma', dataURL);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFirmaDataURL('');
    setValue('medicoReceptorFirma', '');
  };

  const downloadSignature = () => {
    if (!firmaDataURL) return;
    
    const link = document.createElement('a');
    link.download = `firma-medico-${new Date().getTime()}.png`;
    link.href = firmaDataURL;
    link.click();
  };

  const uploadSignature = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target?.result as string;
      setFirmaDataURL(dataURL);
      setValue('medicoReceptorFirma', dataURL);
      
      // Mostrar la imagen en el canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = dataURL;
    };
    reader.readAsDataURL(file);
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

  const tiposLesion = [
    { value: "1", label: "1. Hemorragia", color: "#ef4444" },
    { value: "2", label: "2. Herida", color: "#8b5cf6" },
    { value: "3", label: "3. Contusión", color: "#3b82f6" },
    { value: "4", label: "4. Fractura", color: "#f59e0b" },
    { value: "5", label: "5. Luxación/Esguince", color: "#10b981" },
    { value: "6", label: "6. Objeto extraño", color: "#6b7280" },
    { value: "7", label: "7. Quemadura", color: "#dc2626" },
    { value: "8", label: "8. Picadura/Mordedura", color: "#059669" },
    { value: "9", label: "9. Edema/Hematoma", color: "#7c3aed" },
    { value: "10", label: "10. Otro", color: "#1f2937" }
  ];

  const procedimientosManejo = [
    { key: 'viaAerea', label: 'Vía aérea' },
    { key: 'canalizacion', label: 'Canalización' },
    { key: 'empaquetamiento', label: 'Empaquetamiento' },
    { key: 'inmovilizacion', label: 'Inmovilización' },
    { key: 'monitor', label: 'Monitor' },
    { key: 'rcpBasica', label: 'RCP Básica' },
    { key: 'mastPna', label: 'MAST o PNA' },
    { key: 'collarinCervical', label: 'Collarín Cervical' },
    { key: 'desfibrilacion', label: 'Desfibrilación' },
    { key: 'apoyoVent', label: 'Apoyo Vent.' }
  ];

  const prioridades = [
    { value: "rojo", label: "Rojo", color: "#ef4444" },
    { value: "amarillo", label: "Amarillo", color: "#eab308" },
    { value: "verde", label: "Verde", color: "#22c55e" },
    { value: "negro", label: "Negro", color: "#374151" }
  ];

  const opcionesPupilas = [
    { value: "iguales", label: "Iguales" },
    { value: "midriasis", label: "Midriasis" },
    { value: "miosis", label: "Miosis" },
    { value: "anisocoria", label: "Anisocoria" },
    { value: "arreflexia", label: "Arreflexia" }
  ];

  const opcionesColorPiel = [
    { value: "normal", label: "Normal" },
    { value: "cianosis", label: "Cianosis" },
    { value: "marmorea", label: "Marmórea" },
    { value: "palida", label: "Pálida" }
  ];

  const opcionesPiel = [
    { value: "seca", label: "Seca" },
    { value: "humeda", label: "Húmeda" }
  ];

  const opcionesTemperatura = [
    { value: "normal", label: "Normal" },
    { value: "caliente", label: "Caliente" },
    { value: "fria", label: "Fría" }
  ];

  const opcionesInfluencia = [
    { value: "alcohol", label: "Alcohol" },
    { value: "otras-drogas", label: "Otras drogas" },
    { value: "otro", label: "Otro" }
  ];

  const opcionesRuidosCardiacos = [
    { value: "perceptible", label: "Perceptible" },
    { value: "no-perceptible", label: "No perceptible" }
  ];

  const opcionesExpulsionPlacenta = [
    { value: "si", label: "Sí" },
    { value: "no", label: "No" }
  ];

  // Verificar si el paciente es femenino para mostrar sección gineco-obstétrica
  const esPacienteFemenino = patient.sex === 'Femenino';

  // Configurar canvas al montar el componente
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configurar estilo de dibujo
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro Prehospitalario</CardTitle>
        <CardDescription>
          Complete el registro de atención médica prehospitalaria para {patient.firstName} {patient.paternalLastName}
        </CardDescription>
        
        {/* Progress Indicator */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso del Registro</span>
            <span className="text-sm text-muted-foreground">
              {Object.values(tabStatuses).filter(status => status === 'completed').length} / {tabConfigs.length} secciones completadas
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.values(tabStatuses).filter(status => status === 'completed').length / tabConfigs.length) * 100}%` 
              }}
            />
          </div>
          
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-300 rounded-full" />
              <span>Sin llenar</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span>Parcial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Completo</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-2 gap-2">
            <TabsTrigger 
              value="datos-registro" 
              className={getTabTriggerClass('datos-registro')}
            >
              <div className="relative">
                <AlertCircle className="h-4 w-4" />
                {getStatusIcon('datos-registro') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('datos-registro')}
                  </div>
                )}
              </div>
              <span>Datos Registro</span>
            </TabsTrigger>
            <TabsTrigger 
              value="datos-captacion" 
              className={getTabTriggerClass('datos-captacion')}
            >
              <div className="relative">
                <Clock className="h-4 w-4" />
                {getStatusIcon('datos-captacion') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('datos-captacion')}
                  </div>
                )}
              </div>
              <span>Captación</span>
            </TabsTrigger>
            <TabsTrigger 
              value="antecedentes" 
              className={getTabTriggerClass('antecedentes')}
            >
              <div className="relative">
                <FileText className="h-4 w-4" />
                {getStatusIcon('antecedentes') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('antecedentes')}
                  </div>
                )}
              </div>
              <span>Antecedentes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lesiones" 
              className={getTabTriggerClass('lesiones')}
            >
              <div className="relative">
                <Activity className="h-4 w-4" />
                {getStatusIcon('lesiones') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('lesiones')}
                  </div>
                )}
              </div>
              <span>Lesiones</span>
            </TabsTrigger>
            <TabsTrigger 
              value="manejo" 
              className={getTabTriggerClass('manejo')}
            >
              <div className="relative">
                <Heart className="h-4 w-4" />
                {getStatusIcon('manejo') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('manejo')}
                  </div>
                )}
              </div>
              <span>Manejo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="medicamentos" 
              className={getTabTriggerClass('medicamentos')}
            >
              <div className="relative">
                <Pill className="h-4 w-4" />
                {getStatusIcon('medicamentos') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('medicamentos')}
                  </div>
                )}
              </div>
              <span>Medicamentos</span>
            </TabsTrigger>
            {esPacienteFemenino && (
              <TabsTrigger 
                value="gineco-obstetrica" 
                className={getTabTriggerClass('gineco-obstetrica')}
              >
                <div className="relative">
                  <Baby className="h-4 w-4" />
                  {getStatusIcon('gineco-obstetrica') && (
                    <div className="absolute -top-1 -right-1">
                      {getStatusIcon('gineco-obstetrica')}
                    </div>
                  )}
                </div>
                <span>Gineco-obstétrica</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="negativa" 
              className={getTabTriggerClass('negativa')}
            >
              <div className="relative">
                <UserX className="h-4 w-4" />
                {getStatusIcon('negativa') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('negativa')}
                  </div>
                )}
              </div>
              <span>Negativa</span>
            </TabsTrigger>
            <TabsTrigger 
              value="justificacion-prioridad" 
              className={getTabTriggerClass('justificacion-prioridad')}
            >
              <div className="relative">
                <AlertTriangle className="h-4 w-4" />
                {getStatusIcon('justificacion-prioridad') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('justificacion-prioridad')}
                  </div>
                )}
              </div>
              <span>Prioridad</span>
            </TabsTrigger>
            <TabsTrigger 
              value="unidad-medica" 
              className={getTabTriggerClass('unidad-medica')}
            >
              <div className="relative">
                <Building2 className="h-4 w-4" />
                {getStatusIcon('unidad-medica') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('unidad-medica')}
                  </div>
                )}
              </div>
              <span>Unidad Médica</span>
            </TabsTrigger>
            <TabsTrigger 
              value="medico-receptor" 
              className={getTabTriggerClass('medico-receptor')}
            >
              <div className="relative">
                <User className="h-4 w-4" />
                {getStatusIcon('medico-receptor') && (
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon('medico-receptor')}
                  </div>
                )}
              </div>
              <span>Médico Receptor</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Sección 1: Datos del Registro */}
            <TabsContent value="datos-registro" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Datos del Registro
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="convenio">Convenio</Label>
                    <Input
                      id="convenio"
                      {...register('convenio')}
                      placeholder="Convenio"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="episodio">Episodio</Label>
                    <Input
                      id="episodio"
                      {...register('episodio')}
                      placeholder="Número de episodio"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="folio">Folio</Label>
                    <Input
                      id="folio"
                      {...register('folio')}
                      placeholder="Número de folio"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha <span className="text-destructive">*</span></Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="solicitadoPor">Solicitado Por</Label>
                    <Input
                      id="solicitadoPor"
                      {...register('solicitadoPor')}
                      placeholder="Quien solicitó el servicio"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sección 2: Datos de Captación */}
            <TabsContent value="datos-captacion" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Datos de Captación
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horaLlegada">Hora de Llegada</Label>
                    <Input
                      id="horaLlegada"
                      type="time"
                      {...register('horaLlegada')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horaArribo">Hora de Arribo</Label>
                    <Input
                      id="horaArribo"
                      type="time"
                      {...register('horaArribo')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiempoEspera">Tiempo de Espera (min)</Label>
                    <Input
                      id="tiempoEspera"
                      type="number"
                      {...register('tiempoEspera')}
                      placeholder="Minutos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horaTermino">Hora de Término</Label>
                    <Input
                      id="horaTermino"
                      type="time"
                      {...register('horaTermino')}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      {...register('ubicacion')}
                      placeholder="Dirección o ubicación del incidente"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoServicio">Tipo de Servicio</Label>
                    <Select onValueChange={(value) => setValue('tipoServicio', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposServicio.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {tipoServicio === 'otro' && (
                    <div className="space-y-2">
                      <Label htmlFor="otroTipoServicio">Especificar Otro Tipo</Label>
                      <Input
                        id="otroTipoServicio"
                        {...register('otroTipoServicio')}
                        placeholder="Especificar"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="lugarOcurrencia">Lugar de Ocurrencia</Label>
                    <Select onValueChange={(value) => setValue('lugarOcurrencia', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar lugar" />
                      </SelectTrigger>
                      <SelectContent>
                        {lugaresOcurrencia.map((lugar) => (
                          <SelectItem key={lugar.value} value={lugar.value}>
                            {lugar.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sección 3: Antecedentes */}
            <TabsContent value="antecedentes" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Antecedentes
                </h3>
                
                <div className="space-y-6">
                  {/* Antecedentes Patológicos */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3">Antecedentes Patológicos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {patologias.map((patologia) => (
                        <div key={patologia.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={patologia.value}
                            checked={selectedPatologias.includes(patologia.value)}
                            onCheckedChange={(checked) => 
                              handlePatologiaChange(patologia.value, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={patologia.value}
                            className="text-sm font-normal"
                          >
                            {patologia.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    {selectedPatologias.includes('otra') && (
                      <div className="mt-3">
                        <Label htmlFor="otraPatologia">Especificar Otra Patología</Label>
                        <Input
                          id="otraPatologia"
                          {...register('otraPatologia')}
                          placeholder="Especificar"
                        />
                      </div>
                    )}
                  </div>

                  {/* Antecedentes Clínicos */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3">Antecedentes Clínicos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipoAntecedente">Tipo de Antecedente</Label>
                        <Select onValueChange={(value) => setValue('tipoAntecedente', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposAntecedentes.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {tipoAntecedente === 'otro' && (
                        <div className="space-y-2">
                          <Label htmlFor="otroTipoAntecedente">Especificar Otro</Label>
                          <Input
                            id="otroTipoAntecedente"
                            {...register('otroTipoAntecedente')}
                            placeholder="Especificar"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="agenteCasual">Agente Casual</Label>
                        <Input
                          id="agenteCasual"
                          {...register('agenteCasual')}
                          placeholder="Agente causal del incidente"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cinematica">Cinemática</Label>
                        <Textarea
                          id="cinematica"
                          {...register('cinematica')}
                          placeholder="Descripción de la cinemática del trauma"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medidaSeguridad">Medida de Seguridad</Label>
                        <Input
                          id="medidaSeguridad"
                          {...register('medidaSeguridad')}
                          placeholder="Medidas de seguridad utilizadas"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sección 4: Localización de Lesiones */}
            <TabsContent value="lesiones" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Localización de Lesiones
                </h3>
                
                <div className="space-y-4">
                  {/* Selector de tipo de lesión */}
                  <div className="flex flex-wrap gap-2">
                    <Label className="text-sm font-medium">Tipo de lesión:</Label>
                    <Select value={selectedLesionType} onValueChange={setSelectedLesionType}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposLesion.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: tipo.color }}
                              />
                              {tipo.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Leyenda de tipos de lesión */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    {tiposLesion.map((tipo) => (
                      <div key={tipo.value} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tipo.color }}
                        />
                        <span>{tipo.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Botones para cambiar vista */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={activeSide === 'front' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveSide('front')}
                    >
                      Vista Frontal
                    </Button>
                    <Button
                      type="button"
                      variant={activeSide === 'back' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveSide('back')}
                    >
                      Vista Posterior
                    </Button>
                  </div>

                  {/* Diagrama del cuerpo humano */}
                  <div className="relative border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Haga clic en el diagrama para marcar las lesiones
                    </p>
                    <div className="flex justify-center">
                      <svg
                        width="200"
                        height="400"
                        viewBox="0 0 200 400"
                        className="border cursor-crosshair"
                        onClick={handleBodyClick}
                      >
                        {/* Silueta humana básica */}
                        <path
                          d="M100 20 Q90 10 80 20 Q70 30 75 50 L75 80 Q60 90 50 120 L50 200 Q45 210 50 220 L50 300 Q45 310 50 320 L50 380 Q50 390 60 390 Q70 390 70 380 L70 320 Q75 310 80 320 L80 380 Q80 390 90 390 Q100 390 100 380 L100 320 Q105 310 110 320 L110 380 Q110 390 120 390 Q130 390 130 380 L130 320 Q135 310 130 300 L130 220 Q135 210 130 200 L130 120 Q120 90 105 80 L105 50 Q110 30 100 20"
                          fill="none"
                          stroke="#ccc"
                          strokeWidth="2"
                        />
                        
                        {/* Mostrar lesiones marcadas */}
                        {lesiones
                          .filter(lesion => lesion.side === activeSide)
                          .map((lesion) => {
                            const tipo = tiposLesion.find(t => t.value === lesion.type);
                            return (
                              <g key={lesion.id}>
                                <circle
                                  cx={(lesion.x / 100) * 200}
                                  cy={(lesion.y / 100) * 400}
                                  r="6"
                                  fill={tipo?.color || '#000'}
                                  stroke="#fff"
                                  strokeWidth="2"
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeLesion(lesion.id);
                                  }}
                                />
                                <text
                                  x={(lesion.x / 100) * 200}
                                  y={(lesion.y / 100) * 400 + 3}
                                  textAnchor="middle"
                                  className="text-xs fill-white font-bold"
                                >
                                  {lesion.type}
                                </text>
                              </g>
                            );
                          })}
                      </svg>
                    </div>
                  </div>

                  {/* Lista de lesiones marcadas */}
                  {lesiones.length > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">Lesiones Marcadas:</h4>
                      <div className="space-y-2">
                        {lesiones.map((lesion) => {
                          const tipo = tiposLesion.find(t => t.value === lesion.type);
                          return (
                            <div key={lesion.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: tipo?.color }}
                                />
                                <span className="text-sm">
                                  {tipo?.label} - {lesion.side === 'front' ? 'Frontal' : 'Posterior'}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLesion(lesion.id)}
                              >
                                Quitar
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Sección 5: Manejo */}
            <TabsContent value="manejo" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Manejo
                </h3>
                
                <div className="space-y-6">
                  {/* Procedimientos de Manejo */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3">Procedimientos Realizados</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {procedimientosManejo.map((procedimiento) => (
                        <div key={procedimiento.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={procedimiento.key}
                            {...register(procedimiento.key as keyof FormData)}
                          />
                          <Label 
                            htmlFor={procedimiento.key}
                            className="text-sm font-normal"
                          >
                            {procedimiento.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Oxígeno y Otros */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oxigeno">Oxígeno (L/min)</Label>
                      <Input
                        id="oxigeno"
                        type="number"
                        {...register('oxigeno')}
                        placeholder="Litros por minuto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otroManejo">Otro Manejo</Label>
                      <Textarea
                        id="otroManejo"
                        {...register('otroManejo')}
                        placeholder="Describir otros procedimientos realizados"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sección 6: Medicamentos */}
            <TabsContent value="medicamentos" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medicamentos Administrados
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicamentos">
                      Medicamentos, Dosis y Vía de Administración
                    </Label>
                    <Textarea
                      id="medicamentos"
                      {...register('medicamentos')}
                      placeholder="Ejemplo: Epinefrina 1mg IV, Morfina 5mg IM, etc."
                      rows={6}
                      className="font-mono"
                    />
                    <p className="text-sm text-muted-foreground">
                      Incluya nombre del medicamento, dosis, vía de administración y hora de aplicación
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sección 7: Urgencias Gineco-obstétricas */}
            {esPacienteFemenino && (
              <TabsContent value="gineco-obstetrica" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Urgencias Gineco-obstétricas
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Checkboxes principales */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="parto" {...register('parto')} />
                        <Label htmlFor="parto">Parto</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="aborto" {...register('aborto')} />
                        <Label htmlFor="aborto">Aborto</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hxVaginal" {...register('hxVaginal')} />
                        <Label htmlFor="hxVaginal">Hx. Vaginal</Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fechaUltimaMenstruacion">Fecha Última Menstruación</Label>
                        <Input
                          id="fechaUltimaMenstruacion"
                          type="date"
                          {...register('fechaUltimaMenstruacion')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="semanasGestacion">Semanas de Gestación</Label>
                        <Input
                          id="semanasGestacion"
                          type="number"
                          {...register('semanasGestacion')}
                          placeholder="Semanas"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ruidosCardiacosFetales">Ruidos Cardíacos Fetales</Label>
                        <Select onValueChange={(value) => setValue('ruidosCardiacosFetales', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {opcionesRuidosCardiacos.map((opcion) => (
                              <SelectItem key={opcion.value} value={opcion.value}>
                                {opcion.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expulsionPlacenta">Expulsión de Placenta</Label>
                        <Select onValueChange={(value) => setValue('expulsionPlacenta', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {opcionesExpulsionPlacenta.map((opcion) => (
                              <SelectItem key={opcion.value} value={opcion.value}>
                                {opcion.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="horaExpulsionPlacenta">Hora Expulsión Placenta</Label>
                        <Input
                          id="horaExpulsionPlacenta"
                          type="time"
                          {...register('horaExpulsionPlacenta')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gesta">Gesta</Label>
                        <Input
                          id="gesta"
                          type="number"
                          {...register('gesta')}
                          placeholder="G"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partos">Partos</Label>
                        <Input
                          id="partos"
                          type="number"
                          {...register('partos')}
                          placeholder="P"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cesareas">Cesáreas</Label>
                        <Input
                          id="cesareas"
                          type="number"
                          {...register('cesareas')}
                          placeholder="C"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="abortos">Abortos</Label>
                        <Input
                          id="abortos"
                          type="number"
                          {...register('abortos')}
                          placeholder="A"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="metodosAnticonceptivos">Métodos Anticonceptivos</Label>
                        <Input
                          id="metodosAnticonceptivos"
                          {...register('metodosAnticonceptivos')}
                          placeholder="Métodos anticonceptivos utilizados"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Sección 8: Negativa de Atención */}
            <TabsContent value="negativa" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <UserX className="h-5 w-5" />
                  Negativa de Atención
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="negativaAtencion" 
                      {...register('negativaAtencion')}
                    />
                    <Label htmlFor="negativaAtencion" className="font-medium">
                      El paciente se niega a recibir atención médica
                    </Label>
                  </div>

                  {negativaAtencion && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-4">
                        <strong>Importante:</strong> Si el paciente se niega a recibir atención, 
                        se requieren las firmas correspondientes.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firmaPaciente">Firma del Paciente</Label>
                          <Input
                            id="firmaPaciente"
                            {...register('firmaPaciente')}
                            placeholder="Nombre y firma del paciente"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="firmaTestigo">Firma del Testigo</Label>
                          <Input
                            id="firmaTestigo"
                            {...register('firmaTestigo')}
                            placeholder="Nombre y firma del testigo"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Sección 9: Justificación de Prioridad */}
            <TabsContent value="justificacion-prioridad" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Justificación de Prioridad
                </h3>
                
                <div className="space-y-6">
                  {/* Prioridad */}
                  <div className="space-y-2">
                    <Label>Prioridad</Label>
                    <RadioGroup 
                      onValueChange={(value) => setValue('prioridad', value)}
                      className="flex flex-wrap gap-4"
                    >
                      {prioridades.map((prioridad) => (
                        <div key={prioridad.value} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={prioridad.value} 
                            id={prioridad.value}
                          />
                          <Label 
                            htmlFor={prioridad.value}
                            className="flex items-center gap-2"
                          >
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: prioridad.color }}
                            />
                            {prioridad.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Evaluación física */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pupilas">Pupilas</Label>
                      <Select onValueChange={(value) => setValue('pupilas', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesPupilas.map((opcion) => (
                            <SelectItem key={opcion.value} value={opcion.value}>
                              {opcion.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="colorPiel">Color de Piel</Label>
                      <Select onValueChange={(value) => setValue('colorPiel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesColorPiel.map((opcion) => (
                            <SelectItem key={opcion.value} value={opcion.value}>
                              {opcion.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="piel">Piel</Label>
                      <Select onValueChange={(value) => setValue('piel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesPiel.map((opcion) => (
                            <SelectItem key={opcion.value} value={opcion.value}>
                              {opcion.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="temperatura">Temperatura</Label>
                      <Select onValueChange={(value) => setValue('temperatura', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesTemperatura.map((opcion) => (
                            <SelectItem key={opcion.value} value={opcion.value}>
                              {opcion.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Influenciado por */}
                  <div className="space-y-3">
                    <Label>Influenciado por:</Label>
                    <div className="flex flex-wrap gap-4">
                      {opcionesInfluencia.map((opcion) => (
                        <div key={opcion.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={opcion.value}
                            checked={selectedInfluencias.includes(opcion.value)}
                            onCheckedChange={(checked) => 
                              handleInfluenciaChange(opcion.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={opcion.value} className="text-sm">
                            {opcion.label}
                          </Label>
                        </div>
                      ))}
                    </div>

                    {selectedInfluencias.includes('otro') && (
                      <div className="space-y-2">
                        <Label htmlFor="otroInfluencia">Especificar Otro</Label>
                        <Input
                          id="otroInfluencia"
                          {...register('otroInfluencia')}
                          placeholder="Especificar"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sección 10: Unidad Médica que Recibe */}
            <TabsContent value="unidad-medica" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Unidad Médica que Recibe
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lugarOrigen">Lugar de Origen</Label>
                      <Input
                        id="lugarOrigen"
                        {...register('lugarOrigen')}
                        placeholder="Lugar de origen del paciente"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lugarConsulta">Lugar de Consulta</Label>
                      <Input
                        id="lugarConsulta"
                        {...register('lugarConsulta')}
                        placeholder="Lugar de consulta inicial"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lugarDestino">Lugar de Destino</Label>
                      <Input
                        id="lugarDestino"
                        {...register('lugarDestino')}
                        placeholder="Hospital o centro médico de destino"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3">Información de la Ambulancia</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ambulanciaNumero">Número de Ambulancia</Label>
                        <Input
                          id="ambulanciaNumero"
                          {...register('ambulanciaNumero')}
                          placeholder="Número de unidad"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ambulanciaPlacas">Placas de Ambulancia</Label>
                        <Input
                          id="ambulanciaPlacas"
                          {...register('ambulanciaPlacas')}
                          placeholder="Placas del vehículo"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3">Personal de Atención</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="personal">Personal Paramédico</Label>
                        <Textarea
                          id="personal"
                          {...register('personal')}
                          placeholder="Nombres del personal paramédico que atendió"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="doctor">Doctor Responsable</Label>
                        <Input
                          id="doctor"
                          {...register('doctor')}
                          placeholder="Nombre del doctor responsable"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sección 11: Médico Receptor */}
            <TabsContent value="medico-receptor" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Médico Receptor
                </h3>
                
                <div className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      Información del médico que recibe al paciente en el hospital o centro médico de destino.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="medicoReceptorNombre">
                          Nombre del Médico Receptor <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="medicoReceptorNombre"
                          {...register('medicoReceptorNombre', { 
                            required: 'El nombre del médico receptor es requerido' 
                          })}
                          placeholder="Dr(a). Nombre completo"
                          className={errors.medicoReceptorNombre ? 'border-destructive' : ''}
                        />
                        {errors.medicoReceptorNombre && (
                          <p className="text-sm text-destructive">{errors.medicoReceptorNombre.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="horaEntrega">
                          Hora de Entrega <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="horaEntrega"
                          type="time"
                          {...register('horaEntrega', { 
                            required: 'La hora de entrega es requerida' 
                          })}
                          className={errors.horaEntrega ? 'border-destructive' : ''}
                        />
                        {errors.horaEntrega && (
                          <p className="text-sm text-destructive">{errors.horaEntrega.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor="medicoReceptorFirma">
                        Firma del Médico Receptor <span className="text-destructive">*</span>
                      </Label>
                      <div className="border rounded p-2">
                        <canvas
                          ref={canvasRef}
                          width="400"
                          height="150"
                          className="border rounded cursor-crosshair w-full max-w-md mx-auto"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={endDrawing}
                          onMouseOut={endDrawing}
                        />
                        <div className="flex justify-between mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearCanvas}
                          >
                            <Eraser className="h-4 w-4 mr-2" />
                            Limpiar
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={downloadSignature}
                              disabled={!firmaDataURL}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={uploadSignature}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Cargar
                            </Button>
                          </div>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                      {errors.medicoReceptorFirma && (
                        <p className="text-sm text-destructive">{errors.medicoReceptorFirma.message}</p>
                      )}
                    </div>

                    {/* Resumen de entrega */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Resumen de Entrega</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                        <span><strong>Paciente:</strong> {patient.firstName} {patient.paternalLastName}</span>
                        <span><strong>Sexo:</strong> {patient.sex}</span>
                        <span><strong>Fecha de Entrega:</strong> {new Date().toLocaleDateString()}</span>
                        <span><strong>Hora de Entrega:</strong> {watch('horaEntrega') || 'No especificada'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={saveProgress}
                  disabled={isSavingProgress}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingProgress ? 'Guardando...' : 'Guardar Progreso'}
                </Button>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Registro Completo'}
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
} 