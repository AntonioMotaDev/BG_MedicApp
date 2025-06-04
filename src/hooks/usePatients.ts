"use client";

import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncService } from '@/lib/syncService';
import type { Patient, PatientFormData } from '@/lib/schema';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ pendingChanges: number; isOnline: boolean }>({
    pendingChanges: 0,
    isOnline: true
  });
  
  const { isOnline, wasOffline } = useNetworkStatus();

  // Refresh patients data
  const refreshPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await syncService.getPatients();
      setPatients(data);
    } catch (err) {
      setError('Error al cargar pacientes');
      console.error('Error loading patients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update sync status
  const updateSyncStatus = useCallback(async () => {
    try {
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      console.error('Error getting sync status:', err);
    }
  }, []);

  // Create patient
  const createPatient = useCallback(async (patientData: PatientFormData): Promise<{ success: boolean; error?: string; patient?: Patient }> => {
    try {
      const newPatient = await syncService.createPatient(patientData);
      await refreshPatients();
      await updateSyncStatus();
      return { success: true, patient: newPatient };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear paciente';
      return { success: false, error: errorMessage };
    }
  }, [refreshPatients, updateSyncStatus]);

  // Update patient
  const updatePatient = useCallback(async (id: string, patientData: Partial<PatientFormData>): Promise<{ success: boolean; error?: string }> => {
    try {
      await syncService.updatePatient(id, patientData);
      await refreshPatients();
      await updateSyncStatus();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar paciente';
      return { success: false, error: errorMessage };
    }
  }, [refreshPatients, updateSyncStatus]);

  // Delete patient
  const deletePatient = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await syncService.deletePatient(id);
      await refreshPatients();
      await updateSyncStatus();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar paciente';
      return { success: false, error: errorMessage };
    }
  }, [refreshPatients, updateSyncStatus]);

  // Get patient by ID
  const getPatientById = useCallback(async (id: string): Promise<Patient | null> => {
    try {
      return await syncService.getPatientById(id);
    } catch (err) {
      console.error('Error getting patient by ID:', err);
      return null;
    }
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    try {
      await syncService.forcSync();
      await refreshPatients();
      await updateSyncStatus();
    } catch (err) {
      console.error('Error during force sync:', err);
    }
  }, [refreshPatients, updateSyncStatus]);

  // Initial load and network change handlers
  useEffect(() => {
    refreshPatients();
    updateSyncStatus();
  }, [refreshPatients, updateSyncStatus]);

  // Listen for sync events
  useEffect(() => {
    const handleSyncData = () => {
      refreshPatients();
      updateSyncStatus();
    };

    window.addEventListener('sync-data', handleSyncData);
    return () => window.removeEventListener('sync-data', handleSyncData);
  }, [refreshPatients, updateSyncStatus]);

  // Update sync status when network status changes
  useEffect(() => {
    updateSyncStatus();
  }, [isOnline, updateSyncStatus]);

  return {
    // Data
    patients,
    isLoading,
    error,
    
    // Network & Sync Status
    isOnline,
    wasOffline,
    syncStatus,
    
    // Actions
    refreshPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    forceSync,
  };
} 