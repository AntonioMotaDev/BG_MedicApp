import type { Patient, PatientFormData } from '@/lib/schema';

const DB_NAME = 'MedicAppDB';
const DB_VERSION = 1;
const PATIENTS_STORE = 'patients';
const RECORDS_STORE = 'records';
const SYNC_QUEUE_STORE = 'syncQueue';

interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  store: string;
  data?: any;
  timestamp: number;
}

// Extend Patient type for local storage with timestamps as strings for IndexedDB
interface LocalPatient extends Omit<Patient, 'createdAt' | 'updatedAt' | 'dateOfBirth' | 'pickupTimestamp'> {
  createdAt?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  pickupTimestamp?: string | null;
}

class LocalDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para pacientes
        if (!db.objectStoreNames.contains(PATIENTS_STORE)) {
          const patientsStore = db.createObjectStore(PATIENTS_STORE, { keyPath: 'id' });
          patientsStore.createIndex('firstName', 'firstName', { unique: false });
          patientsStore.createIndex('paternalLastName', 'paternalLastName', { unique: false });
          patientsStore.createIndex('phone', 'phone', { unique: false });
        }

        // Store para registros
        if (!db.objectStoreNames.contains(RECORDS_STORE)) {
          const recordsStore = db.createObjectStore(RECORDS_STORE, { keyPath: 'id' });
          recordsStore.createIndex('patientId', 'patientId', { unique: false });
          recordsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Store para cola de sincronización
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  // Métodos para pacientes
  async getAllPatients(): Promise<Patient[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PATIENTS_STORE], 'readonly');
      const store = transaction.objectStore(PATIENTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const patients = request.result.map((localPatient: LocalPatient) => {
          return this.localPatientToPatient(localPatient);
        });
        resolve(patients);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPatientById(id: string): Promise<Patient | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PATIENTS_STORE], 'readonly');
      const store = transaction.objectStore(PATIENTS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const localPatient: LocalPatient = request.result;
        if (localPatient) {
          resolve(this.localPatientToPatient(localPatient));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async savePatient(patient: Patient): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PATIENTS_STORE], 'readwrite');
      const store = transaction.objectStore(PATIENTS_STORE);
      
      const localPatient = this.patientToLocalPatient(patient);
      const request = store.put(localPatient);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deletePatient(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PATIENTS_STORE], 'readwrite');
      const store = transaction.objectStore(PATIENTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Métodos para cola de sincronización
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) await this.init();
    
    const syncItem: SyncQueueItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SYNC_QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.add(syncItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SYNC_QUEUE_STORE], 'readonly');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SYNC_QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SYNC_QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Método para sincronizar todos los datos desde Firebase
  async syncFromFirebase(patients: Patient[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([PATIENTS_STORE], 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE);

    // Limpiar store existente
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Agregar todos los pacientes
    for (const patient of patients) {
      await new Promise<void>((resolve, reject) => {
        const localPatient = this.patientToLocalPatient(patient);
        const addRequest = store.add(localPatient);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }
  }

  // Helper methods for conversion
  private patientToLocalPatient(patient: Patient): LocalPatient {
    const safeDateToString = (dateValue: any): string | undefined => {
      if (!dateValue) return undefined;
      if (dateValue instanceof Date) return dateValue.toISOString();
      if (typeof dateValue === 'string') return dateValue;
      return undefined;
    };

    const safePickupToString = (timestampValue: any): string | null => {
      if (timestampValue === null || timestampValue === undefined) return null;
      if (timestampValue instanceof Date) return timestampValue.toISOString();
      if (typeof timestampValue === 'string') return timestampValue;
      return null;
    };

    return {
      ...patient,
      createdAt: safeDateToString(patient.createdAt),
      updatedAt: safeDateToString(patient.updatedAt),
      dateOfBirth: safeDateToString(patient.dateOfBirth),
      pickupTimestamp: safePickupToString(patient.pickupTimestamp),
    };
  }

  private localPatientToPatient(localPatient: LocalPatient): Patient {
    const safeStringToDate = (dateString: string | undefined): Date | undefined => {
      if (!dateString) return undefined;
      return new Date(dateString);
    };

    return {
      ...localPatient,
      createdAt: safeStringToDate(localPatient.createdAt),
      updatedAt: safeStringToDate(localPatient.updatedAt),
      dateOfBirth: safeStringToDate(localPatient.dateOfBirth),
      pickupTimestamp: localPatient.pickupTimestamp ? new Date(localPatient.pickupTimestamp) : null,
    };
  }
}

export const localDB = new LocalDB(); 