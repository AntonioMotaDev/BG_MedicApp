"use client";

import { FC, ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from '@/hooks/use-theme';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="es">
      <body className="h-full">
        <ThemeProvider>
          <div className="min-h-screen flex bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 min-h-screen">
              <Header />
              <main className="flex-1 p-4 overflow-y-auto bg-background">
                <div className="max-w-full h-full">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
          </div>
          <Toaster />
          <SonnerToaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
