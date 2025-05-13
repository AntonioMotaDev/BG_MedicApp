
import type { FC } from 'react';
import { Stethoscope } from 'lucide-react';

const Header: FC = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center">
        <Stethoscope className="h-8 w-8 mr-3" />
        <h1 className="text-2xl font-bold">BG MedicApp</h1>
      </div>
    </header>
  );
};

export default Header;

