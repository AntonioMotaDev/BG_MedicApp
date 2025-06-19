import { z } from 'zod';

export const patientSchema = z.object({
  id: z.string().optional(),
  paternalLastName: z.string().min(1, "El apellido paterno es requerido"),
  maternalLastName: z.string().min(1, "El apellido materno es requerido"),
  firstName: z.string().min(1, "El nombre es requerido"),
  age: z.number().min(0, "La edad debe ser un número positivo").optional(), // Made optional as dateOfBirth is primary
  dateOfBirth: z.date().optional(),
  sex: z.enum(["Masculino", "Femenino", "Sin definir"], {
    required_error: "El sexo es requerido",
  }),
  street: z.string().min(1, "La calle es requerida"),
  exteriorNumber: z.string().min(1, "El número exterior es requerido"),
  interiorNumber: z.string().optional(),
  neighborhood: z.string().min(1, "La colonia es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  insurance: z.string().optional(),
  responsiblePerson: z.string().min(1, "La persona responsable es requerida"),
  emergencyContact: z.string().optional(),
  pickupTimestamp: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Patient = z.infer<typeof patientSchema>;

export const PatientFormSchema = patientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type PatientFormData = z.infer<typeof PatientFormSchema>;

// Login Schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

// User Role Schema
export const UserRoleSchema = z.enum(['user', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  role: UserRoleSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Register Schema
export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

// Pre-Hospital Record Schema
export const preHospitalRecordSchema = z.object({
  id: z.string().optional(),
  patientId: z.string(),
  
  // Datos del registro
  convenio: z.string().optional(),
  episodio: z.string().optional(),
  folio: z.string().optional(),
  fecha: z.string(),
  solicitadoPor: z.string().optional(),
  
  // Datos de captación
  horaLlegada: z.string().optional(),
  horaArribo: z.string().optional(),
  tiempoEspera: z.string().optional(),
  horaTermino: z.string().optional(),
  ubicacion: z.string().optional(),
  tipoServicio: z.string().optional(),
  otroTipoServicio: z.string().optional(),
  lugarOcurrencia: z.string().optional(),
  
  // Antecedentes patológicos
  antecedentesPatologicos: z.array(z.string()).optional(),
  otraPatologia: z.string().optional(),
  
  // Antecedentes clínicos
  tipoAntecedente: z.string().optional(),
  otroTipoAntecedente: z.string().optional(),
  agenteCasual: z.string().optional(),
  cinematica: z.string().optional(),
  medidaSeguridad: z.string().optional(),

  // Localización de lesiones
  lesiones: z.array(z.object({
    id: z.string(),
    type: z.string(),
    x: z.number(),
    y: z.number(),
    side: z.enum(['front', 'back'])
  })).optional(),

  // Exploración física (signos vitales)
  signosVitales: z.array(z.object({
    id: z.string(),
    hora: z.string(),
    ta: z.string(),
    fc: z.string(),
    fr: z.string(),
    temp: z.string(),
    satO2: z.string(),
    uc: z.string(),
    glu: z.string(),
    glasgow: z.string()
  })).optional(),

  // Manejo
  viaAerea: z.boolean().optional(),
  canalizacion: z.boolean().optional(),
  empaquetamiento: z.boolean().optional(),
  inmovilizacion: z.boolean().optional(),
  monitor: z.boolean().optional(),
  rcpBasica: z.boolean().optional(),
  mastPna: z.boolean().optional(),
  collarinCervical: z.boolean().optional(),
  desfibrilacion: z.boolean().optional(),
  apoyoVent: z.boolean().optional(),
  oxigeno: z.string().optional(),
  otroManejo: z.string().optional(),

  // Medicamentos
  medicamentos: z.string().optional(),

  // Urgencias Gineco-obstétricas
  parto: z.boolean().optional(),
  aborto: z.boolean().optional(),
  hxVaginal: z.boolean().optional(),
  fechaUltimaMenstruacion: z.string().optional(),
  semanasGestacion: z.string().optional(),
  ruidosCardiacosFetales: z.string().optional(),
  expulsionPlacenta: z.string().optional(),
  horaExpulsionPlacenta: z.string().optional(),
  gesta: z.string().optional(),
  partos: z.string().optional(),
  cesareas: z.string().optional(),
  abortos: z.string().optional(),
  metodosAnticonceptivos: z.string().optional(),

  // Negativa de Atención
  negativaAtencion: z.boolean().optional(),
  firmaPaciente: z.string().optional(),
  firmaTestigo: z.string().optional(),

  // Justificación de prioridad
  prioridad: z.string().optional(),
  pupilas: z.string().optional(),
  colorPiel: z.string().optional(),
  piel: z.string().optional(),
  temperatura: z.string().optional(),
  influenciadoPor: z.array(z.string()).optional(),
  otroInfluencia: z.string().optional(),

  // Unidad Médica que Recibe
  lugarOrigen: z.string().optional(),
  lugarConsulta: z.string().optional(),
  lugarDestino: z.string().optional(),
  ambulanciaNumero: z.string().optional(),
  ambulanciaPlacas: z.string().optional(),
  personal: z.string().optional(),
  doctor: z.string().optional(),

  // Médico Receptor
  medicoReceptorNombre: z.string().optional(),
  medicoReceptorFirma: z.string().optional(),
  horaEntrega: z.string().optional(),

  // Status del registro
  status: z.enum(['draft', 'partial', 'completed']).default('draft'),
  completedSections: z.array(z.string()).default([]),
  
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PreHospitalRecord = z.infer<typeof preHospitalRecordSchema>;

export const PreHospitalRecordFormSchema = preHospitalRecordSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PreHospitalRecordFormData = z.infer<typeof PreHospitalRecordFormSchema>;

// Tab completion status type
export type TabStatus = 'empty' | 'partial' | 'completed';

export interface TabConfig {
  id: string;
  name: string;
  icon: any;
  requiredFields: string[];
  optionalFields: string[];
  isSpecial?: boolean;
}