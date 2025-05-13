
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'; // Added Settings and ChevronDown
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added Avatar

const UserProfileDropdown: FC = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail');
      setUserEmail(email);
      if (email) {
        // Derive a display name, e.g., from the part before @
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

  if (!userEmail) {
    // Or a loader, or nothing if header should hide it when not logged in
    return null; 
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 h-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://picsum.photos/seed/${userName}/40/40`} alt={userName} data-ai-hint="profile avatar" />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{userName}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
