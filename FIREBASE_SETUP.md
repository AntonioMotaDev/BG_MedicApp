# Configuración de Firebase - BG MedicApp

## Error: auth/invalid-credential

Si está viendo este error, significa que las credenciales de Firebase no están configuradas correctamente. Siga estos pasos para solucionarlo:

## 1. Configuración de Firebase Console

### Crear un proyecto Firebase (si no existe):
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Nombra tu proyecto (ej: "bg-medicapp")
4. Completa la configuración

### Habilitar Authentication:
1. En tu proyecto, ve a "Authentication" > "Get started"
2. Ve a la pestaña "Sign-in method"
3. Habilita "Email/Password"
4. Guarda los cambios

### Configurar Firestore:
1. Ve a "Firestore Database" > "Create database"
2. Selecciona "Start in test mode" (por ahora)
3. Elige una ubicación

## 2. Obtener las credenciales

1. Ve a "Project settings" (ícono de engranaje)
2. Baja hasta "Your apps"
3. Haz clic en "Add app" > Web (ícono </>)
4. Nombra tu app (ej: "bg-medicapp-web")
5. Copia las credenciales que aparecen

## 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### Ejemplo real:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBNlYH01_9Hc5s2MgKUq2TLiiwT8xvdabc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bg-medicapp-123.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bg-medicapp-123
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bg-medicapp-123.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789jkl0
```

## 4. Reiniciar el servidor

Después de configurar las variables de entorno:

```bash
npm run dev
```

## 5. Crear el primer administrador

1. Ve a la página de login
2. Haz clic en "Crear Admin Demo"
3. Esto creará la cuenta: admin@medicapp.com / admin123456

## Troubleshooting Común

### Error: "Firebase configuration error: Missing environment variables"
- Verifica que el archivo `.env.local` existe
- Verifica que todas las variables están definidas
- Reinicia el servidor de desarrollo

### Error: "auth/invalid-credential" al hacer login
- Verifica que el usuario existe en Firebase Auth
- Crea el admin demo primero
- Verifica que las credenciales sean correctas

### Error: "User document not found in Firestore"
- Normal en el primer login, el sistema creará el documento automáticamente
- Verifica que Firestore esté configurado

### Error: "Operation not allowed"
- Ve a Firebase Console > Authentication > Sign-in method
- Verifica que "Email/Password" esté habilitado

## Reglas de Firestore Recomendadas

Ve a Firestore > Rules y usa estas reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Verificación Rápida

Para verificar que todo funciona:

1. Abre la consola del navegador (F12)
2. Ve a la página de login
3. Intenta hacer login
4. Verifica los logs de consola para errores específicos

Si sigues viendo errores, revisa los logs de la consola para más detalles específicos. 