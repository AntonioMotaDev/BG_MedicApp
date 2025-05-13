
'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { LogOut, User, Settings, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarFooter, // Not used for now
} from '@/components/ui/sidebar';

const AppSidebarContent: FC = () => {
  const router = useRouter();
  const pathname = usePathname(); // For isActive state on navigation buttons
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [isClient, setIsClient] = useState(false); // To prevent hydration mismatch

  useEffect(() => {
    setIsClient(true); // Component has mounted on client
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      if (!authStatus) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      const email = localStorage.getItem('userEmail');
      setUserEmail(email);
      if (email) {
        setUserName(email.split('@')[0] || 'User');
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
    }
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  // Wait for client-side mount to check auth, prevents hydration issues
  if (!isClient) {
    return null; 
  }

  if (!isAuthenticated) {
     return null; // Or a login button if sidebar should be visible for non-auth users
  }


  return (
    <>
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full h-auto justify-start items-center space-x-3 p-2 text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
              <Avatar className="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 shrink-0">
                <AvatarImage src={`https://picsum.photos/seed/${userName}/80/80`} alt={userName} data-ai-hint="user avatar" />
                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-grow overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-sm text-sidebar-foreground truncate w-full">{userName}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{userEmail}</span>
              </div>
              <ChevronDown className="ml-auto h-4 w-4 opacity-70 shrink-0 group-data-[collapsible=icon]:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-56 min-w-[calc(var(--sidebar-width)_-_1.5rem)] md:min-w-56 z-20"> {/* Ensure z-index if needed */}
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarMenu className="flex-grow p-2 space-y-1">
         <SidebarMenuItem>
          <SidebarMenuButton href="/" tooltip="Dashboard" isActive={pathname === '/'}>
            <LayoutDashboard /> 
            <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton href="/profile" tooltip="User Profile" isActive={pathname === '/profile'}>
            <User />
            <span className="group-data-[collapsible=icon]:hidden">Profile</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
};

export default AppSidebarContent;
