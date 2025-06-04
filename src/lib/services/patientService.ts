import type { Patient, PatientFormData } from '@/lib/schema';
import { patientSchema } from '@/lib/schema'; // Import for validation if needed for mock
import { parseISO } from 'date-fns';

// Simulación de base de datos en memoria
let patientsDB: Patient[] = [];
let nextId = 1;

function calculateAge(dateOfBirth?: Date): number | undefined {
  if (!dateOfBirth) return undefined;
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

// Helper function to safely parse dates
function safeParseDateString(dateValue: any): Date | undefined {
  if (!dateValue) return undefined;
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === 'string') return parseISO(dateValue);
  return undefined;
}

function safeParsePickupTimestamp(timestampValue: any): Date | null {
  if (timestampValue === null || timestampValue === undefined) return null;
  if (timestampValue instanceof Date) return timestampValue;
  if (typeof timestampValue === 'string') return parseISO(timestampValue);
  return null;
}

export const patientService = {
  getAllPatients: async (): Promise<Patient[]> => {
    return JSON.parse(JSON.stringify(patientsDB)).map((p: any) => ({
      ...p,
      dateOfBirth: safeParseDateString(p.dateOfBirth),
      pickupTimestamp: safeParsePickupTimestamp(p.pickupTimestamp),
      createdAt: safeParseDateString(p.createdAt),
      updatedAt: safeParseDateString(p.updatedAt),
      age: p.dateOfBirth ? calculateAge(safeParseDateString(p.dateOfBirth)) : p.age,
    }));
  },

  getPatientById: async (id: string): Promise<Patient | null> => {
    const patient = patientsDB.find(p => p.id === id);
    if (!patient) return null;
    return JSON.parse(JSON.stringify({
      ...patient,
      dateOfBirth: safeParseDateString(patient.dateOfBirth),
      pickupTimestamp: safeParsePickupTimestamp(patient.pickupTimestamp),
      createdAt: safeParseDateString(patient.createdAt),
      updatedAt: safeParseDateString(patient.updatedAt),
      age: patient.dateOfBirth ? calculateAge(safeParseDateString(patient.dateOfBirth)) : patient.age,
    }));
  },

  createPatient: async (data: PatientFormData): Promise<Patient> => {
    const now = new Date();
    const newPatient: Patient = {
      ...data,
      id: (nextId++).toString(),
      age: data.dateOfBirth ? calculateAge(safeParseDateString(data.dateOfBirth)) : data.age,
      dateOfBirth: safeParseDateString(data.dateOfBirth),
      pickupTimestamp: safeParsePickupTimestamp(data.pickupTimestamp),
      createdAt: now,
      updatedAt: now,
    };
    // Simulate Zod validation for completeness if this were a real backend
    const validatedPatient = patientSchema.parse(newPatient);
    patientsDB.push(JSON.parse(JSON.stringify(validatedPatient))); // Store as plain JSON
    return JSON.parse(JSON.stringify(validatedPatient));
  },

  updatePatient: async (id: string, data: Partial<PatientFormData>): Promise<Patient | null> => {
    const index = patientsDB.findIndex(p => p.id === id);
    if (index === -1) return null;

    const existingPatient = patientsDB[index];
    const now = new Date();
    
    const patientForSchema: Patient = {
      ...existingPatient,
      ...data,
      id,
      age: data.dateOfBirth ? calculateAge(safeParseDateString(data.dateOfBirth)) : (data.age !== undefined ? data.age : existingPatient.age),
      dateOfBirth: data.dateOfBirth !== undefined ? safeParseDateString(data.dateOfBirth) : existingPatient.dateOfBirth,
      pickupTimestamp: data.pickupTimestamp !== undefined ? safeParsePickupTimestamp(data.pickupTimestamp) : existingPatient.pickupTimestamp,
      updatedAt: now,
      createdAt: safeParseDateString(existingPatient.createdAt),
    };
    
    const validatedPatient = patientSchema.parse(patientForSchema);
    patientsDB[index] = JSON.parse(JSON.stringify(validatedPatient));
    return JSON.parse(JSON.stringify(validatedPatient));
  },

  deletePatient: async (id: string): Promise<boolean> => {
    const index = patientsDB.findIndex(p => p.id === id);
    if (index === -1) return false;
    patientsDB.splice(index, 1);
    return true;
  },

  searchPatients: async (query: string): Promise<Patient[]> => {
    const searchTerm = query.toLowerCase();
    const results = patientsDB.filter(patient => {
      const fullName = `${patient.firstName} ${patient.paternalLastName} ${patient.maternalLastName}`.toLowerCase();
      const phoneMatch = patient.phone.toLowerCase().includes(searchTerm);
      const sexMatch = patient.sex && patient.sex.toLowerCase().includes(searchTerm);
      const responsiblePersonMatch = patient.responsiblePerson && patient.responsiblePerson.toLowerCase().includes(searchTerm);
      return fullName.includes(searchTerm) || phoneMatch || sexMatch || responsiblePersonMatch;
    });
    return JSON.parse(JSON.stringify(results)).map((p: any) => ({
      ...p,
      dateOfBirth: safeParseDateString(p.dateOfBirth),
      pickupTimestamp: safeParsePickupTimestamp(p.pickupTimestamp),
      createdAt: safeParseDateString(p.createdAt),
      updatedAt: safeParseDateString(p.updatedAt),
      age: p.dateOfBirth ? calculateAge(safeParseDateString(p.dateOfBirth)) : p.age,
    }));
  }
};