import { z } from 'zod';

export const patientSchema = z.object({
  id: z.string().optional(),
  paternalLastName: z.string().min(1, "El apellido paterno es requerido"),
  maternalLastName: z.string().min(1, "El apellido materno es requerido"),
  firstName: z.string().min(1, "El nombre es requerido"),
  age: z.number().min(0, "La edad debe ser un número positivo").optional(), // Made optional as dateOfBirth is primary
  sex: z.enum(["Masculino", "Femenino", "Sin definir"], {
    required_error: "El sexo es requerido",
  }),
  dateOfBirth: z.coerce.date().optional(),
  street: z.string().min(1, "La calle es requerida"),
  exteriorNumber: z.string().min(1, "El número exterior es requerido"),
  interiorNumber: z.string().optional(),
  neighborhood: z.string().min(1, "La colonia es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  insurance: z.string().optional(),
  responsiblePerson: z.string().min(1, "La persona responsable es requerida"),
  weightKg: z.coerce.number().optional().nullable(),
  heightCm: z.coerce.number().optional().nullable(),
  emergencyContact: z.string().optional(),
  medicalNotes: z.string().optional(),
  pickupTimestamp: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Patient = z.infer<typeof patientSchema>;

export const PatientFormSchema = patientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type PatientFormData = z.infer<typeof PatientFormSchema>;

// Login Schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginFormData = z.infer<typeof LoginSchema>;