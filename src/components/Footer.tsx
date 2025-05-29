import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-2 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BG MedicApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 