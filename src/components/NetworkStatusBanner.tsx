"use client";

import { FC } from 'react';
import { Wifi, WifiOff, Cloud, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NetworkStatusBannerProps {
  isOnline: boolean;
  wasOffline: boolean;
  syncStatus: {
    pendingChanges: number;
    isOnline: boolean;
  };
  onForceSync?: () => void;
}

const NetworkStatusBanner: FC<NetworkStatusBannerProps> = ({
  isOnline,
  wasOffline,
  syncStatus,
  onForceSync
}) => {
  // Don't show banner if online and no pending changes
  if (isOnline && syncStatus.pendingChanges === 0 && !wasOffline) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return "destructive";
    if (syncStatus.pendingChanges > 0) return "warning";
    return "default";
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (syncStatus.pendingChanges > 0) return <Cloud className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusMessage = () => {
    if (!isOnline) {
      return "Sin conexión a internet. Los cambios se guardarán localmente.";
    }
    if (syncStatus.pendingChanges > 0) {
      return `${syncStatus.pendingChanges} cambio${syncStatus.pendingChanges === 1 ? '' : 's'} pendiente${syncStatus.pendingChanges === 1 ? '' : 's'} de sincronización.`;
    }
    if (wasOffline) {
      return "Conexión restaurada. Datos sincronizados.";
    }
    return "Todos los datos están sincronizados.";
  };

  return (
    <Alert variant={getStatusColor() as any} className="mb-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <AlertDescription className="mb-0">
            {getStatusMessage()}
          </AlertDescription>
          
          {/* Status badges */}
          <div className="flex gap-2 ml-2">
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  En línea
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Sin conexión
                </>
              )}
            </Badge>
            
            {syncStatus.pendingChanges > 0 && (
              <Badge variant="outline" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                {syncStatus.pendingChanges} pendiente{syncStatus.pendingChanges === 1 ? '' : 's'}
              </Badge>
            )}
          </div>
        </div>

        {/* Sync button */}
        {isOnline && syncStatus.pendingChanges > 0 && onForceSync && (
          <Button
            size="sm"
            variant="outline"
            onClick={onForceSync}
            className="ml-4 flex-shrink-0"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Sincronizar
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default NetworkStatusBanner; 