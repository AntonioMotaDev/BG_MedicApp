
import { z } from 'zod';

export const PatientSchema = z.object({
  id: z.string().optional(), // Firestore ID, not part of form input for creation
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.coerce.date({
    required_error: "Date of birth is required.",
    invalid_type_error: "Invalid date format. Please use YYYY-MM-DD.",
  }),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"], {
    required_error: "Gender is required.",
  }),
  weightKg: z.coerce.number().min(0, "Weight must be 0kg or more.").max(300, "Weight must be 300kg or less.").optional().nullable(),
  heightCm: z.coerce.number().min(30, "Height must be 30cm or more.").max(250, "Height must be 250cm or less.").optional().nullable(),
  emergencyContact: z.string().min(1, "Emergency contact is required.").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format (E.164 expected, e.g., +12223334444)."),
  medicalNotes: z.string().optional().nullable(),
  pickupTimestamp: z.date().optional().nullable(), // Changed from z.any().optional()
});

export type Patient = z.infer<typeof PatientSchema>;

export const PatientFormSchema = PatientSchema.omit({ id: true, pickupTimestamp: true });
export type PatientFormData = z.infer<typeof PatientFormSchema>;


// Login Schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

