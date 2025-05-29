import { FC } from 'react';

const Loading: FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
};

export default Loading; 