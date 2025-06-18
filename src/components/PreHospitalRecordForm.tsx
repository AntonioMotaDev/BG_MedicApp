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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePdfGenerator } from '@/hooks/usePdfGenerator';

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
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generatePdf } = usePdfGenerator();

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
      fecha: '', // Cambiar para que no se inicialice con fecha automática
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

    // Para la sección gineco-obstétrica, verificar si aplica al paciente
    if (tabId === 'gineco-obstetrica' && patient.sex !== 'Femenino') {
      return 'completed'; // Auto-completar si no aplica
    }

    // Check required fields
    const requiredFilled = config.requiredFields.every(field => {
      const value = formData[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });

    // Check optional fields - corregir la lógica para booleanos
    const optionalFilled = config.optionalFields.some(field => {
      const value = formData[field];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') {
        // Para booleanos, solo considerar como "lleno" si es true
        return value === true;
      }
      return value !== null && value !== undefined && value !== '';
    });

    if (requiredFilled) return 'completed';
    if (optionalFilled) return 'partial';
    return 'empty';
  };

  // Update tab statuses when form data changes
  useEffect(() => {
    const subscription = watch((formData) => {
      const newStatuses: Record<string, TabStatus> = {};
      tabConfigs.forEach(config => {
        newStatuses[config.id] = calculateTabStatus(config.id, formData);
      });
      setTabStatuses(newStatuses);
    });
    return () => subscription.unsubscribe();
  }, [watch, tabConfigs]);

  // Synchronize form state with local arrays
  useEffect(() => {
    setValue('antecedentesPatologicos', selectedPatologias);
  }, [selectedPatologias, setValue]);

  useEffect(() => {
    setValue('lesiones', lesiones);
  }, [lesiones, setValue]);

  useEffect(() => {
    setValue('influenciadoPor', selectedInfluencias);
  }, [selectedInfluencias, setValue]);

  useEffect(() => {
    setValue('medicoReceptorFirma', firmaDataURL);
  }, [firmaDataURL, setValue]);

  // Get tab trigger class based on status
  const getTabTriggerClass = (tabId: string): string => {
    const status = tabStatuses[tabId] || 'empty';
    const baseClasses = "flex flex-col items-center gap-2 p-3 h-auto text-xs transition-all duration-200 rounded-lg border-2 min-h-[80px] justify-center";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-50 text-green-700 border-green-200 hover:bg-green-100 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 shadow-sm`;
      case 'partial':
        return `${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800 data-[state=active]:border-yellow-300 shadow-sm`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-300 shadow-sm`;
    }
  };

  // Get status icon
  const getStatusIcon = (tabId: string): JSX.Element | null => {
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

      // Calcular total de secciones considerando el género del paciente
      const totalSections = esPacienteFemenino ? tabConfigs.length : tabConfigs.length - 1;

      const recordData = {
        ...(recordId && { id: recordId }),
        patientId: patient.id || '',
        ...formData,
        // Asegurar que se incluyan todos los arrays y datos adicionales
        antecedentesPatologicos: selectedPatologias,
        lesiones,
        influenciadoPor: selectedInfluencias,
        medicoReceptorFirma: firmaDataURL,
        completedSections,
        totalSections,
        status: completedSections.length === 0 ? 'draft' : 
                completedSections.length < totalSections ? 'partial' : 'completed'
      };

      console.log('Guardando progreso - Datos completos:', recordData);

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
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Asegurar que el contexto esté configurado
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
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

  const saveSignatureFromModal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Verificar si hay algo dibujado en el canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some((pixel, index) => {
      // Solo verificar el canal alpha (transparencia)
      return index % 4 === 3 && pixel !== 0;
    });
    
    if (!hasContent) {
      toast.error('Por favor, dibuje una firma antes de guardar');
      return;
    }
    
    const dataURL = canvas.toDataURL('image/png');
    setFirmaDataURL(dataURL);
    setValue('medicoReceptorFirma', dataURL);
    setIsSignatureModalOpen(false);
    toast.success('Firma guardada exitosamente');
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
      // Compilar todos los datos del formulario incluyendo arrays y estados
      const completedSections = Object.entries(tabStatuses)
        .filter(([_, status]) => status === 'completed')
        .map(([tabId, _]) => tabId);

      // Calcular total de secciones considerando el género del paciente
      const totalSections = esPacienteFemenino ? tabConfigs.length : tabConfigs.length - 1;

      const recordData = {
        ...(recordId && { id: recordId }),
        patientId: patient.id || '',
        ...data,
        // Asegurar que se incluyan todos los arrays y datos adicionales
        antecedentesPatologicos: selectedPatologias,
        lesiones: lesiones,
        influenciadoPor: selectedInfluencias,
        medicoReceptorFirma: firmaDataURL,
        completedSections,
        totalSections,
        status: 'completed' // Al hacer submit final, marcamos como completado
      };

      console.log('Datos completos del registro prehospitalario:', recordData);
      
      // Guardar el registro usando la función del backend
      const savedRecordId = await savePreHospitalRecord(recordData);
      setRecordId(savedRecordId);
      
      toast.success('Registro prehospitalario guardado exitosamente');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error al guardar el registro:', error);
      toast.error('Error al guardar el registro prehospitalario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateFrapPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const formData = getValues();
      
      // Crear el objeto record con la estructura esperada
      const record = {
        id: recordId || Date.now().toString(),
        patientName: `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName}`.trim(),
        patient: {
          age: patient.age,
          sex: patient.sex,
          phone: patient.phone,
          responsiblePerson: patient.responsiblePerson,
          emergencyContact: patient.emergencyContact,
          street: patient.street,
          exteriorNumber: patient.exteriorNumber,
          interiorNumber: patient.interiorNumber,
          neighborhood: patient.neighborhood,
          city: patient.city,
          insurance: patient.insurance,
        },
        createdAt: new Date().toISOString(),
        status: 'draft',
        ...formData,
        antecedentesPatologicos: selectedPatologias,
        lesiones: lesiones,
        influenciadoPor: selectedInfluencias,
        medicoReceptorFirma: firmaDataURL,
      };

      await generatePdf(record);
      toast.success('PDF FRAP generado exitosamente');
    } catch (error) {
      console.error('Error generating FRAP PDF:', error);
      toast.error('Error al generar el PDF FRAP');
    } finally {
      setIsGeneratingPdf(false);
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

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Si hay una firma guardada, mostrarla
    if (firmaDataURL) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = firmaDataURL;
    }
  }, [firmaDataURL]);

  // Configurar canvas cuando se abre el modal
  useEffect(() => {
    if (isSignatureModalOpen) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Configurar estilo de dibujo
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Si hay una firma guardada, mostrarla
        if (firmaDataURL) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = firmaDataURL;
        }
      }, 100); // Pequeño delay para asegurar que el modal esté completamente renderizado
      
      return () => clearTimeout(timer);
    }
  }, [isSignatureModalOpen, firmaDataURL]);

  return (
    <div className="w-full max-w-full">
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl">Registro Prehospitalario</CardTitle>
          <CardDescription>
            Complete el registro de atención médica prehospitalaria para {patient.firstName} {patient.paternalLastName}
          </CardDescription>
          
          {/* Progress Indicator */}
          <div className="mt-4 p-4 bg-background rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso del Registro</span>
              <span className="text-sm text-muted-foreground">
                {Object.values(tabStatuses).filter(status => status === 'completed').length} / {esPacienteFemenino ? tabConfigs.length : tabConfigs.length - 1} secciones completadas
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.values(tabStatuses).filter(status => status === 'completed').length / (esPacienteFemenino ? tabConfigs.length : tabConfigs.length - 1)) * 100}%` 
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
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b bg-muted/10">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 h-auto p-3 gap-1 bg-transparent w-full overflow-x-auto">
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
                  <span className="text-xs font-medium">Datos Registro</span>
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
                  <span className="text-xs font-medium">Captación</span>
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
                  <span className="text-xs font-medium">Antecedentes</span>
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
                  <span className="text-xs font-medium">Lesiones</span>
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
                  <span className="text-xs font-medium">Manejo</span>
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
                  <span className="text-xs font-medium">Medicamentos</span>
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
                    <span className="text-xs font-medium">Gineco-obstétrica</span>
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
                  <span className="text-xs font-medium">Negativa</span>
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
                  <span className="text-xs font-medium">Prioridad</span>
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
                  <span className="text-xs font-medium">Unidad Médica</span>
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
                  <span className="text-xs font-medium">Médico Receptor</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Sección 1: Datos del Registro */}
                <TabsContent value="datos-registro" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Datos del Registro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          placeholder="Episodio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="folio">Folio</Label>
                        <Input
                          id="folio"
                          {...register('folio')}
                          placeholder="Folio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha *</Label>
                        <Input
                          id="fecha"
                          type="date"
                          {...register('fecha', { required: 'Este campo es requerido' })}
                          onFocus={(e) => {
                            // Si el campo está vacío, poner la fecha actual
                            if (!e.target.value) {
                              const today = new Date().toISOString().split('T')[0];
                              setValue('fecha', today);
                            }
                          }}
                        />
                        {errors.fecha && (
                          <p className="text-sm text-destructive">{errors.fecha.message}</p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="solicitadoPor">Solicitado por</Label>
                        <Input
                          id="solicitadoPor"
                          {...register('solicitadoPor')}
                          placeholder="Solicitado por"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Sección 2: Datos de Captación */}
                <TabsContent value="datos-captacion" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Datos de Captación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="horaLlegada">Hora de llegada</Label>
                        <Input
                          id="horaLlegada"
                          type="time"
                          {...register('horaLlegada')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horaArribo">Hora de arribo</Label>
                        <Input
                          id="horaArribo"
                          type="time"
                          {...register('horaArribo')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tiempoEspera">Tiempo de espera</Label>
                        <Input
                          id="tiempoEspera"
                          {...register('tiempoEspera')}
                          placeholder="Tiempo de espera"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horaTermino">Hora de término</Label>
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
                          placeholder="Ubicación"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipoServicio">Tipo de servicio</Label>
                        <Select onValueChange={(value) => setValue('tipoServicio', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo de servicio" />
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
                          <Label htmlFor="otroTipoServicio">Especifique otro tipo</Label>
                          <Input
                            id="otroTipoServicio"
                            {...register('otroTipoServicio')}
                            placeholder="Especifique otro tipo de servicio"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="lugarOcurrencia">Lugar de ocurrencia</Label>
                        <Select onValueChange={(value) => setValue('lugarOcurrencia', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione lugar" />
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
                <TabsContent value="antecedentes" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Antecedentes
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Antecedentes patológicos */}
                      <div>
                        <h4 className="font-medium mb-3">Antecedentes patológicos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                className="text-sm font-normal cursor-pointer"
                              >
                                {patologia.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {selectedPatologias.includes('otra') && (
                          <div className="mt-4">
                            <Label htmlFor="otraPatologia">Especifique otra patología</Label>
                            <Input
                              id="otraPatologia"
                              {...register('otraPatologia')}
                              placeholder="Especifique otra patología"
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>

                      {/* Antecedentes clínicos */}
                      <div>
                        <h4 className="font-medium mb-3">Antecedentes clínicos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="tipoAntecedente">Tipo de antecedente</Label>
                            <Select onValueChange={(value) => setValue('tipoAntecedente', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione tipo" />
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
                              <Label htmlFor="otroTipoAntecedente">Especifique otro tipo</Label>
                              <Input
                                id="otroTipoAntecedente"
                                {...register('otroTipoAntecedente')}
                                placeholder="Especifique otro tipo de antecedente"
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="agenteCasual">Agente casual</Label>
                            <Input
                              id="agenteCasual"
                              {...register('agenteCasual')}
                              placeholder="Agente casual"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cinematica">Cinemática</Label>
                            <Input
                              id="cinematica"
                              {...register('cinematica')}
                              placeholder="Cinemática"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="medidaSeguridad">Medida de seguridad</Label>
                            <Input
                              id="medidaSeguridad"
                              {...register('medidaSeguridad')}
                              placeholder="Medida de seguridad"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Sección 4: Localización de Lesiones */}
                <TabsContent value="lesiones" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Localización de Lesiones
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Tipo de lesión</Label>
                          <RadioGroup
                            value={selectedLesionType}
                            onValueChange={setSelectedLesionType}
                            className="grid grid-cols-2 gap-2 mt-2"
                          >
                            {tiposLesion.map((tipo) => (
                              <div key={tipo.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={tipo.value} id={tipo.value} />
                                <Label 
                                  htmlFor={tipo.value}
                                  className="text-sm cursor-pointer"
                                  style={{ color: tipo.color }}
                                >
                                  {tipo.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Vista del cuerpo</Label>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              variant={activeSide === 'front' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActiveSide('front')}
                            >
                              Frontal
                            </Button>
                            <Button
                              type="button"
                              variant={activeSide === 'back' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActiveSide('back')}
                            >
                              Posterior
                            </Button>
                          </div>
                        </div>

                        {lesiones.length > 0 && (
                          <div>
                            <Label className="text-base font-medium">Lesiones marcadas</Label>
                            <div className="mt-2 space-y-2">
                              {lesiones.map((lesion) => {
                                const tipoInfo = tiposLesion.find(t => t.value === lesion.type);
                                return (
                                  <div key={lesion.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">
                                      {tipoInfo?.label} - {lesion.side === 'front' ? 'Frontal' : 'Posterior'}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeLesion(lesion.id)}
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <svg
                          width="200"
                          height="400"
                          viewBox="0 0 200 400"
                          className="border cursor-crosshair"
                          onClick={handleBodyClick}
                        >
                          {/* Silueta humana más detallada */}
                          {activeSide === 'front' ? (
                            // Vista frontal
                            <g>
                              {/* Cabeza */}
                              <ellipse cx="100" cy="30" rx="25" ry="30" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Cuello */}
                              <rect x="92" y="55" width="16" height="15" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Torso */}
                              <ellipse cx="100" cy="120" rx="45" ry="50" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Brazos */}
                              <ellipse cx="60" cy="100" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="140" cy="100" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Antebrazos */}
                              <ellipse cx="45" cy="160" rx="10" ry="35" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="155" cy="160" rx="10" ry="35" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Manos */}
                              <ellipse cx="40" cy="200" rx="8" ry="15" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="160" cy="200" rx="8" ry="15" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Pelvis */}
                              <ellipse cx="100" cy="180" rx="35" ry="20" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Muslos */}
                              <ellipse cx="85" cy="240" rx="15" ry="45" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="115" cy="240" rx="15" ry="45" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Pantorrillas */}
                              <ellipse cx="80" cy="310" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="120" cy="310" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Pies */}
                              <ellipse cx="75" cy="365" rx="15" ry="10" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="125" cy="365" rx="15" ry="10" fill="none" stroke="#666" strokeWidth="2"/>
                            </g>
                          ) : (
                            // Vista posterior
                            <g>
                              {/* Cabeza */}
                              <ellipse cx="100" cy="30" rx="25" ry="30" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Cuello */}
                              <rect x="92" y="55" width="16" height="15" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Torso posterior */}
                              <ellipse cx="100" cy="120" rx="45" ry="50" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Brazos posteriores */}
                              <ellipse cx="60" cy="100" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="140" cy="100" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Antebrazos posteriores */}
                              <ellipse cx="45" cy="160" rx="10" ry="35" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="155" cy="160" rx="10" ry="35" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Manos posteriores */}
                              <ellipse cx="40" cy="200" rx="8" ry="15" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="160" cy="200" rx="8" ry="15" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Pelvis posterior */}
                              <ellipse cx="100" cy="180" rx="35" ry="20" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Muslos posteriores */}
                              <ellipse cx="85" cy="240" rx="15" ry="45" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="115" cy="240" rx="15" ry="45" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Pantorrillas posteriores */}
                              <ellipse cx="80" cy="310" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="120" cy="310" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Pies posteriores */}
                              <ellipse cx="75" cy="365" rx="15" ry="10" fill="none" stroke="#666" strokeWidth="2"/>
                              <ellipse cx="125" cy="365" rx="15" ry="10" fill="none" stroke="#666" strokeWidth="2"/>
                              {/* Línea de la espalda */}
                              <line x1="100" y1="70" x2="100" y2="170" stroke="#666" strokeWidth="1"/>
                            </g>
                          )}

                          {/* Lesiones marcadas */}
                          {lesiones
                            .filter(lesion => lesion.side === activeSide)
                            .map((lesion) => {
                              const tipoInfo = tiposLesion.find(t => t.value === lesion.type);
                              return (
                                <circle
                                  key={lesion.id}
                                  cx={lesion.x * 2}
                                  cy={lesion.y * 4}
                                  r="6"
                                  fill={tipoInfo?.color || '#000'}
                                  stroke="#fff"
                                  strokeWidth="2"
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeLesion(lesion.id);
                                  }}
                                />
                              );
                            })}
                        </svg>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Sección 5: Manejo */}
                <TabsContent value="manejo" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Manejo
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Procedimientos realizados</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {procedimientosManejo.map((procedimiento) => (
                            <div key={procedimiento.key} className="flex items-center space-x-2">
                              <Checkbox
                                id={procedimiento.key}
                                {...register(procedimiento.key as any)}
                              />
                              <Label 
                                htmlFor={procedimiento.key}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {procedimiento.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="oxigeno">Oxígeno (L/min)</Label>
                          <Input
                            id="oxigeno"
                            {...register('oxigeno')}
                            placeholder="Litros por minuto"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="otroManejo">Otro manejo</Label>
                          <Input
                            id="otroManejo"
                            {...register('otroManejo')}
                            placeholder="Especifique otro manejo"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Sección 6: Medicamentos */}
                <TabsContent value="medicamentos" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Medicamentos
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="medicamentos">Medicamentos administrados</Label>
                      <Textarea
                        id="medicamentos"
                        {...register('medicamentos')}
                        placeholder="Describa los medicamentos administrados, dosis y vía de administración"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Sección 7: Urgencias Gineco-obstétricas */}
                {esPacienteFemenino && (
                  <TabsContent value="gineco-obstetrica" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <Baby className="h-5 w-5" />
                        Urgencias Gineco-obstétricas
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">Condiciones</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="parto"
                                {...register('parto')}
                              />
                              <Label htmlFor="parto" className="text-sm font-normal cursor-pointer">
                                Parto
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="aborto"
                                {...register('aborto')}
                              />
                              <Label htmlFor="aborto" className="text-sm font-normal cursor-pointer">
                                Aborto
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hxVaginal"
                                {...register('hxVaginal')}
                              />
                              <Label htmlFor="hxVaginal" className="text-sm font-normal cursor-pointer">
                                Hx. Vaginal
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="fechaUltimaMenstruacion">Fecha última menstruación</Label>
                            <Input
                              id="fechaUltimaMenstruacion"
                              type="date"
                              {...register('fechaUltimaMenstruacion')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="semanasGestacion">Semanas de gestación</Label>
                            <Input
                              id="semanasGestacion"
                              {...register('semanasGestacion')}
                              placeholder="Semanas"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ruidosCardiacosFetales">Ruidos cardíacos fetales</Label>
                            <Select onValueChange={(value) => setValue('ruidosCardiacosFetales', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
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
                            <Label htmlFor="expulsionPlacenta">Expulsión placenta</Label>
                            <Select onValueChange={(value) => setValue('expulsionPlacenta', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
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
                            <Label htmlFor="horaExpulsionPlacenta">Hora expulsión placenta</Label>
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
                              {...register('gesta')}
                              placeholder="Gesta"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="partos">Partos</Label>
                            <Input
                              id="partos"
                              {...register('partos')}
                              placeholder="Partos"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cesareas">Cesáreas</Label>
                            <Input
                              id="cesareas"
                              {...register('cesareas')}
                              placeholder="Cesáreas"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="abortos">Abortos</Label>
                            <Input
                              id="abortos"
                              {...register('abortos')}
                              placeholder="Abortos"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2 lg:col-span-3">
                            <Label htmlFor="metodosAnticonceptivos">Métodos anticonceptivos</Label>
                            <Input
                              id="metodosAnticonceptivos"
                              {...register('metodosAnticonceptivos')}
                              placeholder="Métodos anticonceptivos"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Sección 8: Negativa de Atención */}
                <TabsContent value="negativa" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <UserX className="h-5 w-5" />
                      Negativa de Atención
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="negativaAtencion"
                          {...register('negativaAtencion')}
                        />
                        <Label htmlFor="negativaAtencion" className="text-sm font-normal cursor-pointer">
                          El paciente se niega a recibir atención médica
                        </Label>
                      </div>

                      {negativaAtencion && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="firmaPaciente">Firma del paciente</Label>
                            <Input
                              id="firmaPaciente"
                              {...register('firmaPaciente')}
                              placeholder="Nombre del paciente que firma"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="firmaTestigo">Firma del testigo</Label>
                            <Input
                              id="firmaTestigo"
                              {...register('firmaTestigo')}
                              placeholder="Nombre del testigo que firma"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Sección 9: Justificación de Prioridad */}
                <TabsContent value="justificacion-prioridad" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Justificación de Prioridad
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-medium">Prioridad</Label>
                        <RadioGroup
                          onValueChange={(value) => setValue('prioridad', value)}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
                        >
                          {prioridades.map((prioridad) => (
                            <div key={prioridad.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={prioridad.value} id={prioridad.value} />
                              <Label 
                                htmlFor={prioridad.value}
                                className="text-sm cursor-pointer flex items-center gap-2"
                              >
                                <div 
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: prioridad.color }}
                                />
                                {prioridad.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="pupilas">Pupilas</Label>
                          <Select onValueChange={(value) => setValue('pupilas', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
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
                          <Label htmlFor="colorPiel">Color de piel</Label>
                          <Select onValueChange={(value) => setValue('colorPiel', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
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
                              <SelectValue placeholder="Seleccione" />
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
                              <SelectValue placeholder="Seleccione" />
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

                      <div>
                        <h4 className="font-medium mb-3">Influenciado por</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {opcionesInfluencia.map((influencia) => (
                            <div key={influencia.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={influencia.value}
                                checked={selectedInfluencias.includes(influencia.value)}
                                onCheckedChange={(checked) => 
                                  handleInfluenciaChange(influencia.value, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={influencia.value}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {influencia.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {selectedInfluencias.includes('otro') && (
                          <div className="mt-4">
                            <Label htmlFor="otroInfluencia">Especifique otra influencia</Label>
                            <Input
                              id="otroInfluencia"
                              {...register('otroInfluencia')}
                              placeholder="Especifique otra influencia"
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Sección 10: Unidad Médica que Recibe */}
                <TabsContent value="unidad-medica" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Unidad Médica que Recibe
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="lugarOrigen">Lugar de origen</Label>
                        <Input
                          id="lugarOrigen"
                          {...register('lugarOrigen')}
                          placeholder="Lugar de origen"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lugarConsulta">Lugar de consulta</Label>
                        <Input
                          id="lugarConsulta"
                          {...register('lugarConsulta')}
                          placeholder="Lugar de consulta"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lugarDestino">Lugar de destino</Label>
                        <Input
                          id="lugarDestino"
                          {...register('lugarDestino')}
                          placeholder="Lugar de destino"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ambulanciaNumero">Ambulancia número</Label>
                        <Input
                          id="ambulanciaNumero"
                          {...register('ambulanciaNumero')}
                          placeholder="Número de ambulancia"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ambulanciaPlacas">Placas de ambulancia</Label>
                        <Input
                          id="ambulanciaPlacas"
                          {...register('ambulanciaPlacas')}
                          placeholder="Placas de ambulancia"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="personal">Personal</Label>
                        <Input
                          id="personal"
                          {...register('personal')}
                          placeholder="Personal"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="doctor">Doctor</Label>
                        <Input
                          id="doctor"
                          {...register('doctor')}
                          placeholder="Doctor"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Sección 11: Médico Receptor */}
                <TabsContent value="medico-receptor" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Médico Receptor
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="medicoReceptorNombre">Nombre del médico receptor *</Label>
                        <Input
                          id="medicoReceptorNombre"
                          {...register('medicoReceptorNombre', { required: 'Este campo es requerido' })}
                          placeholder="Nombre completo del médico"
                        />
                        {errors.medicoReceptorNombre && (
                          <p className="text-sm text-destructive">{errors.medicoReceptorNombre.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horaEntrega">Hora de entrega *</Label>
                        <Input
                          id="horaEntrega"
                          type="time"
                          {...register('horaEntrega', { required: 'Este campo es requerido' })}
                        />
                        {errors.horaEntrega && (
                          <p className="text-sm text-destructive">{errors.horaEntrega.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label>Firma del médico receptor</Label>
                        {firmaDataURL ? (
                          <div className="space-y-4">
                            <div className="border rounded-lg p-4 bg-white">
                              <img 
                                src={firmaDataURL} 
                                alt="Firma del médico" 
                                className="max-h-32 mx-auto"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSignatureModalOpen(true)}
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                Modificar Firma
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={downloadSignature}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFirmaDataURL('');
                                  setValue('medicoReceptorFirma', '');
                                }}
                              >
                                <Eraser className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsSignatureModalOpen(true)}
                            className="w-full h-24 border-dashed"
                          >
                            <PenTool className="h-6 w-6 mr-2" />
                            Firmar
                          </Button>
                        )}
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
                      variant="outline" 
                      onClick={generateFrapPdf}
                      disabled={isGeneratingPdf}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {isGeneratingPdf ? 'Generando PDF...' : 'PDF FRAP'}
                    </Button>
                    
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
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Modal para firma digital */}
      <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Firma del Médico Receptor</DialogTitle>
            <DialogDescription>
              Dibuje la firma del médico receptor en el área a continuación
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-white">
              <canvas
                ref={canvasRef}
                width="500"
                height="200"
                className="border rounded-lg cursor-crosshair w-full bg-white touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseOut={endDrawing}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent("mousedown", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  startDrawing(mouseEvent as any);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent("mousemove", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  draw(mouseEvent as any);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  endDrawing();
                }}
              />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Use el mouse para dibujar la firma en el área anterior
              </p>
            </div>
            
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Función de prueba para verificar que el canvas funciona
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(10, 10);
                    ctx.lineTo(100, 100);
                    ctx.stroke();
                    toast.success('Línea de prueba dibujada');
                  }}
                >
                  Probar Canvas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={uploadSignature}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Imagen
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSignatureModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={saveSignatureFromModal}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Firma
                </Button>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 