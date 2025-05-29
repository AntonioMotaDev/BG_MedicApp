"use server";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, Timestamp, getDoc, type DocumentSnapshot, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Patient, PatientFormData } from "@/lib/schema";
import { PatientFormSchema, patientSchema } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { z } from 'zod'; // For ZodError instance check

// Helper to convert Firestore Timestamps to Date objects
const processPatientDoc = (docSnap: DocumentSnapshot<DocumentData>): Patient => {
  const data = docSnap.data();
  if (!data) {
    throw new Error(`No data found for document ${docSnap.id}. Document might not exist.`);
  }

  let processedDateOfBirth: Date | undefined = undefined;
  if (data.dateOfBirth) {
    if (data.dateOfBirth instanceof Timestamp) {
      processedDateOfBirth = data.dateOfBirth.toDate();
    } else if (typeof data.dateOfBirth === 'string' || typeof data.dateOfBirth === 'number') {
      const parsedDate = new Date(data.dateOfBirth);
      if (!isNaN(parsedDate.getTime())) {
        processedDateOfBirth = parsedDate;
      } else {
        console.warn(`Invalid dateOfBirth string/number for patient ${docSnap.id}: ${data.dateOfBirth}. Will be treated as undefined.`);
      }
    } else if (data.dateOfBirth instanceof Date) {
        processedDateOfBirth = data.dateOfBirth; 
    } else {
        console.warn(`Unrecognized dateOfBirth type for patient ${docSnap.id}:`, typeof data.dateOfBirth, data.dateOfBirth, `. Will be treated as undefined.`);
    }
  }

  let processedPickupTimestamp: Date | undefined | null = undefined;
  if (data.pickupTimestamp === null) { 
    processedPickupTimestamp = null;
  } else if (data.pickupTimestamp) {
    if (data.pickupTimestamp instanceof Timestamp) {
      processedPickupTimestamp = data.pickupTimestamp.toDate();
    } else if (typeof data.pickupTimestamp === 'string' || typeof data.pickupTimestamp === 'number') {
      const parsedTimestamp = new Date(data.pickupTimestamp);
      if (!isNaN(parsedTimestamp.getTime())) {
        processedPickupTimestamp = parsedTimestamp;
      } else {
        console.warn(`Invalid pickupTimestamp string/number for patient ${docSnap.id}: ${data.pickupTimestamp}. Will be treated as undefined.`);
      }
    } else if (data.pickupTimestamp instanceof Date) {
        processedPickupTimestamp = data.pickupTimestamp;
    } else {
        console.warn(`Unrecognized pickupTimestamp type for patient ${docSnap.id}:`, typeof data.pickupTimestamp, data.pickupTimestamp, `. Will be treated as undefined.`);
    }
  }

  let weightKgFinal: number | null | undefined = undefined;
  if (data.weightKg === null) {
      weightKgFinal = null;
  } else if (data.weightKg !== undefined) {
      const num = Number(data.weightKg);
      if (!isNaN(num)) {
        weightKgFinal = num;
      } else {
        console.warn(`Invalid weightKg for patient ${docSnap.id}: ${data.weightKg}. Will be treated as undefined.`);
      }
  }

  let heightCmFinal: number | null | undefined = undefined;
  if (data.heightCm === null) {
      heightCmFinal = null;
  } else if (data.heightCm !== undefined) {
      const num = Number(data.heightCm);
      if (!isNaN(num)) {
        heightCmFinal = num;
      } else {
        console.warn(`Invalid heightCm for patient ${docSnap.id}: ${data.heightCm}. Will be treated as undefined.`);
      }
  }
  
  const patientDataToParse = {
    id: docSnap.id,
    paternalLastName: data.paternalLastName,
    maternalLastName: data.maternalLastName,
    firstName: data.firstName,
    age: data.age, // Assuming age is stored and is a number
    sex: data.sex || data.gender, // Prefer 'sex', fallback to 'gender' from Firestore
    dateOfBirth: processedDateOfBirth,
    street: data.street,
    exteriorNumber: data.exteriorNumber,
    interiorNumber: data.interiorNumber,
    neighborhood: data.neighborhood,
    city: data.city,
    phone: data.phone,
    insurance: data.insurance,
    responsiblePerson: data.responsiblePerson,
    weightKg: weightKgFinal,
    heightCm: heightCmFinal,
    emergencyContact: data.emergencyContact,
    medicalNotes: data.medicalNotes,
    pickupTimestamp: processedPickupTimestamp,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
  };
  
  try {
    return patientSchema.parse(patientDataToParse) as Patient;
  } catch (error) {
    console.error(`Data for patient ${docSnap.id} failed Zod validation after processing:`, error);
    console.error("Data that failed validation:", patientDataToParse);
    throw new Error(`Processed data for patient ${docSnap.id} is invalid: ${(error as Error).message}`);
  }
};

export async function addPatient(data: PatientFormData) {
  try {
    // PatientFormData is already validated by the form if PatientFormSchema is used.
    // Server-side validation is still good practice.
    const validatedData = PatientFormSchema.parse(data);
    
    const patientCollection = collection(db, "patients");
    const patientRef = await addDoc(patientCollection, {
      ...validatedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    revalidatePath("/");
    return { success: true, id: patientRef.id };
  } catch (error: any) {
    console.error("Error adding patient:", error);
    let errorMessage = "Error al agregar el paciente.";
    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(e => e.message).join(", ");
    } else if (error.message) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function getPatients(): Promise<Patient[]> {
  try {
    const patientsCollection = collection(db, "patients");
    const q = query(patientsCollection, orderBy("paternalLastName", "asc")); // Example sort
    const patientSnapshot = await getDocs(q);
    const patientList = patientSnapshot.docs
      .map(docSnap => {
        try {
          return processPatientDoc(docSnap);
        } catch (error) {
          console.error(`Failed to process patient document ${docSnap.id}:`, error);
          return null; 
        }
      })
      .filter(patient => patient !== null) as Patient[]; 
    return patientList;
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

export async function updatePatient(id: string, data: PatientFormData) {
  try {
    const validatedData = PatientFormSchema.parse(data);
    const patientDoc = doc(db, "patients", id);
    await updateDoc(patientDoc, {
      ...validatedData,
      updatedAt: serverTimestamp(),
    });
    revalidatePath("/");
    revalidatePath(`/patients/${id}`);
    revalidatePath(`/patients/${id}/edit`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating patient:", error);
    let errorMessage = "Error al actualizar el paciente.";
    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(e => e.message).join(", ");
    } else if (error.message) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function deletePatient(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const patientDoc = doc(db, "patients", id);
    await deleteDoc(patientDoc);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deletePatient:", error);
    return { success: false, error: error.message || "Failed to delete patient." };
  }
}

export async function getPatientById(id: string): Promise<Patient | null> {
  if (!id || typeof id !== 'string' || id.trim() === "") {
    console.error("getPatientById: Invalid or empty ID provided:", id);
    return null;
  }
  try {
    const patientDocRef = doc(db, "patients", id);
    const docSnap = await getDoc(patientDocRef);

    if (docSnap.exists()) {
      return processPatientDoc(docSnap);
    } else {
      console.log(`No such patient document with ID: ${id}`);
      return null;
    }
  } catch (error: any) {
    console.error(`Error fetching or processing patient by ID (${id}):`, error);
    return null;
  }
}