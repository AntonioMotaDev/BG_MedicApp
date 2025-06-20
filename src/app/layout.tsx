"use client";

import { FC, ReactNode, useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import BottomTabs from '@/components/BottomTabs';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from '@/hooks/use-theme';
import './globals.css';
import '@/styles/print.css';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkScreenOrientation = () => {
      const isPortraitOrientation = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitOrientation);
    };

    checkScreenOrientation();
    window.addEventListener('resize', checkScreenOrientation);
    window.addEventListener('orientationchange', checkScreenOrientation);
    
    return () => {
      window.removeEventListener('resize', checkScreenOrientation);
      window.removeEventListener('orientationchange', checkScreenOrientation);
    };
  }, [isClient]);

  return (
    <html lang="es">
      <body className="h-full">
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <div className="flex flex-1 min-h-0">
              <Sidebar />
              <div className="flex flex-col flex-1 min-h-0">
                <main className={`flex-1 p-4 overflow-y-auto bg-background ${isClient && isPortrait ? 'pb-20' : ''}`}>
                  <div className="max-w-full h-full">
                    {children}
                  </div>
                </main>
                <Footer className={isClient && isPortrait ? 'mb-16' : ''} />
              </div>
            </div>
          </div>
          {isClient && isPortrait && <BottomTabs />}
          <Toaster />
          <SonnerToaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
