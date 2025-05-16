
import type { FC } from 'react';
import { Stethoscope } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import the trigger

const Header: FC = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <SidebarTrigger className="mr-3 h-8 w-8 p-1 text-primary-foreground hover:bg-primary/80 rounded-md md:hidden" /> {/* Ensure trigger is shown on mobile/tablet, can be hidden on larger screens if sidebar is always visible or icon-collapsible */}
          <Stethoscope className="h-8 w-8 mr-2 sm:mr-3" />
          <h1 className="text-xl sm:text-2xl font-bold">BG MedicApp</h1>
        </div>
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
