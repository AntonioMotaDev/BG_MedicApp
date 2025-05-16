
import type {Metadata} from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Changed from Geist
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebarContent from '@/components/AppSidebarContent';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Use standard CSS variable name for Tailwind
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono', // Use standard CSS variable name for Tailwind
});

export const metadata: Metadata = {
  title: {
    default: 'BG MedicApp',
    template: '%s | BG MedicApp',
  },
  description: 'Patient Records Management and App Utilities',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}>
        <SidebarProvider defaultOpen={true}> {/* Sidebar can start open */}
          <div className="flex min-h-screen">
            <Sidebar side="left" collapsible="icon" className="border-r bg-card text-card-foreground">
              <AppSidebarContent />
            </Sidebar>
            <SidebarInset className="flex-1 flex flex-col bg-background">
              {children}
            </SidebarInset>
          </div>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
