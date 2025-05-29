"use client";

import { FC, ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="es">
      <body>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
            <Footer />
          </div>
          </div>
          <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
