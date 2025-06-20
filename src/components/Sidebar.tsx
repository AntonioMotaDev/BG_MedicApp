"use client";

import { FC, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Home, Users, Calendar, FileText, Settings, User } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar: FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if mobile and portrait orientation
  useEffect(() => {
    if (!isClient) return;

    const checkScreenOrientation = () => {
      const isMobileSize = window.innerWidth < 768;
      const isPortraitOrientation = window.innerHeight > window.innerWidth;
      
      setIsMobile(isMobileSize);
      setIsPortrait(isPortraitOrientation);
      
      if (isMobileSize) {
        setIsCollapsed(true);
      }
    };

    checkScreenOrientation();
    window.addEventListener('resize', checkScreenOrientation);
    window.addEventListener('orientationchange', checkScreenOrientation);
    
    return () => {
      window.removeEventListener('resize', checkScreenOrientation);
      window.removeEventListener('orientationchange', checkScreenOrientation);
    };
  }, [isClient]);

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
      label: 'Registros   ',
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
      label: 'Configuración',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings',
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  // Hide sidebar in portrait orientation, but only after client-side hydration
  if (isClient && isPortrait) {
    return null;
  }

  // Show a placeholder during SSR to match initial client render
  if (!isClient) {
    return (
      <div className={cn(
        "relative border-r bg-background transition-all duration-300 shrink-0 h-full w-16",
        className
      )}>
        <div className="h-full py-6">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <div className="space-y-1">
                {routes.map((route) => (
                  <div
                    key={route.href}
                    className="w-full h-10 bg-muted/20 rounded-md animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative border-r bg-background transition-all duration-300 shrink-0 h-full",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 z-50 h-8 w-8 rounded-full border bg-background shadow-md hover:shadow-lg transition-shadow"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      
      <ScrollArea className="h-full py-6">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    isCollapsed ? "px-2" : "px-4",
                    route.active && "bg-accent text-accent-foreground font-medium"
                  )}
                  onClick={() => handleNavigation(route.href)}
                  title={isCollapsed ? route.label : undefined}
                >
                  <route.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isCollapsed ? "mr-0" : "mr-2"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate">{route.label}</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar; 