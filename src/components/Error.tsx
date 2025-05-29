import { FC } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

const Error: FC<ErrorProps> = ({ 
  message = "Ha ocurrido un error inesperado.", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground text-center">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Intentar de nuevo
        </Button>
      )}
    </div>
  );
};

export default Error; 