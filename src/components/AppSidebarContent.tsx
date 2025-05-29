'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Settings, LayoutDashboard, Users } from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const AppSidebarContent: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      if (!authStatus) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
    }
    setIsAuthenticated(false); 
    router.push('/login');
  };

  const handleNavigation = (path: string) => {
    // Hide sidebar by adding a class to the body
    document.body.classList.add('sidebar-hidden');
    router.push(path);
  };

  if (!isClient) {
    return null; 
  }

  if (!isAuthenticated && pathname !== '/login') {
     return null; 
  }
  if (pathname === '/login') {
      return null;
  }

  return (
    <>
      <SidebarHeader className="p-2 sm:p-3 border-b border-sidebar-border flex items-center justify-center h-[60px] sm:h-[73px]">
      </SidebarHeader>

      <SidebarMenu className="flex-grow p-1 sm:p-2 space-y-0.5 sm:space-y-1">
         <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={() => handleNavigation('/main-menu')} 
            tooltip="Main Menu" 
            isActive={pathname === '/main-menu'} 
            className="text-sm sm:text-base"
          >
            <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" /> 
            <span className="group-data-[collapsible=icon]:hidden">Main Menu</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={() => handleNavigation('/')} 
            tooltip="Manage Patients" 
            isActive={pathname === '/'} 
            className="text-sm sm:text-base"
          >
            <Users className="h-4 w-4 sm:h-5 sm:w-5" /> 
            <span className="group-data-[collapsible=icon]:hidden">Patients</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={() => handleNavigation('/profile')} 
            tooltip="User Profile" 
            isActive={pathname === '/profile'} 
            className="text-sm sm:text-base"
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Profile</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <div className="p-1 sm:p-2 mt-auto border-t border-sidebar-border">
        <SidebarMenuItem>
            <SidebarMenuButton 
                onClick={handleLogout} 
                tooltip="Sign Out"
                className="w-full text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10 text-sm sm:text-base"
            >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </>
  );
};

export default AppSidebarContent;
