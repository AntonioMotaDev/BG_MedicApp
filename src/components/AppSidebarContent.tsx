
'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Settings, LayoutDashboard, Users } from 'lucide-react'; // Removed ChevronDown
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Avatar not needed here anymore
// import { Button } from '@/components/ui/button'; // Button for dropdown trigger not needed
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'; // Dropdown components not needed here
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
  // const [userEmail, setUserEmail] = useState<string | null>(null); // Not needed for display here
  // const [userName, setUserName] = useState<string>('User'); // Not needed for display here
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
      // const email = localStorage.getItem('userEmail'); // Data fetching not needed for display here
      // setUserEmail(email);
      // if (email) {
      //   setUserName(email.split('@')[0] || 'User');
      // }
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

  const handleProfile = () => {
    router.push('/profile');
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
      {/* SidebarHeader is kept for structure, but the dropdown is removed. 
          You can add a logo or app name here if desired in the future. */}
      <SidebarHeader className="p-3 border-b border-sidebar-border flex items-center justify-center h-[73px]">
        {/* Content previously here (user dropdown) has been removed as per request. */}
        {/* You could place a small logo or app title here if the sidebar is collapsed, for example. */}
      </SidebarHeader>

      <SidebarMenu className="flex-grow p-2 space-y-1">
         <SidebarMenuItem>
          <SidebarMenuButton href="/main-menu" tooltip="Main Menu" isActive={pathname === '/main-menu'}>
            <LayoutDashboard /> 
            <span className="group-data-[collapsible=icon]:hidden">Main Menu</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton href="/" tooltip="Manage Patients" isActive={pathname === '/'}>
            <Users /> 
            <span className="group-data-[collapsible=icon]:hidden">Patients</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton href="/profile" tooltip="User Profile" isActive={pathname === '/profile'}>
            <User />
            <span className="group-data-[collapsible=icon]:hidden">Profile</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Moved Sign Out to be a direct button in the sidebar menu for clarity if preferred,
          or it can be accessed via the UserProfileDropdown in the main Header.
          For now, I'll keep a dedicated Sign Out button at the bottom of the sidebar menu.
      */}
      <div className="p-2 mt-auto border-t border-sidebar-border">
        <SidebarMenuItem>
            <SidebarMenuButton 
                onClick={handleLogout} 
                tooltip="Sign Out"
                className="w-full text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10"
            >
                <LogOut />
                <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </>
  );
};

export default AppSidebarContent;
