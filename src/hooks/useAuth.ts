"use client";

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/authService';
import { sessionManager } from '@/lib/sessionManager';
import type { User, UserRole, LoginFormData, RegisterFormData } from '@/lib/schema';

interface UseAuthReturn {
  // Estado
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  sessionTimeRemaining: number;

  // Acciones
  login: (credentials: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Permisos
  hasPermission: (requiredRole: UserRole) => boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);

  // Estados derivados
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || false;

  // Configurar listener de cambios de sesión
  useEffect(() => {
    const unsubscribe = sessionManager.onSessionChange((sessionUser) => {
      setUser(sessionUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Actualizar tiempo restante de sesión cada minuto
  useEffect(() => {
    if (!isAuthenticated) {
      setSessionTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remaining = sessionManager.getTimeRemaining();
      setSessionTimeRemaining(remaining);
    };

    // Actualizar inmediatamente
    updateTimer();

    // Actualizar cada minuto
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Función de login optimizada
  const login = useCallback(async (credentials: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        // Crear sesión local en lugar de depender de Firebase Auth state
        sessionManager.createSession(result.user);
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error inesperado durante el login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de registro optimizada
  const register = useCallback(async (userData: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.success && result.user) {
        // Crear sesión local para el nuevo usuario
        sessionManager.createSession(result.user);
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Error inesperado durante el registro' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de logout optimizada
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Limpiar sesión local primero
      sessionManager.clearSession();
      setUser(null);
      
      // Luego cerrar sesión en Firebase (sin esperar)
      authService.logout().catch(error => {
        console.error('Error during Firebase logout:', error);
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar permisos de forma eficiente (solo basado en sesión local)
  const hasPermission = useCallback((requiredRole: UserRole): boolean => {
    if (!user) return false;
    
    // Admin tiene todos los permisos
    if (user.role === 'admin') return true;
    
    // Usuario normal solo puede acceder a funciones de usuario
    return user.role === requiredRole;
  }, [user]);

  return {
    // Estado
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    sessionTimeRemaining,

    // Acciones
    login,
    register,
    logout,

    // Permisos
    hasPermission,
  };
} 