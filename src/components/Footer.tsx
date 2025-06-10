import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BG MedicApp. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Versión 1.0.0</span>
            <span>•</span>
            <span>Sistema de Gestión Médica</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 