
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebarContent from '@/components/AppSidebarContent'; // New component for sidebar's content

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BG MedicApp',
  description: 'Patient Records Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen={false}> {/* Sidebar can start collapsed or based on cookie */}
          <div className="flex min-h-screen"> {/* Ensures full height and flex layout */}
            <Sidebar side="left" collapsible="icon" className="border-r bg-card text-card-foreground"> {/* Sidebar component itself */}
              <AppSidebarContent />
            </Sidebar>
            <SidebarInset className="flex-1 flex flex-col bg-background"> {/* Main content area that resizes */}
              {/* children from page.tsx (which includes Header, main, footer) goes here */}
              {children}
            </SidebarInset>
          </div>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
