# Sistema de Autenticación y Permisos - BG MedicApp

## Descripción General

Se ha implementado un sistema completo de autenticación y autorización usando Firebase Auth con roles de usuario para controlar el acceso a las funcionalidades de la aplicación.

## Características Implementadas

### 🔐 Autenticación
- **Firebase Authentication** integrado
- Login/Logout con email y contraseña
- Registro de nuevos usuarios
- Validación de formularios con Zod
- Manejo de errores en español
- Persistencia de sesión

### 👥 Sistema de Roles
- **Usuario** (`user`): Acceso limitado a funcionalidades básicas
- **Administrador** (`admin`): Acceso completo a todas las funcionalidades

### 🛡️ Protección de Rutas
- Componente `ProtectedRoute` para proteger páginas
- Verificación automática de autenticación
- Control de permisos por rol
- Redirección automática a login si no está autenticado
- Mensajes de acceso denegado para permisos insuficientes

### 🎯 Permisos por Funcionalidad

#### Solo usuarios autenticados:
- Ver pacientes
- Acceder a reportes básicos
- Ver registros médicos

#### Solo administradores:
- Crear/Editar/Eliminar pacientes
- Crear nuevos registros médicos
- Acceso a estadísticas avanzadas
- Gestión del sistema

## Estructura de Archivos

```
src/
├── lib/
│   ├── authService.ts          # Servicio principal de autenticación
│   ├── firebase.ts             # Configuración de Firebase
│   └── schema.ts               # Esquemas de validación y tipos
├── hooks/
│   └── useAuth.ts              # Hook personalizado para autenticación
├── components/
│   ├── ProtectedRoute.tsx      # Componente para proteger rutas
│   └── Header.tsx              # Header con info de usuario y logout
└── app/
    ├── login/page.tsx          # Página de login
    ├── register/page.tsx       # Página de registro
    └── page.tsx                # Página principal protegida
```

## Uso del Sistema

### Para Desarrolladores

#### 1. Proteger una página completa:
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      {/* Contenido de la página */}
    </ProtectedRoute>
  );
}
```

#### 2. Proteger por rol específico:
```tsx
<ProtectedRoute requireAuth={true} requiredRole="admin">
  {/* Solo administradores pueden ver esto */}
</ProtectedRoute>
```

#### 3. Usar el hook de autenticación:
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Hola, {user?.name}</p>}
      {isAdmin && <p>Eres administrador</p>}
    </div>
  );
}
```

### Para Usuarios

#### Credenciales de Prueba:
- **Administrador Demo:**
  - Email: `admin@medicapp.com`
  - Password: `admin123456`

#### Para crear el primer administrador:
1. Ve a la página de login
2. Haz clic en "Crear Admin Demo"
3. Se creará automáticamente si no existe ningún admin

#### Para usuarios normales:
1. Ve a la página de registro
2. Completa el formulario
3. Tu cuenta tendrá rol de "usuario" por defecto

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## Flujo de Autenticación

1. **Usuario no autenticado:**
   - Accede a página protegida
   - Se redirige automáticamente a `/login`
   - Puede registrarse en `/register`

2. **Usuario autenticado con permisos insuficientes:**
   - Ve mensaje de "Acceso Denegado"
   - Se muestra su rol actual y el requerido
   - Opciones para ir al inicio o cerrar sesión

3. **Usuario autenticado con permisos correctos:**
   - Acceso normal a la funcionalidad
   - Header muestra información del usuario
   - Badge indica si es administrador

## Seguridad Implementada

- ✅ Validación de formularios en cliente y servidor
- ✅ Manejo seguro de errores sin exponer información sensible
- ✅ Verificación de permisos en tiempo real
- ✅ Sesiones manejadas por Firebase Auth
- ✅ Tokens JWT automáticos
- ✅ Protección contra acceso no autorizado

## Próximas Mejoras

- [ ] Reset de contraseña por email
- [ ] Verificación de email al registrarse
- [ ] Autenticación con Google/Facebook
- [ ] Roles más granulares (enfermero, doctor, etc.)
- [ ] Logs de auditoría de accesos
- [ ] Configuración de permisos por pantalla
- [ ] Bloqueo de cuentas por intentos fallidos

## Troubleshooting

### Error: "User data not found"
- Verifica que el usuario existe en Firestore collection `users`
- El admin demo se crea automáticamente con datos completos

### Error: "Ya existe un administrador"
- Solo se puede crear un admin demo si no existe ninguno
- Para crear más admins, hazlo manualmente en Firestore

### Problemas de permisos:
- Verifica que el usuario tenga el rol correcto en Firestore
- Los roles válidos son: `user` y `admin`
- Los admins tienen acceso a todo automáticamente 