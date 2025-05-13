
import type { Metadata } from 'next';
import { getPatients } from "@/app/actions";
import Header from '@/components/Header'; // Header is part of this page's structure
import DashboardPageContent from '@/components/DashboardPageContent';

export const metadata: Metadata = {
  title: 'BG MedicApp - Patient Records',
  description: 'Manage patient records efficiently and securely.',
};

// This remains a Server Component
export default async function Home() {
  const initialPatients = await getPatients();

  return (
    // This div structure will be placed inside SidebarInset by RootLayout
    <div className="flex flex-col flex-1"> {/* Ensure it takes available vertical space in SidebarInset's flex col */}
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <DashboardPageContent initialPatients={initialPatients} />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
      </footer>
    </div>
  );
}
