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

export const patientService = {
  getAllPatients: async (): Promise<Patient[]> => {
    return JSON.parse(JSON.stringify(patientsDB)).map((p: Patient) => ({
      ...p,
      dateOfBirth: p.dateOfBirth ? parseISO(p.dateOfBirth as any) : undefined,
      pickupTimestamp: p.pickupTimestamp ? parseISO(p.pickupTimestamp as any) : null,
      createdAt: p.createdAt ? parseISO(p.createdAt as any) : undefined,
      updatedAt: p.updatedAt ? parseISO(p.updatedAt as any) : undefined,
      age: p.dateOfBirth ? calculateAge(parseISO(p.dateOfBirth as any)) : p.age, // Recalculate age
    }));
  },

  getPatientById: async (id: string): Promise<Patient | null> => {
    const patient = patientsDB.find(p => p.id === id);
    if (!patient) return null;
    return JSON.parse(JSON.stringify({
      ...patient,
      dateOfBirth: patient.dateOfBirth ? parseISO(patient.dateOfBirth as any) : undefined,
      pickupTimestamp: patient.pickupTimestamp ? parseISO(patient.pickupTimestamp as any) : null,
      createdAt: patient.createdAt ? parseISO(patient.createdAt as any) : undefined,
      updatedAt: patient.updatedAt ? parseISO(patient.updatedAt as any) : undefined,
      age: patient.dateOfBirth ? calculateAge(parseISO(patient.dateOfBirth as any)) : patient.age, // Recalculate age
    }));
  },

  createPatient: async (data: PatientFormData): Promise<Patient> => {
    const now = new Date();
    const newPatient: Patient = {
      ...data,
      id: (nextId++).toString(),
      age: data.dateOfBirth ? calculateAge(new Date(data.dateOfBirth)) : data.age,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      pickupTimestamp: data.pickupTimestamp ? new Date(data.pickupTimestamp) : null,
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
    
    const updatedData = { ...existingPatient, ...data };

    const patientForSchema: Patient = {
      ...existingPatient, // spread existing patient to ensure all fields are present for schema
      ...data,
      id, // ensure id is part of the object for schema
      age: data.dateOfBirth ? calculateAge(new Date(data.dateOfBirth)) : (data.age !== undefined ? data.age : existingPatient.age),
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : existingPatient.dateOfBirth,
      pickupTimestamp: data.pickupTimestamp !== undefined ? (data.pickupTimestamp ? new Date(data.pickupTimestamp) : null) : existingPatient.pickupTimestamp,
      updatedAt: now,
      // Ensure createdAt is preserved correctly if not part of `data`
      createdAt: existingPatient.createdAt ? new Date(existingPatient.createdAt) : undefined,
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
    return JSON.parse(JSON.stringify(results)).map((p: Patient) => ({
      ...p,
      dateOfBirth: p.dateOfBirth ? parseISO(p.dateOfBirth as any) : undefined,
      pickupTimestamp: p.pickupTimestamp ? parseISO(p.pickupTimestamp as any) : null,
      createdAt: p.createdAt ? parseISO(p.createdAt as any) : undefined,
      updatedAt: p.updatedAt ? parseISO(p.updatedAt as any) : undefined,
      age: p.dateOfBirth ? calculateAge(parseISO(p.dateOfBirth as any)) : p.age,
    }));
  }
};