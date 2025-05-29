import type { Patient } from '@/lib/schema';

// Simulación de base de datos en memoria
let patients: Patient[] = [];

export const patientService = {
  // Obtener todos los pacientes
  getAllPatients: async (): Promise<Patient[]> => {
    return patients;
  },

  // Obtener un paciente por ID
  getPatientById: async (id: string): Promise<Patient | null> => {
    return patients.find(p => p.id === id) || null;
  },

  // Crear un nuevo paciente
  createPatient: async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
    const newPatient: Patient = {
      ...patient,
      id: Math.random().toString(36).substr(2, 9), // Generar ID único
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    patients.push(newPatient);
    return newPatient;
  },

  // Actualizar un paciente existente
  updatePatient: async (id: string, patient: Partial<Patient>): Promise<Patient | null> => {
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedPatient = {
      ...patients[index],
      ...patient,
      updatedAt: new Date().toISOString()
    };
    patients[index] = updatedPatient;
    return updatedPatient;
  },

  // Eliminar un paciente
  deletePatient: async (id: string): Promise<boolean> => {
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return false;
    patients.splice(index, 1);
    return true;
  },

  // Buscar pacientes
  searchPatients: async (query: string): Promise<Patient[]> => {
    const searchTerm = query.toLowerCase();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm) ||
      patient.phone.toLowerCase().includes(searchTerm)
    );
  }
}; 