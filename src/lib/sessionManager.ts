"use client";

import type { User } from './schema';

// Configuración de sesión
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
const ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutos de inactividad antes de renovar
const SESSION_KEY = 'app_session';
const USER_KEY = 'app_user';

interface SessionData {
  token: string;
  expiresAt: number;
  lastActivity: number;
  user: User;
}

class SessionManager {
  private activityTimer: NodeJS.Timeout | null = null;
  private checkExpirationTimer: NodeJS.Timeout | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    this.initializeActivityListeners();
    this.startExpirationCheck();
  }

  /**
   * Crear nueva sesión para usuario autenticado
   */
  createSession(user: User): void {
    const now = Date.now();
    const sessionData: SessionData = {
      token: this.generateToken(),
      expiresAt: now + SESSION_DURATION,
      lastActivity: now,
      user,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    this.notifyListeners(user);
    this.resetActivityTimer();
  }

  /**
   * Obtener sesión actual si es válida
   */
  getCurrentSession(): User | null {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;

      const session: SessionData = JSON.parse(sessionStr);
      const now = Date.now();

      // Verificar si la sesión ha expirado
      if (now > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session.user;
    } catch {
      this.clearSession();
      return null;
    }
  }

  /**
   * Renovar sesión si el usuario ha estado activo
   */
  renewSession(): boolean {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return false;

      const session: SessionData = JSON.parse(sessionStr);
      const now = Date.now();

      // Solo renovar si está dentro del tiempo de gracia
      if (now > session.expiresAt) {
        this.clearSession();
        return false;
      }

      // Verificar si necesita renovación por actividad
      const timeSinceLastActivity = now - session.lastActivity;
      if (timeSinceLastActivity > ACTIVITY_THRESHOLD) {
        session.expiresAt = now + SESSION_DURATION;
        session.lastActivity = now;
        
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return true;
      }

      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  /**
   * Actualizar última actividad del usuario
   */
  updateActivity(): void {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return;

      const session: SessionData = JSON.parse(sessionStr);
      const now = Date.now();

      // Solo actualizar si la sesión sigue válida
      if (now <= session.expiresAt) {
        session.lastActivity = now;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    } catch {
      // Error silencioso, no afecta la funcionalidad
    }
  }

  /**
   * Limpiar sesión completamente
   */
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    this.notifyListeners(null);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  /**
   * Obtener tiempo restante de sesión en minutos
   */
  getTimeRemaining(): number {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return 0;

      const session: SessionData = JSON.parse(sessionStr);
      const now = Date.now();
      const remaining = Math.max(0, session.expiresAt - now);
      
      return Math.ceil(remaining / (60 * 1000)); // Convertir a minutos
    } catch {
      return 0;
    }
  }

  /**
   * Suscribirse a cambios de sesión
   */
  onSessionChange(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    
    // Llamar inmediatamente con el estado actual
    callback(this.getCurrentSession());
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Inicializar listeners de actividad del usuario
   */
  private initializeActivityListeners(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      this.updateActivity();
      this.resetActivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Limpiar al desmontar (en caso de hot reload en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      const cleanup = () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
      };
      
      window.addEventListener('beforeunload', cleanup);
    }
  }

  /**
   * Resetear timer de actividad
   */
  private resetActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    // Renovar sesión después de periodo de inactividad
    this.activityTimer = setTimeout(() => {
      this.renewSession();
    }, ACTIVITY_THRESHOLD);
  }

  /**
   * Iniciar verificación periódica de expiración
   */
  private startExpirationCheck(): void {
    if (typeof window === 'undefined') return;

    this.checkExpirationTimer = setInterval(() => {
      const user = this.getCurrentSession();
      if (!user) {
        this.notifyListeners(null);
      }
    }, 60000); // Verificar cada minuto

    // Limpiar timer al cerrar ventana
    window.addEventListener('beforeunload', () => {
      if (this.checkExpirationTimer) {
        clearInterval(this.checkExpirationTimer);
      }
    });
  }

  /**
   * Notificar a todos los listeners sobre cambios de sesión
   */
  private notifyListeners(user: User | null): void {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in session change listener:', error);
      }
    });
  }

  /**
   * Generar token único para la sesión
   */
  private generateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destruir instancia y limpiar recursos
   */
  destroy(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    if (this.checkExpirationTimer) {
      clearInterval(this.checkExpirationTimer);
    }
    this.listeners.clear();
  }
}

// Instancia singleton
export const sessionManager = new SessionManager(); 