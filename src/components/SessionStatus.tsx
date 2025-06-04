"use client";

import { useAuth } from '@/hooks/useAuth';
import { Clock, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SessionStatusProps {
  showInHeader?: boolean;
  minimal?: boolean;
}

export default function SessionStatus({ showInHeader = false, minimal = false }: SessionStatusProps) {
  const { user, isAuthenticated, sessionTimeRemaining, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Versión minimal para header
  if (minimal) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{sessionTimeRemaining}m</span>
      </div>
    );
  }

  // Versión completa con popover
  if (showInHeader) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{user.name}</span>
            <Badge variant="outline" className="hidden sm:flex">
              <Clock className="h-3 w-3 mr-1" />
              {sessionTimeRemaining}m
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Información de Sesión</h4>
              <p className="text-sm text-muted-foreground">
                Detalles de su sesión actual
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usuario:</span>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rol:</span>
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tiempo restante:</span>
                <Badge 
                  variant={sessionTimeRemaining <= 5 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {sessionTimeRemaining} minutos
                </Badge>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="w-full"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Versión standalone (card independiente)
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Estado de Sesión</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Usuario:</span>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rol:</span>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sesión expira en:</span>
              <Badge 
                variant={sessionTimeRemaining <= 5 ? "destructive" : "secondary"}
                className="text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                {sessionTimeRemaining} min
              </Badge>
            </div>
          </div>

          {sessionTimeRemaining <= 10 && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded-md border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Su sesión expirará pronto. Cualquier actividad la renovará automáticamente.
              </p>
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="w-full mt-4"
          >
            Cerrar Sesión
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 