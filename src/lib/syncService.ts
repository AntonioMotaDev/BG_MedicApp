"use client";

import { localDB } from '@/lib/localDB';
import { Patient, PatientFormData } from '@/lib/schema';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

class SyncService {
  private isOnline: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      window.addEventListener('sync-data', this.syncPendingChanges.bind(this));
    }
  }

  private handleOnline() {
    this.isOnline = true;
    console.log('🟢 Conexión restaurada - iniciando sincronización');
    this.syncPendingChanges();
  }

  private handleOffline() {
    this.isOnline = false;
    console.log('🔴 Sin conexión - modo offline activado');
  }

  // Obtener pacientes (estrategia offline-first)
  async getPatients(): Promise<Patient[]> {
    try {
      if (this.isOnline) {
        // Intentar obtener de Firebase primero
        const snapshot = await getDocs(collection(db, 'patients'));
        const firebasePatients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Patient[];

        // Sincronizar con almacenamiento local
        await localDB.syncFromFirebase(firebasePatients);
        
        console.log('📡 Pacientes sincronizados desde Firebase');
        return firebasePatients;
      } else {
        // Obtener de almacenamiento local
        const localPatients = await localDB.getAllPatients();
        console.log('💾 Pacientes obtenidos desde almacenamiento local');
        return localPatients;
      }
    } catch (error) {
      console.error('Error al obtener pacientes de Firebase, fallback a local:', error);
      // Fallback a almacenamiento local si Firebase falla
      const localPatients = await localDB.getAllPatients();
      return localPatients;
    }
  }

  // Obtener paciente por ID
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      if (this.isOnline) {
        // Intentar obtener de Firebase primero
        const patientDoc = await import('firebase/firestore').then(({ getDoc, doc }) => 
          getDoc(doc(db, 'patients', id))
        );
        
        if (patientDoc.exists()) {
          const patient = { id: patientDoc.id, ...patientDoc.data() } as Patient;
          await localDB.savePatient(patient); // Guardar en local
          return patient;
        }
      }
      
      // Fallback a almacenamiento local
      return await localDB.getPatientById(id);
    } catch (error) {
      console.error('Error al obtener paciente de Firebase, fallback a local:', error);
      return await localDB.getPatientById(id);
    }
  }

  // Crear paciente
  async createPatient(patientData: PatientFormData): Promise<Patient> {
    const newPatient: Patient = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...patientData
    };

    // Guardar siempre en local primero
    await localDB.savePatient(newPatient);

    if (this.isOnline) {
      try {
        // Intentar guardar en Firebase
        const docRef = await addDoc(collection(db, 'patients'), patientData);
        
        // Actualizar con el ID real de Firebase
        const updatedPatient = { ...newPatient, id: docRef.id };
        await localDB.savePatient(updatedPatient);
        
        console.log('✅ Paciente creado y sincronizado con Firebase');
        return updatedPatient;
      } catch (error) {
        console.error('Error al crear paciente en Firebase, guardado en local:', error);
        
        // Agregar a cola de sincronización
        await localDB.addToSyncQueue({
          type: 'CREATE',
          store: 'patients',
          data: patientData
        });
        
        console.log('📝 Paciente agregado a cola de sincronización');
        return newPatient;
      }
    } else {
      // Agregar a cola de sincronización para cuando haya conexión
      await localDB.addToSyncQueue({
        type: 'CREATE',
        store: 'patients',
        data: patientData
      });
      
      console.log('📝 Paciente guardado localmente - se sincronizará cuando haya conexión');
      return newPatient;
    }
  }

  // Actualizar paciente
  async updatePatient(id: string, patientData: Partial<PatientFormData>): Promise<void> {
    // Obtener paciente actual y actualizar en local
    const currentPatient = await localDB.getPatientById(id);
    if (currentPatient) {
      const updatedPatient = { ...currentPatient, ...patientData };
      await localDB.savePatient(updatedPatient);
    }

    if (this.isOnline) {
      try {
        await setDoc(doc(db, 'patients', id), patientData, { merge: true });
        console.log('✅ Paciente actualizado y sincronizado con Firebase');
      } catch (error) {
        console.error('Error al actualizar paciente en Firebase:', error);
        
        // Agregar a cola de sincronización
        await localDB.addToSyncQueue({
          type: 'UPDATE',
          store: 'patients',
          data: { id, ...patientData }
        });
      }
    } else {
      // Agregar a cola de sincronización
      await localDB.addToSyncQueue({
        type: 'UPDATE',
        store: 'patients',
        data: { id, ...patientData }
      });
      
      console.log('📝 Cambios guardados localmente - se sincronizarán cuando haya conexión');
    }
  }

  // Eliminar paciente
  async deletePatient(id: string): Promise<void> {
    // Eliminar de almacenamiento local
    await localDB.deletePatient(id);

    if (this.isOnline) {
      try {
        await deleteDoc(doc(db, 'patients', id));
        console.log('✅ Paciente eliminado y sincronizado con Firebase');
      } catch (error) {
        console.error('Error al eliminar paciente en Firebase:', error);
        
        // Agregar a cola de sincronización
        await localDB.addToSyncQueue({
          type: 'DELETE',
          store: 'patients',
          data: { id }
        });
      }
    } else {
      // Agregar a cola de sincronización
      await localDB.addToSyncQueue({
        type: 'DELETE',
        store: 'patients',
        data: { id }
      });
      
      console.log('📝 Eliminación guardada localmente - se sincronizará cuando haya conexión');
    }
  }

  // Sincronizar cambios pendientes
  private async syncPendingChanges() {
    if (!this.isOnline) return;

    try {
      const syncQueue = await localDB.getSyncQueue();
      console.log(`🔄 Sincronizando ${syncQueue.length} cambios pendientes`);

      for (const item of syncQueue) {
        try {
          switch (item.type) {
            case 'CREATE':
              if (item.store === 'patients') {
                const docRef = await addDoc(collection(db, 'patients'), item.data);
                console.log(`✅ Paciente creado en Firebase: ${docRef.id}`);
              }
              break;

            case 'UPDATE':
              if (item.store === 'patients') {
                const { id, ...updateData } = item.data;
                await setDoc(doc(db, 'patients', id), updateData, { merge: true });
                console.log(`✅ Paciente actualizado en Firebase: ${id}`);
              }
              break;

            case 'DELETE':
              if (item.store === 'patients') {
                await deleteDoc(doc(db, 'patients', item.data.id));
                console.log(`✅ Paciente eliminado en Firebase: ${item.data.id}`);
              }
              break;
          }

          // Remover elemento de la cola después de sincronizar exitosamente
          await localDB.removeSyncQueueItem(item.id);
        } catch (error) {
          console.error(`Error al sincronizar elemento ${item.id}:`, error);
          // Mantener en la cola para reintentar más tarde
        }
      }

      console.log('🎉 Sincronización completada');
    } catch (error) {
      console.error('Error durante la sincronización:', error);
    }
  }

  // Forzar sincronización manual
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingChanges();
    } else {
      console.warn('No hay conexión disponible para sincronizar');
    }
  }

  // Obtener estado de sincronización
  async getSyncStatus(): Promise<{ pendingChanges: number; isOnline: boolean }> {
    const syncQueue = await localDB.getSyncQueue();
    return {
      pendingChanges: syncQueue.length,
      isOnline: this.isOnline
    };
  }
}

export const syncService = new SyncService(); 