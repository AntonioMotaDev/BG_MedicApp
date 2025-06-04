"use client";

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserRole, RegisterFormData, LoginFormData } from './schema';

class AuthService {
  // Registrar nuevo usuario
  async register(userData: RegisterFormData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      // Actualizar perfil con nombre
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });

      // Crear documento de usuario en Firestore con rol por defecto
      const newUser: User = {
        id: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        role: 'user', // Rol por defecto
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Error registering user:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // Iniciar sesión
  async login(credentials: LoginFormData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Validar que las credenciales no estén vacías
      if (!credentials.email || !credentials.password) {
        return { 
          success: false, 
          error: 'Email y contraseña son requeridos' 
        };
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        return { 
          success: false, 
          error: 'Formato de email inválido' 
        };
      }

      console.log('Attempting login with email:', credentials.email);
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email.trim(), 
        credentials.password
      );

      console.log('Firebase auth successful, fetching user data...');

      // Obtener datos adicionales del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        console.error('User document not found in Firestore for UID:', userCredential.user.uid);
        
        // Crear documento de usuario si no existe (para usuarios creados fuera del sistema)
        const newUser: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userCredential.user.displayName || 'Usuario',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return { success: true, user: newUser };
      }

      const userData = userDoc.data();
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name || userCredential.user.displayName || 'Usuario',
        role: userData.role || 'user',
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate(),
      };

      console.log('Login successful for user:', user.name);
      return { success: true, user };
    } catch (error: any) {
      console.error('Error logging in:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || firebaseUser.displayName || 'Usuario',
        role: userData.role || 'user',
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate(),
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Verificar si el usuario tiene permisos específicos
  async hasPermission(requiredRole: UserRole): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    // Admin tiene todos los permisos
    if (user.role === 'admin') return true;
    
    // Usuario normal solo puede acceder a funciones de usuario
    return user.role === requiredRole;
  }

  // Verificar si el usuario es administrador
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin' || false;
  }

  // Listener para cambios de autenticación
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name || firebaseUser.displayName || 'Usuario',
              role: userData.role || 'user',
              createdAt: userData.createdAt?.toDate(),
              updatedAt: userData.updatedAt?.toDate(),
            };
            callback(user);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Crear primer administrador (solo para configuración inicial)
  async createAdmin(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar si ya existe un admin
      const adminsQuery = query(
        collection(db, 'users'), 
        where('role', '==', 'admin')
      );
      const existingAdmins = await getDocs(adminsQuery);

      if (!existingAdmins.empty) {
        return { success: false, error: 'Ya existe un administrador en el sistema' };
      }

      // Crear usuario administrador
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      const adminUser: User = {
        id: userCredential.user.uid,
        email,
        name,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...adminUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error creating admin:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // Convertir códigos de error de Firebase a mensajes legibles
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-credential':
        return 'Credenciales inválidas. Verifique su email y contraseña';
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está en uso';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil';
      case 'auth/invalid-email':
        return 'Correo electrónico inválido';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intente más tarde';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifique su internet';
      case 'auth/operation-not-allowed':
        return 'Operación no permitida. Contacte al administrador';
      default:
        console.warn('Unhandled auth error code:', errorCode);
        return 'Error de autenticación. Intente nuevamente';
    }
  }
}

export const authService = new AuthService(); 