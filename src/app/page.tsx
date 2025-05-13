
import type { Metadata } from 'next';
import { getPatients } from "@/app/actions";
import PatientManagementPage from "@/components/PatientManagementPage"; // Client component
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'BG MedicApp - Patient Records',
  description: 'Manage patient records efficiently and securely.',
};

// This is a Server Component
export default async function Home() {
  const initialPatients = await getPatients();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
         {/* PatientManagementPage is a client component that handles all interactions */}
        <PatientManagementPage initialPatients={initialPatients} />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
      </footer>
    </div>
  );
}

