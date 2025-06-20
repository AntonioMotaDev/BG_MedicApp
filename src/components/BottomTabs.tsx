"use client";

import { FC, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Users, Calendar, FileText, Settings, User } from 'lucide-react';

interface BottomTabsProps {
  className?: string;
}

const BottomTabs: FC<BottomTabsProps> = ({ className }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const routes = [
    {
      label: 'Inicio',
      icon: Home,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Pacientes',
      icon: Users,
      href: '/',
      active: pathname === '/',
    },
    {
      label: 'Registros',
      icon: FileText,
      href: '/prehospital-records',
      active: pathname === '/prehospital-records',
    },
    {
      label: 'Citas',
      icon: Calendar,
      href: '/appointments',
      active: pathname === '/appointments',
    },
    {
      label: 'Perfil',
      icon: User,
      href: '/profile',
      active: pathname === '/profile',
    },
    {
      label: 'Config',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings',
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t",
      className
    )}>
      <div className="grid grid-cols-6 gap-1 px-2 py-2">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={route.active ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex flex-col items-center justify-center h-12 px-1 py-1 transition-all duration-200",
              route.active && "bg-accent text-accent-foreground font-medium"
            )}
            onClick={() => handleNavigation(route.href)}
          >
            <route.icon className="h-4 w-4 mb-1" />
            <span className="text-xs truncate max-w-full">{route.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BottomTabs; 