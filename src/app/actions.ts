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
    // This path should ideally not be hit if docSnap.exists() is checked by the caller.
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
        processedDateOfBirth = data.dateOfBirth; // Already a JS Date
    } else {
        console.warn(`Unrecognized dateOfBirth type for patient ${docSnap.id}:`, typeof data.dateOfBirth, data.dateOfBirth, `. Will be treated as undefined.`);
    }
  }

  let processedPickupTimestamp: Date | undefined | null = undefined;
  if (data.pickupTimestamp === null) { // Handle explicitly stored null
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
        processedPickupTimestamp = data.pickupTimestamp; // Already a JS Date
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
    fullName: data.fullName,
    dateOfBirth: processedDateOfBirth, // Required by schema; if undefined, Zod parse will fail
    gender: data.gender,
    weightKg: weightKgFinal, // Optional & nullable in schema
    heightCm: heightCmFinal,   // Optional & nullable in schema
    emergencyContact: data.emergencyContact,
    medicalNotes: data.medicalNotes,
    pickupTimestamp: processedPickupTimestamp, // Optional & nullable in schema
  };
  
  try {
    // Validate the processed data against the Zod schema
    return patientSchema.parse(patientDataToParse) as Patient;
  } catch (error) {
    console.error(`Data for patient ${docSnap.id} failed Zod validation after processing:`, error);
    console.error("Data that failed validation:", patientDataToParse);
    // Rethrow or handle as appropriate for your app's error strategy
    throw new Error(`Processed data for patient ${docSnap.id} is invalid: ${(error as Error).message}`);
  }
};

export async function addPatient(data: z.infer<typeof patientSchema>) {
  try {
    const validatedData = patientSchema.parse(data);
    
    // Create a new patient object with the validated data
    const newPatient = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Here you would typically save to your database
    // For now, we'll just return success
    return { success: true, data: newPatient };
  } catch (error) {
    console.error("Error adding patient:", error);
    return { success: false, error: "Error al agregar el paciente" };
  } finally {
    revalidatePath("/");
  }
}

export async function getPatients(): Promise<Patient[]> {
  try {
    const patientsCollection = collection(db, "patients");
    const q = query(patientsCollection, orderBy("pickupTimestamp", "desc"));
    const patientSnapshot = await getDocs(q);
    // Use .map and .filter to handle potential errors during individual document processing
    const patientList = patientSnapshot.docs
      .map(docSnap => {
        try {
          return processPatientDoc(docSnap);
        } catch (error) {
          console.error(`Failed to process patient document ${docSnap.id}:`, error);
          return null; // Skip this document in the final list
        }
      })
      .filter(patient => patient !== null) as Patient[]; // Type assertion after filtering out nulls
    return patientList;
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

export async function updatePatient(id: string, data: z.infer<typeof patientSchema>) {
  try {
    const validatedData = patientSchema.parse(data);
    
    // Create an updated patient object
    const updatedPatient = {
      ...validatedData,
      id,
      updatedAt: new Date(),
    };

    // Here you would typically update your database
    // For now, we'll just return success
    return { success: true, data: updatedPatient };
  } catch (error) {
    console.error("Error updating patient:", error);
    return { success: false, error: "Error al actualizar el paciente" };
  } finally {
    revalidatePath("/");
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
      // Attempt to process the document. If processing fails (e.g., Zod validation),
      // it will throw an error, which will be caught by the catch block.
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
