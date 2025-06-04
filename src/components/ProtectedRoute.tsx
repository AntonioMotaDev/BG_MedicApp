"use client";

import { FC, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/lib/schema';
import { Loader2, Shield, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requireAuth = true,
  fallbackPath = '/login'
}) => {
  const { user, isLoading, isAuthenticated, hasPermission, logout, sessionTimeRemaining } = useAuth();
  const router = useRouter();

  // Mostrar loader solo en carga inicial
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si se requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <CardTitle>Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Necesita iniciar sesión para acceder a esta página.
            </p>
            <Button onClick={() => router.push(fallbackPath)} className="w-full">
              Ir a Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si se requiere un rol específico y no lo tiene
  if (requiredRole && isAuthenticated && !hasPermission(requiredRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              No tiene permisos para acceder a esta página.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Su rol actual: <Badge variant="outline">{user?.role}</Badge>
              </p>
              <p className="text-sm text-muted-foreground">
                Rol requerido: <Badge variant="outline">{requiredRole}</Badge>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
                Ir al Inicio
              </Button>
              <Button variant="destructive" onClick={logout} className="flex-1">
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido con información de sesión
  return (
    <>
      {/* Indicador discreto de tiempo de sesión */}
      {isAuthenticated && sessionTimeRemaining > 0 && sessionTimeRemaining <= 5 && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-200">
                  Sesión expira en {sessionTimeRemaining} min
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {children}
    </>
  );
};

export default ProtectedRoute; 