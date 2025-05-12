
"use server";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Patient, PatientFormData } from "@/lib/schema";
import { PatientSchema } from "@/lib/schema";
import { revalidatePath } from "next/cache";

// Helper to convert Firestore Timestamps to Date objects
const processPatientDoc = (docSnap: any): Patient => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    dateOfBirth: data.dateOfBirth instanceof Timestamp ? data.dateOfBirth.toDate() : new Date(data.dateOfBirth),
    pickupTimestamp: data.pickupTimestamp instanceof Timestamp ? data.pickupTimestamp.toDate() : new Date(data.pickupTimestamp),
  } as Patient;
};


export async function addPatient(formData: PatientFormData): Promise<{ success: boolean; error?: string; patient?: Patient }> {
  try {
    const validatedData = PatientSchema.omit({id: true, pickupTimestamp: true}).parse(formData);
    
    const docRef = await addDoc(collection(db, "patients"), {
      ...validatedData,
      dateOfBirth: validatedData.dateOfBirth, // Store as Date object, Firestore will convert to Timestamp
      pickupTimestamp: serverTimestamp(),
    });
    revalidatePath("/");
    // Fetch the newly created document to include its ID and server-generated timestamp
    // For simplicity, we'll just return success here. The table will re-fetch.
    return { success: true, patient: { ...validatedData, id: docRef.id, pickupTimestamp: new Date() } as Patient }; // Approximate pickupTimestamp
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: error.message || "Failed to add patient." };
  }
}

export async function getPatients(): Promise<Patient[]> {
  try {
    const patientsCollection = collection(db, "patients");
    const q = query(patientsCollection, orderBy("pickupTimestamp", "desc"));
    const patientSnapshot = await getDocs(q);
    const patientList = patientSnapshot.docs.map(processPatientDoc);
    return patientList;
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

export async function updatePatient(id: string, formData: Partial<PatientFormData>): Promise<{ success: boolean; error?: string }> {
   try {
    // Only validate fields that are present in formData
    const partialSchema = PatientSchema.omit({id: true, pickupTimestamp: true}).partial();
    const validatedData = partialSchema.parse(formData);

    const patientDoc = doc(db, "patients", id);
    
    const updatePayload: any = { ...validatedData };
    if (validatedData.dateOfBirth) {
      updatePayload.dateOfBirth = validatedData.dateOfBirth; // Store as Date, Firestore converts
    }

    await updateDoc(patientDoc, updatePayload);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: error.message || "Failed to update patient." };
  }
}

export async function deletePatient(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const patientDoc = doc(db, "patients", id);
    await deleteDoc(patientDoc);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete patient." };
  }
}
