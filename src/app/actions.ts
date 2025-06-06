"use server";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, Timestamp, getDoc, type DocumentSnapshot, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Patient, PatientFormData } from "@/lib/schema";
import { PatientFormSchema, patientSchema } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { z } from 'zod'; // For ZodError instance check

// Import sync service for offline capabilities
// Note: Server actions will use Firebase directly, client components will use syncService

// Helper to convert Firestore Timestamps to Date objects
const processPatientDoc = (docSnap: DocumentSnapshot<DocumentData>): Patient => {
  const data = docSnap.data();
  if (!data) {
    throw new Error(`No data found for document ${docSnap.id}. Document might not exist.`);
  }

  const patientDataToParse = {
    id: docSnap.id,
    paternalLastName: data.paternalLastName,
    maternalLastName: data.maternalLastName,
    firstName: data.firstName,
    age: data.age, // Assuming age is stored and is a number
    sex: data.sex || data.gender, // Prefer 'sex', fallback to 'gender' from Firestore
    street: data.street,
    exteriorNumber: data.exteriorNumber,
    interiorNumber: data.interiorNumber,
    neighborhood: data.neighborhood,
    city: data.city,
    phone: data.phone,
    insurance: data.insurance,
    responsiblePerson: data.responsiblePerson,
    emergencyContact: data.emergencyContact,
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
    const validatedData = PatientFormSchema.parse(data);
    
    const patientCollection = collection(db, "patients");
    const patientRef = await addDoc(patientCollection, {
      ...validatedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Verificar que el documento se creó correctamente
    const newDoc = await getDoc(patientRef);
    if (!newDoc.exists()) {
      throw new Error("Failed to create patient document");
    }

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
    console.log("patientsCollection", patientsCollection);
    const q = query(patientsCollection, orderBy("paternalLastName", "asc"));
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
      .filter((patient): patient is Patient => patient !== null);
    
    return patientList;
  } catch (error) {
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

export async function deletePatient(id: string): Promise<void> {
  try {
    const patientDoc = doc(db, "patients", id);
    await deleteDoc(patientDoc);
    revalidatePath("/");
    console.log('Patient deleted successfully');
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw new Error('Failed to delete patient');
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

// Pre-Hospital Records Functions
export async function savePreHospitalRecord(recordData: any): Promise<string> {
  try {
    console.log('Saving pre-hospital record:', recordData);
    
    const preHospitalCollection = collection(db, 'preHospitalRecords');
    
    if (recordData.id) {
      // Update existing record
      const recordDoc = doc(db, 'preHospitalRecords', recordData.id);
      const dataToSave = {
        ...recordData,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(recordDoc, dataToSave);
      console.log('Pre-hospital record updated successfully');
      return recordData.id;
    } else {
      // Create new record
      const dataToSave = {
        ...recordData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(preHospitalCollection, dataToSave);
      console.log('Pre-hospital record created successfully');
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving pre-hospital record:', error);
    throw new Error('Failed to save pre-hospital record');
  }
}

export async function getPreHospitalRecord(id: string): Promise<any | null> {
  try {
    const recordDoc = doc(db, 'preHospitalRecords', id);
    const docSnap = await getDoc(recordDoc);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data?.createdAt instanceof Timestamp ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data?.updatedAt,
    };
  } catch (error) {
    console.error('Error getting pre-hospital record:', error);
    throw new Error('Failed to get pre-hospital record');
  }
}

export async function getPreHospitalRecordsByPatient(patientId: string): Promise<any[]> {
  try {
    const preHospitalCollection = collection(db, 'preHospitalRecords');
    const q = query(
      preHospitalCollection,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const records = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
    });
    
    return records;
  } catch (error) {
    console.error('Error getting pre-hospital records:', error);
    throw new Error('Failed to get pre-hospital records');
  }
}

export async function updatePreHospitalRecordProgress(
  recordId: string, 
  sectionData: any, 
  completedSections: string[]
): Promise<void> {
  try {
    const recordDoc = doc(db, 'preHospitalRecords', recordId);
    const updateData = {
      ...sectionData,
      completedSections,
      status: completedSections.length === 0 ? 'draft' : 
              completedSections.length < 11 ? 'partial' : 'completed',
      updatedAt: serverTimestamp()
    };

    await updateDoc(recordDoc, updateData);
    console.log('Pre-hospital record progress updated successfully');
  } catch (error) {
    console.error('Error updating pre-hospital record progress:', error);
    throw new Error('Failed to update progress');
  }
}